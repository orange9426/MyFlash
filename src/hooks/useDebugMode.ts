import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CLICKS_NEEDED = 5;
const STORAGE_KEY = "staircase-debug-active";

export function useDebugMode() {
  const [active, setActive] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const clickCount = useRef(0);
  const resetTimer = useRef<number | null>(null);
  const buffer = useRef<string[]>([]);

  // 使用 ref 确保 appendLog 读取最新的 active，避免闭包陈旧
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const appendLog = useCallback((line: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${line}`;
    if (activeRef.current) setLogs((prev) => [...prev.slice(-199), entry]);
    else {
      buffer.current.push(entry);
      if (buffer.current.length > 200) buffer.current.shift();
    }
  }, []);

  const activate = useCallback(() => {
    setActive(true);
    setVisible(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 忽略存储失败
    }
    if (buffer.current.length) {
      setLogs(buffer.current.slice(-200));
      buffer.current = [];
    }
    toast.success("调试已开启");
  }, []);

  const deactivate = useCallback(() => {
    setActive(false);
    setVisible(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 忽略存储失败
    }
    toast("调试已关闭");
  }, []);

  const handleTitleClick = useCallback(() => {
    if (active) {
      setVisible((v) => !v);
      return;
    }
    clickCount.current += 1;
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    // 3 秒内未凑齐则清零，避免误触
    resetTimer.current = window.setTimeout(() => {
      clickCount.current = 0;
    }, 3000);

    if (clickCount.current >= CLICKS_NEEDED) {
      clickCount.current = 0;
      activate();
    } else if (clickCount.current >= 3) {
      toast(`再点 ${CLICKS_NEEDED - clickCount.current} 次开启调试`, { duration: 1000 });
    }
  }, [active, activate]);

  const origRef = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  } | null>(null);

  useEffect(() => {
    if (!origRef.current) {
      origRef.current = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      };
    }
    const orig = origRef.current;
    console.log = (...a: unknown[]) => {
      orig.log(...a);
      appendLog(a.map(String).join(" "));
    };
    console.warn = (...a: unknown[]) => {
      orig.warn(...a);
      appendLog(`WARN ${a.map(String).join(" ")}`);
    };
    console.error = (...a: unknown[]) => {
      orig.error(...a);
      appendLog(`ERR ${a.map(String).join(" ")}`);
    };
    return () => {
      if (origRef.current) {
        console.log = origRef.current.log;
        console.warn = origRef.current.warn;
        console.error = origRef.current.error;
      }
    };
    // appendLog 是稳定的（依赖 activeRef），不应因 active 变化而重复 patch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    active,
    visible,
    logs,
    handleTitleClick,
    deactivate,
    clearLogs: () => setLogs([]),
    hideTerminal: () => setVisible(false),
    copyLogs: async () => {
      await navigator.clipboard.writeText(logs.join("\n"));
      toast.success("日志已复制");
    },
  };
}

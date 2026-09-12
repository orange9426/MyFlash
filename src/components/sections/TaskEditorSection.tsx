import { TaskPreview } from "@/components/TaskPreview";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { TaskVariablesEditor } from "@/components/TaskVariablesEditor";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTasks } from "@/lib/game/constants";
import { getTaskNeeds } from "@/lib/game/advisor";
import { useGameStore } from "@/lib/game/store";
import { customId, EDITOR_ITEMS, importTaskPack, loadTaskPacks, MAX_IMPORT_BYTES, copyTaskAfter, moveEditorTask, newTask, newTaskPack, previewTaskPack, saveTaskPacks, taskPackError, WEAR_LABELS, type ImportPreview, type TaskPack } from "@/lib/game/customTasks";
import type { Task, TaskNeeds, WearRole } from "@/lib/game/types";

const field = "w-full rounded-md border bg-background p-2 text-sm";
const message = (error: unknown) => error instanceof Error ? error.message : "操作失败，请重试";

export function TaskEditorSection() {
  const [loaded] = useState(() => {
    try { return { packs: loadTaskPacks(), error: "" }; }
    catch (error) { return { packs: [], error: message(error) }; }
  });
  const [packs, setPacks] = useState<TaskPack[]>(loaded.packs);
  const [draft, setDraft] = useState<TaskPack | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);
  const [orderNotice, setOrderNotice] = useState("");
  const [tab, setTab] = useState("custom");
  const [builtinKey, setBuiltinKey] = useState("male:normal:floor");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [reading, setReading] = useState(false);
  const [json, setJson] = useState("");
  const confirm = useGameStore(s => s.requestConfirm);
  const setView = useGameStore(s => s.setView);
  const phase = useGameStore(s => s.state.gamePhase);
  const returnView = phase === "shop" ? "shop" : phase === "adventure" ? "game" : phase === "ended" ? "end" : "start";
  const [persona, mode, type] = builtinKey.split(":") as [TaskPack["persona"], TaskPack["mode"], TaskPack["type"]];
  const builtin = getTasks(persona, mode)[type === "floor" ? "楼层任务" : "上楼任务"];
  const write = (next: TaskPack[]) => {
    try { saveTaskPacks(next); setPacks(next); toast.success("已保存，从下一局生效"); return true; }
    catch (error) { toast.error(message(error)); return false; }
  };
  const discard = async () => !draft || await confirm("放弃尚未保存的编辑？", { yesText: "放弃编辑" });
  const copyBuiltin = (tasks: Task[]) => {
    setDraft({ ...newTaskPack(), name: "内置任务副本", persona, mode, type,
      tasks: tasks.map(task => ({ ...structuredClone(task), id: customId(), needs: getTaskNeeds(task) })) });
  };
  const updateTask = (index: number, task: Task) => {
    if (draft) setDraft({ ...draft, tasks: draft.tasks.map((value, i) => i === index ? task : value) });
  };
  const moveTask = (id: string, targetId: string) => {
    if (!draft) return;
    const tasks = moveEditorTask(draft.tasks, id, targetId);
    setDraft({ ...draft, tasks });
    setOrderNotice("已移至第 " + (tasks.findIndex(task => task.id === id) + 1) + " 项，保存后生效");
  };
  const exportPack = (pack: TaskPack) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "task-pack.json"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="space-y-5">
    <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">任务编辑器</h1>
      <Button variant="outline" onClick={async () => { if (await discard()) setView(returnView); }}>返回{phase === "initial" ? "开局" : "当前局"}</Button></div>
    <p className="text-sm text-muted-foreground">自定义任务独立保存在此浏览器中，重新开局或清除当前进度会保留。保存后从下一局生效。可导出文件备份。</p>
    {loaded.error ? <p role="alert">本地任务包读取失败：{loaded.error}。为保护原数据，暂不能保存，请检查浏览器存储。</p> : draft ? <div className="space-y-4 rounded-xl border p-4">
      <h2 className="font-semibold">编辑任务包 · {draft.tasks.length} 项任务</h2>
      <label className="block space-y-1">任务包名称<Input maxLength={80} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label>角色<select className={field} value={draft.persona} onChange={e => setDraft({ ...draft, persona: e.target.value as TaskPack["persona"] })}><option value="male">男生</option><option value="female">女生</option></select></label>
        <label>难度<select className={field} value={draft.mode} onChange={e => setDraft({ ...draft, mode: e.target.value as TaskPack["mode"] })}><option value="normal">普通</option><option value="hell">地狱</option></select></label>
        <label>任务类型<select className={field} value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value as TaskPack["type"] })}><option value="floor">楼层任务</option><option value="climb">上楼任务</option></select></label>
      </div>
      <p className="text-xs text-muted-foreground">拖动任务左侧手柄排序，或使用上下箭头。复制会插入在原任务下方。</p>
      <p role="status" className="sr-only">{orderNotice}</p>
      {draft.tasks.map((task, index) => <details key={task.id} open={draft.tasks.length === 1 || undefined}
        onDragOver={event => { if (draggedId && draggedId !== task.id) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropId(task.id); } }}
        onDragLeave={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDropId(null); }}
        onDrop={event => { event.preventDefault(); if (draggedId) moveTask(draggedId, task.id); setDraggedId(null); setDropId(null); }}
        className={`rounded-lg border p-3 ${dropId === task.id ? "border-primary ring-1 ring-primary" : ""} ${draggedId === task.id ? "opacity-50" : ""}`}>
        <summary className="cursor-pointer font-medium">
          <span className="inline-flex w-[calc(100%-1.5rem)] items-center gap-2 align-middle">
            <button type="button" draggable aria-label={`拖动第 ${index + 1} 项排序`} title="拖动排序"
              className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
              onClick={event => event.preventDefault()}
              onDragStart={event => { event.dataTransfer.setData("text/plain", task.id); event.dataTransfer.effectAllowed = "move"; setDraggedId(task.id); }}
              onDragEnd={() => { setDraggedId(null); setDropId(null); }}><GripVertical className="size-4" /></button>
            <span className="min-w-0 flex-1 truncate">{index + 1}. {task.name || "未命名任务"} · {task.baseScore} 分</span>
            <Button size="icon" variant="ghost" className="size-7 shrink-0" disabled={index === 0} aria-label={`上移第 ${index + 1} 项`}
              onClick={event => { event.preventDefault(); moveTask(task.id, draft.tasks[index - 1].id); }}><ArrowUp className="size-3.5" /></Button>
            <Button size="icon" variant="ghost" className="size-7 shrink-0" disabled={index === draft.tasks.length - 1} aria-label={`下移第 ${index + 1} 项`}
              onClick={event => { event.preventDefault(); moveTask(task.id, draft.tasks[index + 1].id); }}><ArrowDown className="size-3.5" /></Button>
          </span>
        </summary>
        <div className="mt-3 space-y-3"><div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3"><label className="block">标题<Input value={task.name} maxLength={80} onChange={e => updateTask(index, { ...task, name: e.target.value })} /></label><label className="block">基础积分<Input type="number" min={0} max={100} value={Number.isFinite(task.baseScore) ? task.baseScore : ""} onChange={e => updateTask(index, { ...task, baseScore: e.target.value === "" ? NaN : Number(e.target.value) })} /></label></div>
          <label className="block">任务描述<textarea className={field} rows={4} maxLength={4000} value={task.description} onChange={e => updateTask(index, { ...task, description: e.target.value })} /></label>
          <TaskVariablesEditor task={task} onChange={next => updateTask(index, next)} />
          <NeedsEditor task={task} onChange={next => updateTask(index, next)} />
          <TaskPreview task={task} />
          <div className="flex gap-2"><Button variant="outline" disabled={draft.tasks.length >= 200} onClick={() => setDraft({ ...draft, tasks: copyTaskAfter(draft.tasks, task.id) })}>复制任务</Button>
          <Button variant="destructive" onClick={async () => { if (await confirm("删除这个任务？保存任务包后生效。")) setDraft({ ...draft, tasks: draft.tasks.filter(t => t.id !== task.id) }); }}>删除任务</Button></div>
        </div></details>)}
      <Button variant="outline" disabled={draft.tasks.length >= 200} onClick={() => setDraft({ ...draft, tasks: [...draft.tasks, newTask()] })}>新建任务</Button>
      {taskPackError(draft) && <p role="status" className="text-sm text-destructive">{taskPackError(draft)}</p>}
      <div className="sticky bottom-2 flex gap-2 rounded-lg border bg-background p-3"><Button disabled={!!taskPackError(draft)} onClick={() => { if (write([...packs.filter(p => p.id !== draft.id), draft])) setDraft(null); }}>保存任务包</Button>
        <Button variant="outline" onClick={async () => { if (await discard()) setDraft(null); }}>取消</Button></div>
    </div> : <>
      <div className="flex flex-wrap gap-2" aria-label="任务库">
        {[["custom", "我的任务包"], ["builtin", "内置任务"], ["import", "导入任务包"]].map(([key, label]) => <Button key={key} variant={tab === key ? "default" : "outline"} onClick={() => setTab(key)}>{label}</Button>)}
      </div>
      {tab === "custom" && <div className="space-y-3"><Button onClick={() => setDraft({ ...newTaskPack(), tasks: [newTask()] })}>新建任务包</Button>
        {!packs.length && <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">还没有自定义任务。可以新建，也可以从内置任务复制后编辑。</p>}
        {packs.map(pack => <article key={pack.id} className="space-y-3 rounded-xl border p-4"><h2 className="font-semibold break-words">{pack.name}</h2>
          <p className="text-sm text-muted-foreground">{pack.persona === "male" ? "男生" : "女生"} · {pack.mode === "normal" ? "普通" : "地狱"} · {pack.type === "floor" ? "楼层任务" : "上楼任务"} · {pack.tasks.length} 项</p>
          <div className="flex flex-wrap gap-2"><Button onClick={() => setDraft(structuredClone(pack))}>编辑</Button><Button variant="outline" onClick={() => setDraft(importTaskPack(pack, packs))}>复制</Button><Button variant="outline" onClick={() => exportPack(pack)}>导出</Button><Button variant="destructive" onClick={async () => { if (await confirm(`删除任务包“${pack.name}”及其中 ${pack.tasks.length} 个任务？当前局不受影响。`)) write(packs.filter(p => p.id !== pack.id)); }}>删除</Button></div></article>)}
      </div>}
      {tab === "builtin" && <div className="space-y-3"><label className="block">查看内置任务<select className={field} value={builtinKey} onChange={e => setBuiltinKey(e.target.value)}>{["male", "female"].flatMap(p => ["normal", "hell"].flatMap(m => ["floor", "climb"].map(t => <option key={`${p}:${m}:${t}`} value={`${p}:${m}:${t}`}>{p === "male" ? "男生" : "女生"} · {m === "normal" ? "普通" : "地狱"} · {t === "floor" ? "楼层任务" : "上楼任务"}</option>)))}</select></label>
        <p className="text-sm text-muted-foreground">内置任务只读，共 {builtin.length} 项。复制会创建独立的自定义版本。</p><Button onClick={() => copyBuiltin(builtin)}>复制整包后编辑</Button>
        {builtin.map(task => <details key={task.id} className="rounded-lg border p-3"><summary>{task.name} · {task.baseScore} 分</summary><p className="my-3 whitespace-pre-wrap text-sm">{task.description}</p><Button variant="outline" onClick={() => copyBuiltin([task])}>复制后编辑</Button></details>)}
      </div>}
      {tab === "import" && <div className="space-y-3"><p className="text-sm">选择导出的 JSON 文件或粘贴内容，预览通过后再确认保存。导入会创建新副本。</p>
        <label className="block">选择文件<Input type="file" accept=".json,application/json" disabled={reading} onChange={async e => { const file = e.target.files?.[0]; setPreview(null); if (!file) return; setReading(true); try { if (file.size > MAX_IMPORT_BYTES) throw new Error("任务包文件不能超过 2 MB"); const text = await file.text(); setJson(text); setPreview(previewTaskPack(text)); } catch (error) { setJson(""); setPreview({ count: 0, errors: [message(error)], pack: null }); } finally { setReading(false); } }} /></label>
        <label className="block">JSON 内容<textarea className={field} rows={7} value={json} disabled={reading} onChange={e => { setJson(e.target.value); setPreview(null); }} /></label>
        <Button disabled={reading} onClick={() => setPreview(previewTaskPack(json))}>预览导入</Button>
        {preview && <div className="space-y-2 rounded-lg border p-4" role="status"><p>任务数量：{preview.count} · 错误：{preview.errors.length}</p>{preview.pack && <p>{preview.pack.name} · {preview.pack.persona === "male" ? "男生" : "女生"} · {preview.pack.mode === "normal" ? "普通" : "地狱"} · {preview.pack.type === "floor" ? "楼层任务" : "上楼任务"}</p>}
          {preview.errors.length > 0 && <ul className="list-inside list-disc text-sm text-destructive">{preview.errors.map((error, i) => <li key={i}>{error}</li>)}</ul>}
          <Button disabled={!preview.pack || reading} onClick={() => { if (preview.pack && write([...packs, importTaskPack(preview.pack, packs)])) { setPreview(null); setJson(""); setTab("custom"); } }}>确认保存为新任务包</Button></div>}
      </div>}
    </>}
  </section>;
}

function NeedsEditor({ task, onChange }: { task: Task; onChange: (task: Task) => void }) {
  const needs = task.needs ?? {};
  const change = (patch: Partial<TaskNeeds>) => onChange({ ...task, needs: { ...needs, ...patch } });
  return <details className="rounded-lg bg-muted/40 p-3"><summary className="cursor-pointer text-sm">装备需求与高级设置</summary><div className="mt-3 space-y-3 text-sm">
    <fieldset><legend>必须拥有</legend><div className="flex flex-wrap gap-3">{EDITOR_ITEMS.map(item => <label key={item}><input type="checkbox" checked={(needs.requireAll ?? []).includes(item)} onChange={e => change({ requireAll: e.target.checked ? [...(needs.requireAll ?? []), item] : (needs.requireAll ?? []).filter(x => x !== item) })} /> {item}</label>)}</div></fieldset>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{EDITOR_ITEMS.map(item => <label key={item}>{item}状态<select className={field} value={needs.wear?.[item] ?? ""} onChange={e => { const wear = { ...needs.wear }; if (e.target.value) Object.assign(wear, { [item]: e.target.value }); else delete wear[item]; change({ wear }); }}><option value="">不指定</option>{(Object.keys(WEAR_LABELS) as WearRole[]).filter(role => (role !== "rolled" || item === "上衣") && (role !== "faded" || item === "长裤" || item === "内裤")).map(role => <option key={role} value={role}>{WEAR_LABELS[role]}</option>)}</select></label>)}</div>
  </div></details>;
}

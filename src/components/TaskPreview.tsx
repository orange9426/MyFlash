import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EDITOR_ITEMS, newTaskPack, validateTaskPack } from '@/lib/game/customTasks';
import { concretizeTask, getWearAdvice, wearActionItems, wearActionLabel, resolveTaskDescription } from '@/lib/game/advisor';
import { canResolveTaskVariables } from '@/lib/game/taskVariables';
import { createDefaultOwnedInventory } from '@/lib/game/constants';
import type { Task } from '@/lib/game/types';

export function TaskPreview({ task }: { task: Task }) {
  const [owned, setOwned] = useState(() => createDefaultOwnedInventory());
  const [clothing, setClothing] = useState(() => ({ 上衣: false, 长裤: true, 内裤: false, 短袜: false, 鞋子: false }));
  const [preview, setPreview] = useState<{ key: string; task?: Task; error?: string } | null>(null);
  const key = JSON.stringify([task, owned, clothing]);
  const visible = preview?.key === key ? preview : null;
  const draw = () => {
    try {
      const checked = validateTaskPack({ ...newTaskPack(), tasks: [task] }).tasks[0];
      if (!canResolveTaskVariables(checked, clothing, owned)) { setPreview({ key, error: '当前装备不满足变量条件，此任务不会被抽中。' }); return; }
      setPreview({ key, task: concretizeTask(checked, clothing, owned) });
    } catch (error) { setPreview({ key, error: error instanceof Error ? error.message : '预览失败' }); }
  };
  return <details className="rounded-md border p-3"><summary className="cursor-pointer text-sm">模拟预览</summary><div className="mt-3 space-y-3">
    <p className="text-xs text-muted-foreground">仅用于预览，不修改当前局。</p>
    {EDITOR_ITEMS.map(item => <div key={item} className="flex items-center gap-4 text-sm"><span className="w-10">{item}</span><label><input type="checkbox" checked={owned[item]} onChange={e => { setOwned({ ...owned, [item]: e.target.checked }); if (!e.target.checked) setClothing({ ...clothing, [item]: false }); }} /> 拥有</label><label><input type="checkbox" checked={clothing[item]} disabled={!owned[item]} onChange={e => setClothing({ ...clothing, [item]: e.target.checked })} /> 穿着</label></div>)}
    <Button size="sm" variant="outline" onClick={draw}>重新抽取预览</Button>
    {visible && <div role="status" className="space-y-2 text-sm">{visible.error ? <p>{visible.error}</p> : visible.task && <><p className="font-medium">{visible.task.name}</p><p className="whitespace-pre-wrap">{visible.task.resolvedVariables ? visible.task.description : resolveTaskDescription(visible.task.description, clothing)}</p><p>穿戴提示：{wearActionItems(getWearAdvice(visible.task, clothing, owned)).map(wearActionLabel).join('；') || '无需调整'}</p></>}</div>}
  </div></details>;
}

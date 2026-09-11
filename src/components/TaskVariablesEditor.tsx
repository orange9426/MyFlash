import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EDITOR_ITEMS, WEAR_LABELS, newTaskPack, validateTaskPack } from '@/lib/game/customTasks';
import { concretizeTask, getWearAdvice, wearActionItems, wearActionLabel } from '@/lib/game/advisor';
import { canResolveTaskVariables, VARIABLE_SOURCE_LABELS } from '@/lib/game/taskVariables';
import { createDefaultOwnedInventory } from '@/lib/game/constants';
import type { Task, TaskVariable, WearRole } from '@/lib/game/types';

const field = 'w-full rounded-md border bg-background p-2 text-sm';
export function TaskVariablesEditor({ task, onChange }: { task: Task; onChange: (task: Task) => void }) {
  const variables = task.variables ?? [];
  const update = (index: number, next: TaskVariable) => {
    const old = variables[index];
    const rename = (text: string) => old.key && old.key !== next.key && next.key ? text.replaceAll('{{' + old.key + '}}', '{{' + next.key + '}}') : text;
    onChange({ ...task, name: rename(task.name), description: rename(task.description), variables: variables.map((v, i) => i === index ? next : v) });
  };
  const add = (type: TaskVariable['type']) => {
    let index = 1;
    while (variables.some(v => v.key === '变量' + index)) index++;
    const key = '变量' + index;
    const variable: TaskVariable = type === 'text' ? { key, type, options: ['选项一', '选项二'] } : { key, type, options: [], source: 'worn', wear: 'off' };
    onChange({ ...task, variables: [...variables, variable], description: task.description + '{{' + key + '}}' });
  };
  return <section className="space-y-3 rounded-lg border p-3">
    <h3 className="font-medium">随机变量</h3>
    <p className="text-xs text-muted-foreground">抽取时替换标题与正文中的 {'{{变量名}}'}，同名变量保持一致。没有符合装备条件的任务不会被抽中。</p>
    <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={variables.length >= 10} onClick={() => add('text')}>添加文本变量</Button><Button size="sm" variant="outline" disabled={variables.length >= 10} onClick={() => add('equipment')}>添加装备变量</Button></div>
    {variables.map((variable, index) => <div key={index} className="space-y-3 rounded-md bg-muted/40 p-3">
      <p className="text-sm font-medium">{variable.type === 'text' ? '文本变量' : '装备变量'} {index + 1}</p>
      <label className="block text-sm">变量名<Input maxLength={30} value={variable.key} onChange={e => update(index, { ...variable, key: e.target.value })} /></label>
      {variable.type === 'text' ? <label className="block text-sm">备选词（每行一个，抽取其中一个）<textarea className={field} rows={3} value={variable.options.join('\n')} onChange={e => update(index, { ...variable, options: e.target.value.split('\n') })} /></label> : <>
        <fieldset className="text-sm"><legend className="mb-2">备选装备</legend><div className="flex flex-wrap gap-3">{EDITOR_ITEMS.map(item => <label key={item}><input type="checkbox" checked={variable.options.includes(item)} onChange={e => update(index, { ...variable, options: e.target.checked ? [...variable.options, item] : variable.options.filter(v => v !== item) })} /> {item}</label>)}</div></fieldset>
        <label className="block text-sm">抽取范围<select className={field} value={variable.source} onChange={e => update(index, { ...variable, source: e.target.value as typeof variable.source })}>{Object.entries(VARIABLE_SOURCE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="block text-sm">选中装备的穿戴状态<select className={field} value={variable.wear ?? ''} onChange={e => update(index, { ...variable, wear: (e.target.value || undefined) as WearRole | undefined })}><option value="">不指定</option>{Object.entries(WEAR_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <p className="text-xs text-muted-foreground">卷起仅支持上衣；褪到膝盖仅支持长裤、内裤。状态用于生成穿戴提示，不改变当前计分规则。同一装备的不同状态要求不能同时满足时，不抽取该任务。</p>
      </>}
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => onChange({ ...task, description: task.description + '{{' + variable.key + '}}' })}>插入到正文末尾</Button><Button size="sm" variant="outline" onClick={() => onChange({ ...task, variables: variables.filter((_, i) => i !== index) })}>移除变量</Button></div>
    </div>)}
    {variables.length > 0 && <VariablePreview task={task} />}
  </section>;
}

function VariablePreview({ task }: { task: Task }) {
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
  return <details className="rounded-md border p-3"><summary className="cursor-pointer text-sm">模拟装备并预览抽取</summary><div className="mt-3 space-y-3">
    <p className="text-xs text-muted-foreground">仅用于预览，不修改当前局。</p>
    {EDITOR_ITEMS.map(item => <div key={item} className="flex items-center gap-4 text-sm"><span className="w-10">{item}</span><label><input type="checkbox" checked={owned[item]} onChange={e => { setOwned({ ...owned, [item]: e.target.checked }); if (!e.target.checked) setClothing({ ...clothing, [item]: false }); }} /> 拥有</label><label><input type="checkbox" checked={clothing[item]} disabled={!owned[item]} onChange={e => setClothing({ ...clothing, [item]: e.target.checked })} /> 穿着</label></div>)}
    <Button size="sm" variant="outline" onClick={draw}>重新抽取预览</Button>
    {visible && <div role="status" className="space-y-2 text-sm">{visible.error ? <p>{visible.error}</p> : visible.task && <><p className="font-medium">{visible.task.name}</p><p className="whitespace-pre-wrap">{visible.task.description}</p><p>穿戴提示：{wearActionItems(getWearAdvice(visible.task, clothing, owned)).map(wearActionLabel).join('；') || '无需调整'}</p></>}</div>}
  </div></details>;
}

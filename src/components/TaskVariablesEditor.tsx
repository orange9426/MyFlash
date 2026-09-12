import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { EDITOR_ITEMS, WEAR_LABELS } from '@/lib/game/customTasks';
import { VARIABLE_SOURCE_LABELS } from '@/lib/game/taskVariables';
import type { Task, TaskVariable, WearRole } from '@/lib/game/types';

const field = 'w-full rounded-md border bg-background p-2 text-sm';
export function TaskVariablesEditor({ task, onChange }: { task: Task; onChange: (task: Task) => void }) {
  const variables = task.variables ?? [];
  const update = (index: number, next: TaskVariable) => {
    onChange({ ...task, variables: variables.map((v, i) => i === index ? next : v) });
  };
  const add = (type: TaskVariable['type']) => {
    let index = 1;
    while (variables.some(v => v.key === '变量' + index) || (task.name + task.description).includes('{{变量' + index + '}}')) index++;
    const key = '变量' + index;
    const variable: TaskVariable = type === 'text' ? { key, type, options: ['选项一', '选项二'] } : { key, type, options: [], source: 'worn', wear: 'off' };
    onChange({ ...task, variables: [...variables, variable], description: task.description + '{{' + key + '}}' });
  };
  const copy = async (key: string) => {
    try { await navigator.clipboard.writeText("{{" + key + "}}"); toast.success("已复制变量标记"); }
    catch { toast.error("复制失败，请选中变量标记手动复制"); }
  };
  return <section className="space-y-2 rounded-lg border p-3">
    <h3 className="text-sm font-medium">随机变量</h3>
    <p className="text-xs text-muted-foreground">复制标记后粘贴到标题或正文，同一标记使用同一结果。</p>
    <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={variables.length >= 10} onClick={() => add('text')}>添加文本变量</Button><Button size="sm" variant="outline" disabled={variables.length >= 10} onClick={() => add('equipment')}>添加装备变量</Button></div>
    {variables.map((variable, index) => <div key={variable.key} className="space-y-2 rounded-md bg-muted/40 p-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs"><span>{variable.type === 'text' ? '文本' : '装备'}</span><code className="select-all rounded border px-1.5 py-1">{'{{' + variable.key + '}}'}</code><Button size="sm" variant="ghost" onClick={() => copy(variable.key)}>复制</Button><Button size="sm" variant="ghost" onClick={() => onChange({ ...task, variables: variables.filter((_, i) => i !== index) })}>移除</Button></div>
      {variable.type === 'text' ? <label className="block text-sm">备选词（每行一个，抽取其中一个）<textarea className={field} rows={2} value={variable.options.join('\n')} onChange={e => update(index, { ...variable, options: e.target.value.split('\n') })} /></label> : <>
        <fieldset className="text-sm"><legend className="mb-2">备选装备</legend><div className="flex flex-wrap gap-3">{EDITOR_ITEMS.map(item => <label key={item}><input type="checkbox" checked={variable.options.includes(item)} onChange={e => update(index, { ...variable, options: e.target.checked ? [...variable.options, item] : variable.options.filter(v => v !== item) })} /> {item}</label>)}</div></fieldset>
        <div className="grid grid-cols-2 gap-2"><label className="block text-xs">抽取范围<select className={field} value={variable.source} onChange={e => update(index, { ...variable, source: e.target.value as typeof variable.source })}>{Object.entries(VARIABLE_SOURCE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="block text-xs">穿戴状态<select className={field} value={variable.wear ?? ''} onChange={e => update(index, { ...variable, wear: (e.target.value || undefined) as WearRole | undefined })}><option value="">不指定</option>{Object.entries(WEAR_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
        <p className="text-xs text-muted-foreground">卷起仅支持上衣；褪到膝盖仅支持长裤、内裤。</p>
      </>}
    </div>)}
  </section>;
}


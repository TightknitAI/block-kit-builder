import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import { Label } from '../../lib/ui/label';
import { RadioGroup, RadioGroupItem } from '../../lib/ui/radio-group';
import type { PlanBlock, TaskCardBlock, TaskCardStatus } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

const STATUSES: readonly TaskCardStatus[] = ['pending', 'in_progress', 'complete', 'error'] as const;

/**
 * Editor form for plan blocks. Edits the title and the inline tasks list.
 * Each task gets a compact title + status row; richer fields (sources,
 * details, output) round-trip on the payload but aren't editable inline —
 * use a standalone `task_card` block for those.
 * @param props - editor props
 * @param props.block - the plan block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered plan editor form
 */
export function PlanEditor({ block, onChange }: BlockEditorProps<PlanBlock>) {
  const titleText = typeof block.title === 'string' ? block.title : (block.title?.text ?? '');
  const tasks = block.tasks ?? [];

  const updateTask = (idx: number, change: Partial<TaskCardBlock>) => {
    onChange({
      ...block,
      tasks: tasks.map((t, i) => (i === idx ? { ...t, ...change } : t))
    });
  };
  const removeTask = (idx: number) => {
    const next = tasks.filter((_, i) => i !== idx);
    onChange({ ...block, tasks: next.length > 0 ? next : undefined });
  };
  const addTask = () => {
    onChange({
      ...block,
      tasks: [
        ...tasks,
        {
          type: 'task_card',
          task_id: `task_${nanoid(6)}`,
          title: 'New step',
          status: 'pending'
        }
      ]
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <EditorField label="Title" help="Heading shown above the task list." htmlFor="plan-title">
        <Input
          id="plan-title"
          value={titleText}
          placeholder="e.g. Investigating the issue"
          onChange={(e) => onChange({ ...block, title: e.target.value })}
        />
      </EditorField>

      <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3">
        <span className="text-xs font-medium text-foreground">Tasks</span>
        {tasks.length === 0 ? (
          <p className="text-[11px] leading-snug text-muted-foreground">
            No tasks. Add one to render a checklist beneath the title.
          </p>
        ) : null}
        {tasks.map((task, idx) => {
          const status: TaskCardStatus = task.status ?? 'pending';
          return (
            <div key={idx} className="flex flex-col gap-2 rounded border bg-background p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Task {idx + 1}</span>
                <button
                  type="button"
                  aria-label="Remove task"
                  onClick={() => removeTask(idx)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <EditorField label="Title" htmlFor={`plan-task-title-${idx}`}>
                <Input
                  id={`plan-task-title-${idx}`}
                  value={task.title}
                  placeholder="e.g. Reproduce the error locally"
                  onChange={(e) => updateTask(idx, { title: e.target.value })}
                />
              </EditorField>
              <EditorField label="Status">
                <RadioGroup
                  value={status}
                  onValueChange={(v) => updateTask(idx, { status: v as TaskCardStatus })}
                  className="flex flex-row flex-wrap gap-3"
                >
                  {STATUSES.map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <RadioGroupItem value={s} id={`plan-task-status-${idx}-${s}`} />
                      <Label htmlFor={`plan-task-status-${idx}-${s}`} className="text-xs capitalize">
                        {s.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </EditorField>
            </div>
          );
        })}
        <Button type="button" size="sm" onClick={addTask} className="self-start">
          <Plus className="h-3.5 w-3.5" /> Add task
        </Button>
      </div>
    </div>
  );
}

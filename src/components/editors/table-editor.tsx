import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import type { TableBlock, TableCell, TableColumnSetting } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

const ALIGN_OPTIONS: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];

/**
 * Coerces a cell to a raw_text representation for editing. Rich-text
 * cells are flattened to a `[rich_text]` placeholder string so the
 * editor never silently drops content; their original payload is
 * preserved on save by `setCell` only when the user doesn't edit them.
 * @param cell - the cell to coerce
 * @returns the cell text, or a placeholder for rich-text cells
 */
function cellAsText(cell: TableCell): string {
  if (cell.type === 'raw_text') {
    return cell.text;
  }
  return '[rich_text]';
}

/**
 * Editor form for table blocks. v1 surfaces:
 *  - The grid as a 2D array of inputs (raw_text cells).
 *  - Per-column alignment (left / center / right) and an "add column" button.
 *  - Per-row delete and an "add row" button.
 *
 * Rich-text cells are shown as a read-only placeholder and preserved on
 * save unless the user edits them, in which case they're replaced with a
 * raw_text cell containing the new value.
 * @param props - editor props
 * @param props.block - the table block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered table editor form
 */
export function TableEditor({ block, onChange }: BlockEditorProps<TableBlock>) {
  const rows = block.rows ?? [];
  const columnCount = rows[0]?.length ?? 0;
  const columnSettings = block.column_settings ?? [];

  const setCell = (rowIdx: number, colIdx: number, text: string) => {
    const nextRows = rows.map((row, r) =>
      r === rowIdx ? row.map((cell, c) => (c === colIdx ? ({ type: 'raw_text', text } as TableCell) : cell)) : row
    );
    onChange({ ...block, rows: nextRows });
  };

  const addRow = () => {
    const blankRow: TableCell[] = Array.from({ length: columnCount || 1 }, () => ({ type: 'raw_text', text: '' }));
    onChange({ ...block, rows: [...rows, blankRow] });
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) {
      return;
    }
    onChange({ ...block, rows: rows.filter((_, r) => r !== rowIdx) });
  };

  const addColumn = () => {
    const nextRows = rows.map((row) => [...row, { type: 'raw_text', text: '' } as TableCell]);
    const nextSettings = [...columnSettings, null as TableColumnSetting];
    onChange({ ...block, rows: nextRows, column_settings: nextSettings });
  };

  const removeColumn = (colIdx: number) => {
    if (columnCount <= 1) {
      return;
    }
    const nextRows = rows.map((row) => row.filter((_, c) => c !== colIdx));
    const nextSettings = columnSettings.filter((_, c) => c !== colIdx);
    onChange({ ...block, rows: nextRows, column_settings: nextSettings });
  };

  const setColumnAlign = (colIdx: number, align: 'left' | 'center' | 'right' | '') => {
    const next: TableColumnSetting[] = Array.from({ length: columnCount }, (_, i) => columnSettings[i] ?? null);
    if (align === '') {
      next[colIdx] = null;
    } else {
      const existing = (next[colIdx] ?? {}) as Exclude<TableColumnSetting, null>;
      next[colIdx] = { ...existing, align };
    }
    onChange({ ...block, column_settings: next });
  };

  return (
    <div className="flex flex-col gap-3">
      <EditorField label="Cells" help="Up to 100 rows and 20 columns. Slack allows one table per message.">
        <div className="flex flex-col gap-2 overflow-x-auto">
          {/* Column controls */}
          <div className="flex items-center gap-1">
            <span className="w-6 shrink-0" aria-hidden="true" />
            {Array.from({ length: columnCount }, (_, c) => {
              const setting = columnSettings[c];
              const align = setting?.align ?? '';
              return (
                <div key={c} className="flex min-w-[120px] flex-1 items-center gap-1">
                  <select
                    aria-label={`Column ${c + 1} alignment`}
                    value={align}
                    onChange={(e) => setColumnAlign(c, e.target.value as 'left' | 'center' | 'right' | '')}
                    className="h-7 flex-1 rounded-sm border border-input bg-background px-1.5 text-[11px] text-muted-foreground"
                  >
                    <option value="">Default</option>
                    {ALIGN_OPTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Remove column ${c + 1}`}
                    onClick={() => removeColumn(c)}
                    disabled={columnCount <= 1}
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Cell grid */}
          {rows.map((row, r) => (
            <div key={r} className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Remove row ${r + 1}`}
                onClick={() => removeRow(r)}
                disabled={rows.length <= 1}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              {row.map((cell, c) => {
                const isRichText = cell.type === 'rich_text';
                return (
                  <div key={c} className="flex min-w-[120px] flex-1 flex-col gap-0.5">
                    <Input
                      value={cellAsText(cell)}
                      placeholder={r === 0 ? `Header ${c + 1}` : 'Cell text'}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="h-8 text-xs"
                    />
                    {isRichText ? (
                      <span className="text-[10px] text-muted-foreground">
                        Was rich-text; editing replaces with plain text.
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </EditorField>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={addRow} disabled={rows.length >= 100}>
          <Plus className="h-3.5 w-3.5" /> Add row
        </Button>
        <Button type="button" size="sm" onClick={addColumn} disabled={columnCount >= 20}>
          <Plus className="h-3.5 w-3.5" /> Add column
        </Button>
      </div>
    </div>
  );
}

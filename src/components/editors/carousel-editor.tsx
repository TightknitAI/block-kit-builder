import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../../lib/ui/button';
import { Input } from '../../lib/ui/input';
import { Textarea } from '../../lib/ui/textarea';
import type { CardBlock, CarouselBlock } from '../../types';
import { EditorField } from './field';
import type { BlockEditorProps } from './types';

const MAX_CARDS = 10;

/**
 * Editor form for carousel blocks. Lists the contained cards and lets
 * the user add, remove, and edit the title/body of each. For deeper
 * card edits (icon, hero image, action buttons), use a standalone Card
 * block or the View JSON drawer.
 * @param props - editor props
 * @param props.block - the carousel block to edit
 * @param props.onChange - called with the updated block payload
 * @returns the rendered carousel editor form
 */
export function CarouselEditor({ block, onChange }: BlockEditorProps<CarouselBlock>) {
  const elements = block.elements ?? [];

  const updateCard = (idx: number, next: CardBlock) => {
    onChange({
      ...block,
      elements: elements.map((c, i) => (i === idx ? next : c))
    });
  };
  const removeAt = (idx: number) => {
    onChange({
      ...block,
      elements: elements.filter((_, i) => i !== idx)
    });
  };
  const addCard = () => {
    onChange({
      ...block,
      elements: [
        ...elements,
        {
          type: 'card',
          title: {
            type: 'mrkdwn',
            text: `Card ${elements.length + 1}`
          },
          body: { type: 'mrkdwn', text: 'New card.' }
        }
      ]
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] leading-snug text-muted-foreground">
        Carousels hold 1-10 cards. For icon, hero image, or action edits, use the View JSON drawer.
      </p>
      {elements.map((card, idx) => (
        <div key={idx} className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Card {idx + 1}</span>
            <button
              type="button"
              aria-label="Remove card"
              onClick={() => removeAt(idx)}
              disabled={elements.length <= 1}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <EditorField label="Title" htmlFor={`carousel-card-title-${idx}`}>
            <Input
              id={`carousel-card-title-${idx}`}
              value={card.title?.text ?? ''}
              maxLength={150}
              placeholder="e.g. Card title"
              onChange={(e) =>
                updateCard(idx, {
                  ...card,
                  title: e.target.value ? { type: 'mrkdwn', text: e.target.value } : undefined
                })
              }
            />
          </EditorField>
          <EditorField label="Body" htmlFor={`carousel-card-body-${idx}`}>
            <Textarea
              id={`carousel-card-body-${idx}`}
              value={card.body?.text ?? ''}
              maxLength={200}
              rows={2}
              placeholder="e.g. Short card description."
              onChange={(e) =>
                updateCard(idx, {
                  ...card,
                  body: e.target.value ? { type: 'mrkdwn', text: e.target.value } : undefined
                })
              }
            />
          </EditorField>
        </div>
      ))}
      <Button type="button" size="sm" onClick={addCard} disabled={elements.length >= MAX_CARDS} className="self-start">
        <Plus className="h-3.5 w-3.5" /> Add card
      </Button>
    </div>
  );
}

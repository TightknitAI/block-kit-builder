import type { ReactNode } from 'react';
import { Label } from '../../lib/ui/label';

/**
 * One labeled form field with inline helper text. Used by every per-block
 * editor so the look-and-feel is consistent.
 * @param props - field props
 * @param props.label - the visible label (plain language)
 * @param props.help - one-line helper text explaining the field
 * @param props.htmlFor - id of the associated input for a11y
 * @param props.children - the input control(s)
 * @returns the rendered labeled field
 */
export function EditorField({
  label,
  help,
  htmlFor,
  children
}: {
  label: string;
  help?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {help && <p className="text-[11px] leading-snug text-muted-foreground">{help}</p>}
    </div>
  );
}

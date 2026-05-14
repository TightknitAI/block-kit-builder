/**
 * Dividers have no configurable fields.
 * @returns a placeholder note explaining there are no options
 */
export function DividerEditor() {
  return (
    <p className="text-xs text-muted-foreground">
      A horizontal line that separates content. This block has no options to configure.
    </p>
  );
}

// Renders lightweight inline markup used by long-form localized content:
//   `code`   → <code>
//   **bold** → <strong>
// Everything else is plain text. Used by the guide and changes pages.
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-elevated px-1.5 py-0.5 text-xs text-fg-muted"
            >
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-fg">
              {p.slice(2, -2)}
            </strong>
          );
        }
        return p;
      })}
    </>
  );
}

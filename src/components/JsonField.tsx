import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { InfoLabel } from "./fields";

/** Edit a plain JSON object as text, committing only when it parses. */
export function JsonObjectField({
  label,
  hint,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  rows?: number;
}) {
  const { d } = useI18n();
  const [text, setText] = useState(() => serialize(value));
  const [error, setError] = useState<string | null>(null);

  // Re-sync when the underlying value changes from elsewhere (e.g. card import).
  useEffect(() => {
    setText((current) => {
      try {
        const parsed = JSON.parse(current || "{}");
        if (serialize(parsed) === serialize(value)) return current;
      } catch {
        /* keep editing buffer */
      }
      return serialize(value);
    });
  }, [value]);

  function commit(next: string) {
    setText(next);
    const trimmed = next.trim();
    if (!trimmed || trimmed === "{}") {
      setError(null);
      onChange({});
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setError(null);
        onChange(parsed);
      } else {
        setError(d.json.mustBeObject);
      }
    } catch {
      setError(d.json.invalid);
    }
  }

  return (
    <div>
      <InfoLabel label={label} hint={hint} />
      <textarea
        className={`textarea font-mono text-[12px] ${error ? "border-error" : ""}`}
        rows={rows}
        value={text}
        spellCheck={false}
        onChange={(e) => commit(e.target.value)}
        placeholder="{}"
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

function serialize(value: Record<string, unknown>): string {
  if (!value || Object.keys(value).length === 0) return "";
  return JSON.stringify(value, null, 2);
}

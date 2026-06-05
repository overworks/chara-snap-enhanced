import { useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { HelpCircle } from "lucide-react";

export function InfoLabel({
  label,
  hint,
  htmlFor,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <label htmlFor={htmlFor} className="field-label flex items-center gap-1.5">
      <span>{label}</span>
      {hint && (
        <span
          className="relative inline-flex"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label={`About ${label}`}
            onClick={() => setOpen((v) => !v)}
            className="text-fg-subtle hover:text-fg-muted transition"
          >
            <HelpCircle size={13} />
          </button>
          {open && (
            <span
              role="tooltip"
              className="absolute left-1/2 top-5 z-30 w-64 -translate-x-1/2 rounded-[10px] border border-border-strong bg-surface px-3 py-2 text-[11px] font-normal leading-relaxed text-fg-muted shadow-xl"
            >
              {hint}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

export function Field({
  label,
  hint,
  tooltip,
  children,
}: {
  label?: string;
  hint?: string;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <div>
      {label && <InfoLabel label={label} hint={tooltip} />}
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function TextInput({
  label,
  tooltip,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: {
  label?: string;
  tooltip?: string;
  hint?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <Field label={label} tooltip={tooltip} hint={hint}>
      <input
        type={type}
        className={`input ${className}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  tooltip,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
  mono = false,
  ...rest
}: {
  label?: string;
  tooltip?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return (
    <Field label={label} tooltip={tooltip} hint={hint}>
      <textarea
        className={`textarea ${mono ? "font-mono text-[13px]" : ""}`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </Field>
  );
}

export function Checkbox({
  label,
  tooltip,
  checked,
  onChange,
}: {
  label: string;
  tooltip?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer select-none">
      <input
        type="checkbox"
        className="size-4 rounded border-border-strong bg-elevated accent-accent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
      {tooltip && <InfoLabelInline hint={tooltip} label={label} />}
    </label>
  );
}

function InfoLabelInline({ hint, label }: { hint: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle size={13} className="text-fg-subtle" aria-label={`About ${label}`} />
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-5 z-30 w-64 -translate-x-1/2 rounded-[10px] border border-border-strong bg-surface px-3 py-2 text-[11px] leading-relaxed text-fg-muted shadow-xl"
        >
          {hint}
        </span>
      )}
    </span>
  );
}

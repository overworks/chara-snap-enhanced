import { useState } from "react";
import { Plus, X, ChevronDown, Eye, EyeOff, Search } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import type { Lorebook, LorebookEntry } from "../../../lib/types";
import { emptyEntry, emptyLorebook } from "../../../lib/card";
import { useI18n } from "../../../i18n";
import { TextInput, Checkbox, Field, InfoLabel } from "../../fields";
import { JsonObjectField } from "../../JsonField";

export default function LorebookTab() {
  const { state, mutateCard } = useCard();
  const { d } = useI18n();
  const book = state.card.character_book;
  const [filter, setFilter] = useState("");

  function ensureBook(fn: (b: Lorebook) => Lorebook) {
    mutateCard((c) => ({
      ...c,
      character_book: fn(c.character_book ?? emptyLorebook()),
    }));
  }
  function patchBook(patch: Partial<Lorebook>) {
    ensureBook((b) => ({ ...b, ...patch }));
  }
  function addEntry() {
    ensureBook((b) => ({
      ...b,
      entries: [...b.entries, emptyEntry(b.entries.length)],
    }));
  }
  function updateEntry(i: number, patch: Partial<LorebookEntry>) {
    ensureBook((b) => ({
      ...b,
      entries: b.entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)),
    }));
  }
  function removeEntry(i: number) {
    ensureBook((b) => ({
      ...b,
      entries: b.entries.filter((_, idx) => idx !== i),
    }));
  }

  const entries = book?.entries ?? [];
  const filtered = entries
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => {
      if (!filter.trim()) return true;
      const q = filter.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.keys.some((k) => k.toLowerCase().includes(q)) ||
        e.content.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Book settings */}
      <div className="card-surface space-y-4 p-4">
        <h3 className="text-sm font-semibold text-fg-muted">{d.lorebook.settings}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label={d.lorebook.name}
            tooltip={d.lorebook.nameTip}
            value={book?.name ?? ""}
            onChange={(v) => patchBook({ name: v })}
          />
          <TextInput
            label={d.lorebook.description}
            tooltip={d.lorebook.descriptionTip}
            value={book?.description ?? ""}
            onChange={(v) => patchBook({ description: v })}
          />
          <TextInput
            label={d.lorebook.scanDepth}
            tooltip={d.lorebook.scanDepthTip}
            type="number"
            value={book?.scan_depth ?? ""}
            onChange={(v) =>
              patchBook({ scan_depth: v === "" ? undefined : Number(v) })
            }
          />
          <TextInput
            label={d.lorebook.tokenBudget}
            tooltip={d.lorebook.tokenBudgetTip}
            type="number"
            value={book?.token_budget ?? ""}
            onChange={(v) =>
              patchBook({ token_budget: v === "" ? undefined : Number(v) })
            }
          />
        </div>
        <Checkbox
          label={d.lorebook.recursive}
          tooltip={d.lorebook.recursiveTip}
          checked={book?.recursive_scanning ?? false}
          onChange={(v) => patchBook({ recursive_scanning: v })}
        />
        <JsonObjectField
          label={d.lorebook.extensions}
          hint={d.lorebook.extensionsHint}
          value={book?.extensions ?? {}}
          onChange={(v) => patchBook({ extensions: v })}
        />
      </div>

      {/* Entries */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
            <input
              className="input pl-9"
              placeholder={d.lorebook.filter}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button type="button" onClick={addEntry} className="btn-secondary text-sm">
            <Plus size={15} /> {d.lorebook.addEntry}
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-border-strong py-8 text-center text-sm text-fg-subtle">
            {d.lorebook.empty}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map(({ e, i }) => (
              <EntryRow
                key={i}
                entry={e}
                onChange={(patch) => updateEntry(i, patch)}
                onRemove={() => removeEntry(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: LorebookEntry;
  onChange: (patch: Partial<LorebookEntry>) => void;
  onRemove: () => void;
}) {
  const { d } = useI18n();
  const [open, setOpen] = useState(false);
  const title = entry.name || entry.keys[0] || d.lorebook.untitledEntry;

  const setList = (key: "keys" | "secondary_keys", raw: string) =>
    onChange({
      [key]: raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    });

  return (
    <div className="rounded-[12px] border border-border bg-surface/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-fg-faint hover:text-fg"
          aria-label="Toggle entry"
        >
          <ChevronDown
            size={16}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="truncate text-sm font-medium text-fg">{title}</span>
          <span className="hidden gap-1 sm:flex">
            {entry.keys.slice(0, 3).map((k, idx) => (
              <span key={idx} className="chip py-0.5 text-[10px]">
                {k}
              </span>
            ))}
            {entry.keys.length > 3 && (
              <span className="text-[10px] text-fg-subtle">
                +{entry.keys.length - 3}
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ enabled: !entry.enabled })}
          className={entry.enabled ? "text-accent-text" : "text-fg-subtle"}
          aria-label="Toggle enabled"
        >
          {entry.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="btn-ghost px-1.5"
          aria-label="Delete entry"
        >
          <X size={16} />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border px-3 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label={d.lorebook.entryName}
              value={entry.name}
              onChange={(v) => onChange({ name: v })}
            />
            <TextInput
              label={d.lorebook.entryComment}
              value={entry.comment}
              onChange={(v) => onChange({ comment: v })}
            />
          </div>
          <TextInput
            label={d.lorebook.keys}
            tooltip={d.lorebook.keysTip}
            value={entry.keys.join(", ")}
            onChange={(v) => setList("keys", v)}
            placeholder={d.lorebook.keysPlaceholder}
          />
          <TextInput
            label={d.lorebook.secondaryKeys}
            tooltip={d.lorebook.secondaryKeysTip}
            value={entry.secondary_keys.join(", ")}
            onChange={(v) => setList("secondary_keys", v)}
            placeholder={d.lorebook.secondaryKeysPlaceholder}
          />
          <div>
            <InfoLabel label={d.lorebook.content} hint={d.lorebook.contentTip} />
            <textarea
              className="textarea"
              rows={4}
              value={entry.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder={d.lorebook.contentPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TextInput
              label={d.lorebook.priority}
              tooltip={d.lorebook.priorityTip}
              type="number"
              value={entry.priority}
              onChange={(v) => onChange({ priority: Number(v) || 0 })}
            />
            <TextInput
              label={d.lorebook.order}
              tooltip={d.lorebook.orderTip}
              type="number"
              value={entry.insertion_order}
              onChange={(v) => onChange({ insertion_order: Number(v) || 0 })}
            />
            <TextInput
              label={d.lorebook.id}
              type="number"
              value={entry.id}
              onChange={(v) => onChange({ id: Number(v) || 0 })}
            />
            <Field label={d.lorebook.position} tooltip={d.lorebook.positionTip}>
              <select
                className="input"
                value={entry.position}
                onChange={(e) =>
                  onChange({
                    position: e.target.value as LorebookEntry["position"],
                  })
                }
              >
                <option value="before_char">{d.lorebook.beforeChar}</option>
                <option value="after_char">{d.lorebook.afterChar}</option>
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Checkbox
              label={d.lorebook.selective}
              tooltip={d.lorebook.selectiveTip}
              checked={entry.selective}
              onChange={(v) => onChange({ selective: v })}
            />
            <Checkbox
              label={d.lorebook.constant}
              tooltip={d.lorebook.constantTip}
              checked={entry.constant}
              onChange={(v) => onChange({ constant: v })}
            />
            <Checkbox
              label={d.lorebook.caseSensitive}
              tooltip={d.lorebook.caseSensitiveTip}
              checked={entry.case_sensitive}
              onChange={(v) => onChange({ case_sensitive: v })}
            />
            <Checkbox
              label={d.lorebook.useRegex}
              tooltip={d.lorebook.useRegexTip}
              checked={entry.use_regex}
              onChange={(v) => onChange({ use_regex: v })}
            />
          </div>

          <JsonObjectField
            label={d.lorebook.entryExtensions}
            hint={d.lorebook.entryExtensionsHint}
            value={entry.extensions}
            onChange={(v) => onChange({ extensions: v })}
          />
        </div>
      )}
    </div>
  );
}

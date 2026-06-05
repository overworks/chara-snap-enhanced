import { useState } from "react";
import { Plus, X, ChevronDown, Eye, EyeOff, Search } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import type { Lorebook, LorebookEntry } from "../../../lib/types";
import { emptyEntry, emptyLorebook } from "../../../lib/card";
import { TextInput, Checkbox, Field, InfoLabel } from "../../fields";
import { JsonObjectField } from "../../JsonField";

export default function LorebookTab() {
  const { state, mutateCard } = useCard();
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
        <h3 className="text-sm font-semibold text-zinc-300">Lorebook Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Lorebook Name"
            tooltip="A display name for this lorebook. Optional — mainly for organization."
            value={book?.name ?? ""}
            onChange={(v) => patchBook({ name: v })}
          />
          <TextInput
            label="Description"
            tooltip="A brief description of what this lorebook contains. For your own reference."
            value={book?.description ?? ""}
            onChange={(v) => patchBook({ description: v })}
          />
          <TextInput
            label="Scan Depth"
            tooltip="How many recent messages to scan for keywords. Most apps default to 2–10."
            type="number"
            value={book?.scan_depth ?? ""}
            onChange={(v) =>
              patchBook({ scan_depth: v === "" ? undefined : Number(v) })
            }
          />
          <TextInput
            label="Token Budget"
            tooltip="Maximum tokens all activated entries can collectively use."
            type="number"
            value={book?.token_budget ?? ""}
            onChange={(v) =>
              patchBook({ token_budget: v === "" ? undefined : Number(v) })
            }
          />
        </div>
        <Checkbox
          label="Recursive scanning"
          tooltip="Activated entries are scanned for more keywords, which can trigger further entries."
          checked={book?.recursive_scanning ?? false}
          onChange={(v) => patchBook({ recursive_scanning: v })}
        />
        <JsonObjectField
          label="Lorebook Extensions"
          hint="Advanced app-specific lorebook metadata. Enter a valid JSON object."
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              className="input pl-9"
              placeholder="Filter entries…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <button type="button" onClick={addEntry} className="btn-secondary text-sm">
            <Plus size={15} /> Add Entry
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-[#ffffff1a] py-8 text-center text-sm text-zinc-600">
            No lorebook entries. Click "Add Entry" to create one.
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
  const [open, setOpen] = useState(false);
  const title = entry.name || entry.keys[0] || "Untitled entry";

  const setList = (key: "keys" | "secondary_keys", raw: string) =>
    onChange({
      [key]: raw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    });

  return (
    <div className="rounded-[12px] border border-[#ffffff0f] bg-zinc-900/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-zinc-500 hover:text-zinc-200"
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
          <span className="truncate text-sm font-medium text-zinc-200">{title}</span>
          <span className="hidden gap-1 sm:flex">
            {entry.keys.slice(0, 3).map((k, idx) => (
              <span key={idx} className="chip py-0.5 text-[10px]">
                {k}
              </span>
            ))}
            {entry.keys.length > 3 && (
              <span className="text-[10px] text-zinc-600">
                +{entry.keys.length - 3}
              </span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ enabled: !entry.enabled })}
          className={entry.enabled ? "text-[#7e70ff]" : "text-zinc-600"}
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
        <div className="space-y-4 border-t border-[#ffffff0f] px-3 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Name"
              value={entry.name}
              onChange={(v) => onChange({ name: v })}
            />
            <TextInput
              label="Comment"
              value={entry.comment}
              onChange={(v) => onChange({ comment: v })}
            />
          </div>
          <TextInput
            label="Keywords (comma-separated)"
            tooltip="Trigger words that activate this entry. Be specific — 'Blackwood Forest' beats 'forest'."
            value={entry.keys.join(", ")}
            onChange={(v) => setList("keys", v)}
            placeholder="keyword1, keyword2"
          />
          <TextInput
            label="Secondary Keywords (comma-separated)"
            tooltip="With Selective mode on, the entry needs BOTH a primary AND a secondary keyword present."
            value={entry.secondary_keys.join(", ")}
            onChange={(v) => setList("secondary_keys", v)}
            placeholder="secondary1, secondary2"
          />
          <div>
            <InfoLabel
              label="Content"
              hint="The text injected into the prompt when this entry activates."
            />
            <textarea
              className="textarea"
              rows={4}
              value={entry.content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Aldara is a mountainous kingdom known for its iron mines."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TextInput
              label="Priority"
              tooltip="Higher number survives token-budget trimming. Default 10."
              type="number"
              value={entry.priority}
              onChange={(v) => onChange({ priority: Number(v) || 0 })}
            />
            <TextInput
              label="Order"
              tooltip="Insertion order when multiple entries activate. Lower goes first."
              type="number"
              value={entry.insertion_order}
              onChange={(v) => onChange({ insertion_order: Number(v) || 0 })}
            />
            <TextInput
              label="ID"
              type="number"
              value={entry.id}
              onChange={(v) => onChange({ id: Number(v) || 0 })}
            />
            <Field label="Position" tooltip="Where the entry is inserted relative to the character definition.">
              <select
                className="input"
                value={entry.position}
                onChange={(e) =>
                  onChange({
                    position: e.target.value as LorebookEntry["position"],
                  })
                }
              >
                <option value="before_char">Before Char</option>
                <option value="after_char">After Char</option>
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Checkbox
              label="Selective"
              tooltip="Requires both a primary AND a secondary keyword before activating."
              checked={entry.selective}
              onChange={(v) => onChange({ selective: v })}
            />
            <Checkbox
              label="Constant"
              tooltip="Always inject regardless of keywords. Use sparingly."
              checked={entry.constant}
              onChange={(v) => onChange({ constant: v })}
            />
            <Checkbox
              label="Case sensitive"
              tooltip="Keyword matching becomes case-sensitive. Off by default."
              checked={entry.case_sensitive}
              onChange={(v) => onChange({ case_sensitive: v })}
            />
          </div>

          <JsonObjectField
            label="Entry Extensions"
            hint="Advanced app-specific entry metadata. Enter a valid JSON object."
            value={entry.extensions}
            onChange={(v) => onChange({ extensions: v })}
          />
        </div>
      )}
    </div>
  );
}

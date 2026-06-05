import { useState } from "react";
import { Plus, X, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import { TextArea, Field, InfoLabel } from "../../fields";

export default function MessagesTab() {
  const { state, updateCard, mutateCard } = useCard();
  const { card } = state;
  const greetings = card.alternate_greetings;
  const groupGreetings = card.group_only_greetings ?? [];

  const setGreeting = (i: number, v: string) =>
    updateCard({
      alternate_greetings: greetings.map((g, idx) => (idx === i ? v : g)),
    });
  const addGreeting = () =>
    updateCard({ alternate_greetings: [...greetings, ""] });
  const removeGreeting = (i: number) =>
    updateCard({ alternate_greetings: greetings.filter((_, idx) => idx !== i) });
  const moveGreeting = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= greetings.length) return;
    const next = [...greetings];
    [next[i], next[j]] = [next[j], next[i]];
    updateCard({ alternate_greetings: next });
  };

  const setGroup = (i: number, v: string) =>
    updateCard({
      group_only_greetings: groupGreetings.map((g, idx) => (idx === i ? v : g)),
    });
  const addGroup = () =>
    updateCard({ group_only_greetings: [...groupGreetings, ""] });
  const removeGroup = (i: number) =>
    mutateCard((c) => ({
      ...c,
      group_only_greetings: (c.group_only_greetings ?? []).filter(
        (_, idx) => idx !== i,
      ),
    }));

  return (
    <div className="space-y-6">
      <TextArea
        label="First Message"
        tooltip="The character's opening message when a new chat begins."
        value={card.first_mes}
        onChange={(v) => updateCard({ first_mes: v })}
        placeholder="*The character enters the scene…*"
        rows={8}
      />

      <Field
        label="Alternate Greetings"
        tooltip="Additional opening messages. Users can swipe between these."
        hint="Additional opening messages. Users can swipe between these."
      >
        <div className="space-y-2">
          {greetings.map((g, i) => (
            <GreetingCard
              key={i}
              index={i}
              value={g}
              total={greetings.length}
              onChange={(v) => setGreeting(i, v)}
              onRemove={() => removeGreeting(i)}
              onMove={(dir) => moveGreeting(i, dir)}
              placeholder="*An alternate opening message…*"
              label={`Greeting ${i + 1}`}
            />
          ))}
          <button type="button" onClick={addGreeting} className="btn-secondary text-sm">
            <Plus size={15} /> Add Greeting
          </button>
        </div>
      </Field>

      <Field
        label="Group Chat Greetings"
        tooltip="Shown only when this character is used in a group chat (V3)."
        hint="Shown only when this character is used in a group chat (V3)."
      >
        <div className="space-y-2">
          {groupGreetings.length === 0 && (
            <p className="text-xs text-zinc-600">No group-only greetings.</p>
          )}
          {groupGreetings.map((g, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                className="textarea flex-1"
                rows={3}
                value={g}
                placeholder="*The character joins the group…*"
                onChange={(e) => setGroup(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeGroup(i)}
                className="btn-ghost shrink-0 px-2"
                aria-label="Remove"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addGroup} className="btn-secondary text-sm">
            <Plus size={15} /> Add
          </button>
        </div>
      </Field>

      <div>
        <InfoLabel
          label="Message Examples"
          hint="Example conversations to guide the AI. Use <START> to separate examples."
        />
        <textarea
          className="textarea font-mono text-[13px]"
          rows={10}
          value={card.mes_example}
          onChange={(e) => updateCard({ mes_example: e.target.value })}
          placeholder={"<START>\n{{user}}: Hello!\n{{char}}: *smiles* Well met."}
        />
        <p className="field-hint">
          Example conversations to guide the AI. Use <code>{"<START>"}</code> to separate
          examples.
        </p>
      </div>
    </div>
  );
}

function GreetingCard({
  index,
  value,
  total,
  label,
  placeholder,
  onChange,
  onRemove,
  onMove,
}: {
  index: number;
  value: string;
  total: number;
  label: string;
  placeholder: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-[12px] border border-[#ffffff0f] bg-zinc-900/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex flex-col text-zinc-600">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="hover:text-zinc-300 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="hover:text-zinc-300 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        <GripVertical size={14} className="text-zinc-700" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 truncate text-left text-sm font-medium text-zinc-200"
        >
          {label}
          {!open && value && (
            <span className="ml-2 font-normal text-zinc-500">
              {value.slice(0, 48)}…
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="btn-ghost px-2"
          aria-label="Delete greeting"
        >
          <X size={16} />
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3">
          <textarea
            className="textarea"
            rows={5}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

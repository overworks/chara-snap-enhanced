import { Plus, X } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import { TextInput, TextArea, Field } from "../../fields";

export default function IdentityTab() {
  const { state, updateCard, mutateCard } = useCard();
  const { card } = state;

  const notes = card.creator_notes_multilingual ?? {};
  const noteEntries = Object.entries(notes);

  function setNote(oldLang: string, lang: string, text: string) {
    mutateCard((c) => {
      const next = { ...(c.creator_notes_multilingual ?? {}) };
      if (oldLang !== lang) delete next[oldLang];
      next[lang] = text;
      return { ...c, creator_notes_multilingual: next };
    });
  }
  function removeNote(lang: string) {
    mutateCard((c) => {
      const next = { ...(c.creator_notes_multilingual ?? {}) };
      delete next[lang];
      return { ...c, creator_notes_multilingual: next };
    });
  }
  function addNote() {
    mutateCard((c) => ({
      ...c,
      creator_notes_multilingual: {
        ...(c.creator_notes_multilingual ?? {}),
        "": "",
      },
    }));
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Name"
          tooltip="The character's display name."
          value={card.name}
          onChange={(v) => updateCard({ name: v })}
          placeholder="Character name"
        />
        <TextInput
          label="Nickname"
          tooltip="An optional display-name override (V3)."
          value={card.nickname ?? ""}
          onChange={(v) => updateCard({ nickname: v })}
          placeholder="Display name override…"
        />
      </div>

      <TextArea
        label="Description"
        tooltip="The core definition of the character — the main block the AI roleplays from."
        hint="Who is this character? Personality, appearance, backstory."
        value={card.description}
        onChange={(v) => updateCard({ description: v })}
        placeholder="A detailed description of the character…"
        rows={8}
      />

      <TextArea
        label="Personality"
        tooltip="A short personality summary; some clients inject this separately."
        hint="Short personality summary (some clients use this separately)."
        value={card.personality}
        onChange={(v) => updateCard({ personality: v })}
        placeholder="Personality traits…"
        rows={3}
      />

      <TextArea
        label="Scenario"
        tooltip="The current situation or context for the conversation."
        hint="The current situation or context for the conversation."
        value={card.scenario}
        onChange={(v) => updateCard({ scenario: v })}
        placeholder="Describe the scenario…"
        rows={3}
      />

      <div className="card-surface space-y-4 p-4">
        <TextArea
          label="Creator Notes"
          tooltip="Metadata shown to users importing the card — not sent to the AI."
          hint="Metadata visible to users importing this card — not sent to AI."
          value={card.creator_notes}
          onChange={(v) => updateCard({ creator_notes: v })}
          placeholder="Usage tips, recommended settings…"
          rows={3}
        />

        <Field
          label="Multilingual Notes"
          tooltip="Creator notes in additional languages (V3)."
        >
          <div className="space-y-2">
            {noteEntries.length === 0 && (
              <p className="text-xs text-zinc-600">No multilingual notes.</p>
            )}
            {noteEntries.map(([lang, text], i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input w-20 shrink-0"
                  value={lang}
                  placeholder="en"
                  onChange={(e) => setNote(lang, e.target.value, text)}
                />
                <textarea
                  className="textarea flex-1"
                  rows={2}
                  value={text}
                  placeholder="Translated notes…"
                  onChange={(e) => setNote(lang, lang, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeNote(lang)}
                  className="btn-ghost shrink-0 px-2"
                  aria-label="Remove note"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addNote} className="btn-secondary text-xs">
              <Plus size={14} /> Add
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}

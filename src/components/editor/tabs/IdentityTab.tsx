import { Plus, X } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import { useI18n } from "../../../i18n";
import { TextInput, TextArea, Field } from "../../fields";

export default function IdentityTab() {
  const { state, updateCard, mutateCard } = useCard();
  const { d } = useI18n();
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
          label={d.identity.name}
          tooltip={d.identity.nameTip}
          value={card.name}
          onChange={(v) => updateCard({ name: v })}
          placeholder={d.identity.namePlaceholder}
        />
        <TextInput
          label={d.identity.nickname}
          tooltip={d.identity.nicknameTip}
          value={card.nickname ?? ""}
          onChange={(v) => updateCard({ nickname: v })}
          placeholder={d.identity.nicknamePlaceholder}
        />
      </div>

      <TextArea
        label={d.identity.description}
        tooltip={d.identity.descriptionTip}
        hint={d.identity.descriptionHint}
        value={card.description}
        onChange={(v) => updateCard({ description: v })}
        placeholder={d.identity.descriptionPlaceholder}
        rows={8}
      />

      <TextArea
        label={d.identity.personality}
        tooltip={d.identity.personalityTip}
        hint={d.identity.personalityHint}
        value={card.personality}
        onChange={(v) => updateCard({ personality: v })}
        placeholder={d.identity.personalityPlaceholder}
        rows={3}
      />

      <TextArea
        label={d.identity.scenario}
        tooltip={d.identity.scenarioTip}
        hint={d.identity.scenarioHint}
        value={card.scenario}
        onChange={(v) => updateCard({ scenario: v })}
        placeholder={d.identity.scenarioPlaceholder}
        rows={3}
      />

      <div className="card-surface space-y-4 p-4">
        <TextArea
          label={d.identity.creatorNotes}
          tooltip={d.identity.creatorNotesTip}
          hint={d.identity.creatorNotesHint}
          value={card.creator_notes}
          onChange={(v) => updateCard({ creator_notes: v })}
          placeholder={d.identity.creatorNotesPlaceholder}
          rows={3}
        />

        <Field label={d.identity.multilingual} tooltip={d.identity.multilingualTip}>
          <div className="space-y-2">
            {noteEntries.length === 0 && (
              <p className="text-xs text-fg-subtle">{d.identity.multilingualEmpty}</p>
            )}
            {noteEntries.map(([lang, text], i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input w-20 shrink-0"
                  value={lang}
                  placeholder={d.identity.multilingualLangPlaceholder}
                  onChange={(e) => setNote(lang, e.target.value, text)}
                />
                <textarea
                  className="textarea flex-1"
                  rows={2}
                  value={text}
                  placeholder={d.identity.multilingualTextPlaceholder}
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
              <Plus size={14} /> {d.common.add}
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}

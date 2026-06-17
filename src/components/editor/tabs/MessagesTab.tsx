import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Languages,
  Loader2,
} from "lucide-react";
import { useCard } from "../../../state/CardContext";
import { useSettings } from "../../../state/SettingsContext";
import { useI18n } from "../../../i18n";
import { TextArea, Field, InfoLabel } from "../../fields";
import {
  translate,
  translateLlm,
  getTarget,
  TranslateError,
  TRANSLATION_TARGETS,
} from "../../../lib/translate";
import { getProvider } from "../../../lib/providers";

export default function MessagesTab() {
  const { state, updateCard, mutateCard } = useCard();
  const { ai, translation, setTranslation } = useSettings();
  const { d, t } = useI18n();
  const tr = d.messages.translate;
  const { card } = state;
  const greetings = card.alternate_greetings;
  const groupGreetings = card.group_only_greetings ?? [];

  // Translation: a single in-flight source id disables all translate buttons.
  const [busy, setBusy] = useState<string | null>(null);
  const [trError, setTrError] = useState<string | null>(null);

  // The LLM engine uses the AI config (and its own key); others use their key.
  const usingLlm = translation.provider === "llm";
  const hasTranslationKey = usingLlm
    ? !getProvider(ai.provider).needsKey || ai.apiKey.trim() !== ""
    : translation.apiKey.trim() !== "";

  async function translateInto(sourceId: string, sourceText: string) {
    setTrError(null);
    const text = sourceText.trim();
    if (!text) return setTrError(tr.errNoText);
    if (!hasTranslationKey) return setTrError(tr.errNoKey);
    setBusy(sourceId);
    try {
      const result = usingLlm
        ? await translateLlm(text, getTarget(translation.targetLang).label, {
            provider: ai.provider,
            baseUrl: ai.baseUrl,
            apiKey: ai.apiKey,
            model: ai.model,
            prompt: translation.llmPrompt,
          })
        : await translate(
            text,
            translation.targetLang,
            translation.provider,
            translation.apiKey,
          );
      mutateCard((c) => ({
        ...c,
        alternate_greetings: [...c.alternate_greetings, result],
      }));
    } catch (e) {
      setTrError(
        e instanceof TranslateError && e.status
          ? t(tr.errHttp, { status: e.status })
          : tr.errNetwork,
      );
    } finally {
      setBusy(null);
    }
  }

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
      {/* Translation toolbar — applies to every translate action in this tab. */}
      <div className="card-surface flex flex-wrap items-center gap-3 p-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-fg">
          <Languages size={15} /> {tr.into}
        </span>
        <select
          className="input h-9 w-auto"
          value={translation.targetLang}
          onChange={(e) => setTranslation({ targetLang: e.target.value })}
        >
          {TRANSLATION_TARGETS.map((target) => (
            <option key={target.google} value={target.google}>
              {target.label}
            </option>
          ))}
        </select>
        {busy && <Loader2 size={15} className="animate-spin text-fg-muted" />}
        {trError && <span className="text-sm text-error">{trError}</span>}
        {!hasTranslationKey && (
          <Link
            to="/settings"
            className="ml-auto text-sm text-accent-text hover:underline"
          >
            {tr.configure}
          </Link>
        )}
      </div>

      <div className="space-y-2">
        <TextArea
          label={d.messages.first}
          tooltip={d.messages.firstTip}
          value={card.first_mes}
          onChange={(v) => updateCard({ first_mes: v })}
          placeholder={d.messages.firstPlaceholder}
          rows={8}
        />
        <button
          type="button"
          onClick={() => translateInto("first", card.first_mes)}
          disabled={busy !== null}
          className="btn-secondary text-sm disabled:opacity-60"
        >
          {busy === "first" ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin" /> {tr.translating}
            </span>
          ) : (
            <>
              <Languages size={14} /> {tr.toNewGreeting}
            </>
          )}
        </button>
      </div>

      <Field
        label={d.messages.altGreetings}
        tooltip={d.messages.altGreetingsTip}
        hint={d.messages.altGreetingsHint}
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
              onTranslate={() => translateInto(`g${i}`, g)}
              translating={busy === `g${i}`}
              translateBusy={busy !== null}
              translateTitle={tr.toNewGreeting}
              placeholder={d.messages.greetingPlaceholder}
              label={t(d.messages.greeting, { n: i + 1 })}
            />
          ))}
          <button type="button" onClick={addGreeting} className="btn-secondary text-sm">
            <Plus size={15} /> {d.messages.addGreeting}
          </button>
        </div>
      </Field>

      <Field
        label={d.messages.groupGreetings}
        tooltip={d.messages.groupGreetingsTip}
        hint={d.messages.groupGreetingsHint}
      >
        <div className="space-y-2">
          {groupGreetings.length === 0 && (
            <p className="text-xs text-fg-subtle">{d.messages.groupEmpty}</p>
          )}
          {groupGreetings.map((g, i) => (
            <div key={i} className="flex gap-2">
              <textarea
                className="textarea flex-1"
                rows={3}
                value={g}
                placeholder={d.messages.groupPlaceholder}
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
            <Plus size={15} /> {d.common.add}
          </button>
        </div>
      </Field>

      <div>
        <InfoLabel label={d.messages.examples} hint={d.messages.examplesTip} />
        <textarea
          className="textarea font-mono text-[13px]"
          rows={10}
          value={card.mes_example}
          onChange={(e) => updateCard({ mes_example: e.target.value })}
          placeholder={"<START>\n{{user}}: Hello!\n{{char}}: *smiles* Well met."}
        />
        <p className="field-hint">{d.messages.examplesHint}</p>
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
  onTranslate,
  translating,
  translateBusy,
  translateTitle,
}: {
  index: number;
  value: string;
  total: number;
  label: string;
  placeholder: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onTranslate: () => void;
  translating: boolean;
  translateBusy: boolean;
  translateTitle: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-[12px] border border-border bg-surface/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex flex-col text-fg-subtle">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="hover:text-fg-muted disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            className="hover:text-fg-muted disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>
        <GripVertical size={14} className="text-fg-subtle" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex-1 truncate text-left text-sm font-medium text-fg"
        >
          {label}
          {!open && value && (
            <span className="ml-2 font-normal text-fg-faint">
              {value.slice(0, 48)}…
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onTranslate}
          disabled={translateBusy}
          className="btn-ghost px-2 disabled:opacity-40"
          aria-label={translateTitle}
          title={translateTitle}
        >
          {translating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Languages size={15} />
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

import { useEffect, useState } from "react";
import { Check, RefreshCw, Wand2 } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import { useI18n } from "../../../i18n";
import { fromParsed, toV2Envelope, toV3Envelope, preferredVersion } from "../../../lib/card";

export default function RawJsonTab() {
  const { state, setState } = useCard();
  const { d } = useI18n();
  const [text, setText] = useState(() => currentJson());
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  function currentJson(): string {
    const version = preferredVersion(state.detectedVersion, state.card);
    const envelope =
      version === "v3"
        ? toV3Envelope(state.card, state.card.creation_date ?? Date.now())
        : toV2Envelope(state.card);
    return JSON.stringify(envelope, null, 2);
  }

  // Refresh the buffer when the underlying card changes (e.g. edits in other tabs).
  useEffect(() => {
    setText(currentJson());
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.card, state.detectedVersion]);

  function format() {
    try {
      setText(JSON.stringify(JSON.parse(text), null, 2));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : d.raw.invalid);
    }
  }

  function apply() {
    try {
      const parsed = JSON.parse(text);
      const { card, detectedVersion } = fromParsed(parsed);
      setState({ ...state, card, detectedVersion });
      setError(null);
      setApplied(true);
      setTimeout(() => setApplied(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : d.raw.invalid);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={format} className="btn-secondary text-sm">
          <Wand2 size={14} /> {d.raw.format}
        </button>
        <button onClick={() => setText(currentJson())} className="btn-secondary text-sm">
          <RefreshCw size={14} /> {d.raw.refresh}
        </button>
        <button onClick={apply} className="btn-primary text-sm">
          <Check size={14} /> {applied ? d.raw.applied : d.raw.apply}
        </button>
        <span className="ml-auto text-xs text-fg-subtle">{d.raw.hint}</span>
      </div>
      <textarea
        className={`textarea h-[60vh] font-mono text-[12px] leading-snug ${
          error ? "border-error" : ""
        }`}
        value={text}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}

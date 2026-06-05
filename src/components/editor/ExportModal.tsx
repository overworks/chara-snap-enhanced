import { useMemo, useState } from "react";
import { X, Download, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useCard } from "../../state/CardContext";
import { useI18n } from "../../i18n";
import type { ExportFormat, Severity } from "../../lib/types";
import { EXPORT_OPTIONS, exportCard, downloadBlob } from "../../lib/io";
import { validateCard } from "../../lib/validate";
import { countTokens } from "../../lib/tokens";
import { preferredVersion } from "../../lib/card";

const SEVERITY_ICON: Record<Severity, typeof Info> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};
const SEVERITY_COLOR: Record<Severity, string> = {
  error: "text-error",
  warning: "text-warning",
  info: "text-info",
};

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const { state } = useCard();
  const { d, t } = useI18n();
  const { card } = state;
  const defaultFormat: ExportFormat =
    preferredVersion(state.detectedVersion, card) === "v3" ? "png_v2v3" : "png_v2";
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [busy, setBusy] = useState(false);

  const issues = useMemo(() => validateCard(card), [card]);
  const tokens = useMemo(() => countTokens(card), [card]);
  const hasErrors = issues.some((i) => i.severity === "error");

  const tokenRows: [string, number][] = [
    [d.identity.description, tokens.description],
    [d.identity.personality, tokens.personality],
    [d.identity.scenario, tokens.scenario],
    [d.messages.first, tokens.first_mes],
    [d.messages.examples, tokens.mes_example],
    [d.prompts.system, tokens.system_prompt],
    [d.prompts.postHistory, tokens.post_history_instructions],
    [d.messages.altGreetings, tokens.alternate_greetings],
    [d.editor.tabs.lorebook, tokens.lorebook],
  ];

  function doExport() {
    setBusy(true);
    try {
      const result = exportCard(state, format, Date.now());
      downloadBlob(result.blob, result.filename);
      onClose();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : d.exportModal.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="card-surface flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-semibold">{d.exportModal.title}</h2>
          <button onClick={onClose} className="btn-ghost px-1.5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          {/* Format */}
          <div>
            <h3 className="field-label">{d.exportModal.format}</h3>
            <div className="space-y-1.5">
              {EXPORT_OPTIONS.map((opt) => {
                const f = d.exportModal.formats[opt.value];
                return (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-[10px] border px-3 py-2 transition ${
                      format === opt.value
                        ? "border-accent bg-accent-subtle"
                        : "border-border hover:border-border-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      className="mt-1 accent-accent"
                      checked={format === opt.value}
                      onChange={() => setFormat(opt.value)}
                    />
                    <div>
                      <div className="text-sm font-medium text-fg">{f.label}</div>
                      <div className="text-xs text-fg-faint">{f.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label={d.exportModal.greetings} value={1 + card.alternate_greetings.length} />
            <Stat
              label={d.exportModal.loreEntries}
              value={card.character_book?.entries.length ?? 0}
            />
            <Stat label={d.exportModal.assets} value={card.assets?.length ?? 0} />
          </div>

          {/* Token breakdown */}
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="field-label mb-0">{d.exportModal.tokenEstimate}</h3>
              <span className="text-sm font-semibold text-accent-text">
                {t(d.exportModal.total, { n: tokens.total })}
              </span>
            </div>
            <div className="rounded-[10px] border border-border text-xs">
              {tokenRows.map(([label, value], i) => (
                <div
                  key={i}
                  className={`flex justify-between px-3 py-1.5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="text-fg-faint">{label}</span>
                  <span className="text-fg-muted">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-fg-subtle">{d.exportModal.heuristic}</p>
          </div>

          {/* Validation */}
          {issues.length > 0 && (
            <div>
              <h3 className="field-label">{d.exportModal.checks}</h3>
              <ul className="space-y-1">
                {issues.map((issue, i) => {
                  const Icon = SEVERITY_ICON[issue.severity];
                  const message = t(
                    d.validation[issue.code as keyof typeof d.validation] ?? issue.code,
                    issue.params,
                  );
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Icon
                        size={13}
                        className={`mt-0.5 shrink-0 ${SEVERITY_COLOR[issue.severity]}`}
                      />
                      <span className="text-fg-muted">
                        <span className="text-fg-faint">{issue.field}:</span> {message}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-3">
          <button
            onClick={doExport}
            disabled={busy || hasErrors}
            className="btn-primary w-full"
          >
            <Download size={16} />
            {busy
              ? d.exportModal.exporting
              : hasErrors
                ? d.exportModal.fixErrors
                : d.exportModal.download}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface/40 py-2">
      <div className="text-lg font-semibold text-fg">{value}</div>
      <div className="text-[11px] text-fg-faint">{label}</div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { X, Download, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useCard } from "../../state/CardContext";
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
  const { card } = state;
  const defaultFormat: ExportFormat =
    preferredVersion(state.detectedVersion, card) === "v3" ? "png_v2v3" : "png_v2";
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [busy, setBusy] = useState(false);

  const issues = useMemo(() => validateCard(card), [card]);
  const tokens = useMemo(() => countTokens(card), [card]);
  const hasErrors = issues.some((i) => i.severity === "error");

  const tokenRows: [string, number][] = [
    ["Description", tokens.description],
    ["Personality", tokens.personality],
    ["Scenario", tokens.scenario],
    ["First message", tokens.first_mes],
    ["Example messages", tokens.mes_example],
    ["System prompt", tokens.system_prompt],
    ["Post-history", tokens.post_history_instructions],
    ["Alt greetings", tokens.alternate_greetings],
    ["Lorebook", tokens.lorebook],
  ];

  function doExport() {
    setBusy(true);
    try {
      const result = exportCard(state, format, Date.now());
      downloadBlob(result.blob, result.filename);
      onClose();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Export failed.");
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
        <div className="flex items-center justify-between border-b border-[#ffffff0f] px-5 py-3">
          <h2 className="font-semibold">Export Character</h2>
          <button onClick={onClose} className="btn-ghost px-1.5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          {/* Format */}
          <div>
            <h3 className="field-label">Format</h3>
            <div className="space-y-1.5">
              {EXPORT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[10px] border px-3 py-2 transition ${
                    format === opt.value
                      ? "border-[#6d5cff] bg-[#6d5cff1a]"
                      : "border-[#ffffff0f] hover:border-[#ffffff1a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    className="mt-1 accent-[#6d5cff]"
                    checked={format === opt.value}
                    onChange={() => setFormat(opt.value)}
                  />
                  <div>
                    <div className="text-sm font-medium text-zinc-100">{opt.label}</div>
                    <div className="text-xs text-zinc-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Greetings" value={1 + card.alternate_greetings.length} />
            <Stat
              label="Lore entries"
              value={card.character_book?.entries.length ?? 0}
            />
            <Stat label="Assets" value={card.assets?.length ?? 0} />
          </div>

          {/* Token breakdown */}
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="field-label mb-0">Token estimate</h3>
              <span className="text-sm font-semibold text-[#7e70ff]">
                {tokens.total} total
              </span>
            </div>
            <div className="rounded-[10px] border border-[#ffffff0f] text-xs">
              {tokenRows.map(([label, value], i) => (
                <div
                  key={label}
                  className={`flex justify-between px-3 py-1.5 ${
                    i > 0 ? "border-t border-[#ffffff0f]" : ""
                  }`}
                >
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-zinc-300">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-zinc-600">
              Heuristic estimate — actual counts vary by tokenizer.
            </p>
          </div>

          {/* Validation */}
          {issues.length > 0 && (
            <div>
              <h3 className="field-label">Checks</h3>
              <ul className="space-y-1">
                {issues.map((issue, i) => {
                  const Icon = SEVERITY_ICON[issue.severity];
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Icon
                        size={13}
                        className={`mt-0.5 shrink-0 ${SEVERITY_COLOR[issue.severity]}`}
                      />
                      <span className="text-zinc-400">
                        <span className="text-zinc-500">{issue.field}:</span>{" "}
                        {issue.message}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-[#ffffff0f] px-5 py-3">
          <button
            onClick={doExport}
            disabled={busy || hasErrors}
            className="btn-primary w-full"
          >
            <Download size={16} />
            {busy ? "Exporting…" : hasErrors ? "Fix errors to export" : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] border border-[#ffffff0f] bg-zinc-900/40 py-2">
      <div className="text-lg font-semibold text-zinc-100">{value}</div>
      <div className="text-[11px] text-zinc-500">{label}</div>
    </div>
  );
}

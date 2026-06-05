import { useCard } from "../../../state/CardContext";
import type { DepthPrompt } from "../../../lib/types";
import { getDepthPrompt } from "../../../lib/card";
import { useI18n } from "../../../i18n";
import { TextArea, TextInput, Checkbox, Field, InfoLabel } from "../../fields";

const KNOWN = new Set(["depth_prompt", "talkativeness", "fav"]);

export default function ExtensionsTab() {
  const { state, mutateCard } = useCard();
  const { d } = useI18n();
  const ext = state.card.extensions;
  const depth = getDepthPrompt(state.card);
  const talkativeness =
    typeof ext.talkativeness === "number" ? ext.talkativeness : 0.5;
  const fav = ext.fav === true;

  function patchExt(patch: Record<string, unknown>) {
    mutateCard((c) => ({ ...c, extensions: { ...c.extensions, ...patch } }));
  }
  function setDepth(patch: Partial<DepthPrompt>) {
    const current: DepthPrompt = depth ?? { prompt: "", depth: 4, role: "system" };
    patchExt({ depth_prompt: { ...current, ...patch } });
  }

  const otherKeys = Object.keys(ext).filter((k) => !KNOWN.has(k));

  return (
    <div className="space-y-6">
      <div className="card-surface space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold text-fg">{d.extensions.depthPrompt}</h3>
          <p className="mt-0.5 text-xs text-fg-faint">{d.extensions.depthPromptDesc}</p>
        </div>
        <TextArea
          label={d.extensions.prompt}
          value={depth?.prompt ?? ""}
          onChange={(v) => setDepth({ prompt: v })}
          placeholder={d.extensions.promptPlaceholder}
          rows={4}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label={d.extensions.depth}
            type="number"
            value={depth?.depth ?? 4}
            onChange={(v) => setDepth({ depth: Number(v) || 0 })}
          />
          <Field label={d.extensions.role}>
            <select
              className="input"
              value={depth?.role ?? "system"}
              onChange={(e) =>
                setDepth({ role: e.target.value as DepthPrompt["role"] })
              }
            >
              <option value="system">{d.extensions.roleSystem}</option>
              <option value="user">{d.extensions.roleUser}</option>
              <option value="assistant">{d.extensions.roleAssistant}</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="card-surface space-y-2 p-4">
        <InfoLabel
          label={`${d.extensions.talkativeness} — ${talkativeness.toFixed(2)}`}
          hint={d.extensions.talkativenessTip}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={talkativeness}
          onChange={(e) => patchExt({ talkativeness: Number(e.target.value) })}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-fg-subtle">
          <span>{d.extensions.rarely}</span>
          <span>{d.extensions.always}</span>
        </div>
      </div>

      <div className="card-surface p-4">
        <Checkbox
          label={d.extensions.favorite}
          tooltip={d.extensions.favoriteTip}
          checked={fav}
          onChange={(v) => patchExt({ fav: v })}
        />
      </div>

      {otherKeys.length > 0 && (
        <div className="card-surface p-4">
          <h3 className="text-sm font-semibold text-fg">{d.extensions.other}</h3>
          <p className="mt-0.5 text-xs text-fg-faint">{d.extensions.otherDesc}</p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-[10px] bg-bg/60 p-3 text-[12px] text-fg-muted">
            {JSON.stringify(
              Object.fromEntries(otherKeys.map((k) => [k, ext[k]])),
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

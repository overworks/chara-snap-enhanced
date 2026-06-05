import { useCard } from "../../../state/CardContext";
import type { DepthPrompt } from "../../../lib/types";
import { getDepthPrompt } from "../../../lib/card";
import { TextArea, TextInput, Checkbox, Field, InfoLabel } from "../../fields";

const KNOWN = new Set(["depth_prompt", "talkativeness", "fav"]);

export default function ExtensionsTab() {
  const { state, mutateCard } = useCard();
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
          <h3 className="text-sm font-semibold text-zinc-200">Depth Prompt</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Injects text at a specific position in chat history — the "Author's Note"
            style injection.
          </p>
        </div>
        <TextArea
          label="Prompt"
          value={depth?.prompt ?? ""}
          onChange={(v) => setDepth({ prompt: v })}
          placeholder="Text to inject into the prompt…"
          rows={4}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Depth"
            type="number"
            value={depth?.depth ?? 4}
            onChange={(v) => setDepth({ depth: Number(v) || 0 })}
          />
          <Field label="Role">
            <select
              className="input"
              value={depth?.role ?? "system"}
              onChange={(e) =>
                setDepth({ role: e.target.value as DepthPrompt["role"] })
              }
            >
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="assistant">Assistant</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="card-surface space-y-2 p-4">
        <InfoLabel
          label={`Talkativeness — ${talkativeness.toFixed(2)}`}
          hint="Controls how often this character speaks in group chats (0 = rarely, 1 = always)."
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={talkativeness}
          onChange={(e) => patchExt({ talkativeness: Number(e.target.value) })}
          className="w-full accent-[#6d5cff]"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>0 — rarely</span>
          <span>1 — always</span>
        </div>
      </div>

      <div className="card-surface p-4">
        <Checkbox
          label="Favorite"
          tooltip="Marks this card as a favorite in supporting clients."
          checked={fav}
          onChange={(v) => patchExt({ fav: v })}
        />
      </div>

      {otherKeys.length > 0 && (
        <div className="card-surface p-4">
          <h3 className="text-sm font-semibold text-zinc-200">Other Extensions</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            App-specific data. Read-only — preserved on export.
          </p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-[10px] bg-zinc-950/60 p-3 text-[12px] text-zinc-400">
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

import { Plus, X } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import type { CardAsset, AssetType } from "../../../lib/types";
import { Field, TextInput } from "../../fields";

const ASSET_TYPES: AssetType[] = [
  "icon",
  "background",
  "emotion",
  "user_icon",
  "other",
];

export default function AssetsTab() {
  const { state, mutateCard } = useCard();
  const { card } = state;
  const sources = card.source ?? [];
  const assets = card.assets ?? [];

  const setSource = (i: number, v: string) =>
    mutateCard((c) => ({
      ...c,
      source: (c.source ?? []).map((s, idx) => (idx === i ? v : s)),
    }));
  const addSource = () =>
    mutateCard((c) => ({ ...c, source: [...(c.source ?? []), ""] }));
  const removeSource = (i: number) =>
    mutateCard((c) => ({
      ...c,
      source: (c.source ?? []).filter((_, idx) => idx !== i),
    }));

  const addAsset = () =>
    mutateCard((c) => ({
      ...c,
      assets: [
        ...(c.assets ?? []),
        { type: "icon", uri: "", name: "", ext: "png" },
      ],
    }));
  const updateAsset = (i: number, patch: Partial<CardAsset>) =>
    mutateCard((c) => ({
      ...c,
      assets: (c.assets ?? []).map((a, idx) =>
        idx === i ? { ...a, ...patch } : a,
      ),
    }));
  const removeAsset = (i: number) =>
    mutateCard((c) => ({
      ...c,
      assets: (c.assets ?? []).filter((_, idx) => idx !== i),
    }));

  return (
    <div className="space-y-6">
      <p className="text-xs text-zinc-500">
        Source links, assets, and timestamps live on the V3 card envelope and are preserved
        on export.
      </p>

      <Field
        label="Source Links"
        tooltip="Provenance URLs, origin IDs, or migration notes."
        hint="Provenance URLs, origin IDs, or migration notes."
      >
        <div className="space-y-2">
          {sources.length === 0 && (
            <p className="text-xs text-zinc-600">No source links.</p>
          )}
          {sources.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                value={s}
                placeholder="https://chub.ai/characters/…"
                onChange={(e) => setSource(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeSource(i)}
                className="btn-ghost px-2"
                aria-label="Remove source"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addSource} className="btn-secondary text-sm">
            <Plus size={15} /> Add Source
          </button>
        </div>
      </Field>

      <Field
        label="Assets"
        tooltip="Additional files (expression sprites, backgrounds). Embedded into CHARX exports."
        hint="Referenced assets such as expression sprites or backgrounds (V3 / CHARX)."
      >
        <div className="space-y-2">
          {assets.length === 0 && (
            <p className="text-xs text-zinc-600">No assets.</p>
          )}
          {assets.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 rounded-[12px] border border-[#ffffff0f] bg-zinc-900/40 p-3 sm:grid-cols-[7rem_1fr_5rem_auto]"
            >
              <select
                className="input"
                value={a.type}
                onChange={(e) =>
                  updateAsset(i, { type: e.target.value as AssetType })
                }
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                className="input"
                value={a.uri}
                placeholder="uri (embeded://… or https://…)"
                onChange={(e) => updateAsset(i, { uri: e.target.value })}
              />
              <input
                className="input"
                value={a.ext}
                placeholder="ext"
                onChange={(e) => updateAsset(i, { ext: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  value={a.name}
                  placeholder="name"
                  onChange={(e) => updateAsset(i, { name: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => removeAsset(i)}
                  className="btn-ghost px-2"
                  aria-label="Remove asset"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addAsset} className="btn-secondary text-sm">
            <Plus size={15} /> Add Asset
          </button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Creation Date (V3)"
          tooltip="Unix milliseconds. Auto-filled on V3 export if left blank."
          type="number"
          value={card.creation_date ?? ""}
          onChange={(v) =>
            mutateCard((c) => ({
              ...c,
              creation_date: v === "" ? undefined : Number(v),
            }))
          }
        />
        <TextInput
          label="Modification Date (V3)"
          tooltip="Unix milliseconds. Auto-filled on V3 export if left blank."
          type="number"
          value={card.modification_date ?? ""}
          onChange={(v) =>
            mutateCard((c) => ({
              ...c,
              modification_date: v === "" ? undefined : Number(v),
            }))
          }
        />
      </div>
    </div>
  );
}

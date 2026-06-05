import { Plus, X } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import type { CardAsset, AssetType } from "../../../lib/types";
import { useI18n } from "../../../i18n";
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
  const { d } = useI18n();
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
      <p className="text-xs text-fg-faint">{d.assets.intro}</p>

      <Field
        label={d.assets.sources}
        tooltip={d.assets.sourcesTip}
        hint={d.assets.sourcesHint}
      >
        <div className="space-y-2">
          {sources.length === 0 && (
            <p className="text-xs text-fg-subtle">{d.assets.sourcesEmpty}</p>
          )}
          {sources.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                value={s}
                placeholder={d.assets.sourcePlaceholder}
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
            <Plus size={15} /> {d.assets.addSource}
          </button>
        </div>
      </Field>

      <Field label={d.assets.assets} tooltip={d.assets.assetsTip} hint={d.assets.assetsHint}>
        <div className="space-y-2">
          {assets.length === 0 && (
            <p className="text-xs text-fg-subtle">{d.assets.assetsEmpty}</p>
          )}
          {assets.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-2 rounded-[12px] border border-border bg-surface/40 p-3 sm:grid-cols-[7rem_1fr_5rem_auto]"
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
                placeholder={d.assets.uriPlaceholder}
                onChange={(e) => updateAsset(i, { uri: e.target.value })}
              />
              <input
                className="input"
                value={a.ext}
                placeholder={d.assets.extPlaceholder}
                onChange={(e) => updateAsset(i, { ext: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  value={a.name}
                  placeholder={d.assets.namePlaceholder}
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
            <Plus size={15} /> {d.assets.addAsset}
          </button>
        </div>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label={d.assets.creationDate}
          tooltip={d.assets.creationDateTip}
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
          label={d.assets.modificationDate}
          tooltip={d.assets.modificationDateTip}
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

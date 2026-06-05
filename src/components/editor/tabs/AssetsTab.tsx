import { useEffect, useMemo, useState } from "react";
import { Plus, X, Upload, ImageOff } from "lucide-react";
import { useCard } from "../../../state/CardContext";
import type { CardAsset } from "../../../lib/types";
import { useI18n } from "../../../i18n";
import { Field, TextInput } from "../../fields";
import {
  KNOWN_ASSET_TYPES,
  isEmbededUri,
  isDataUri,
  isHttpUri,
  embededPath,
  toEmbededUri,
  buildAssetPath,
  extToMime,
  isPreviewableImage,
  normalizeExt,
} from "../../../lib/assets";

/**
 * Thumbnail that owns its object URL. Creating/revoking inside the effect (not
 * during render) keeps it correct under StrictMode's mount-time double-invoke —
 * each setup makes a fresh URL, so the cleanup never revokes one still on screen.
 */
function AssetThumbnail({
  bytes,
  directSrc,
  mime,
  alt,
}: {
  bytes: Uint8Array | null;
  directSrc: string | null;
  mime: string;
  alt: string;
}) {
  const [objUrl, setObjUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!bytes) {
      setObjUrl(null);
      return;
    }
    const url = URL.createObjectURL(new Blob([bytes as unknown as BlobPart], { type: mime }));
    setObjUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bytes, mime]);

  const src = directSrc ?? objUrl;
  if (!src) return <ImageOff size={18} className="text-fg-subtle" />;
  return <img src={src} alt={alt} className="h-full w-full object-cover" />;
}

export default function AssetsTab() {
  const { state, mutateCard, setAssetBytes } = useCard();
  const { d } = useI18n();
  const { card } = state;
  const sources = card.source ?? [];
  const assets = useMemo(() => card.assets ?? [], [card.assets]);

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
  const removeAsset = (i: number) => {
    const a = assets[i];
    if (a && isEmbededUri(a.uri)) setAssetBytes(embededPath(a.uri), null);
    mutateCard((c) => ({
      ...c,
      assets: (c.assets ?? []).filter((_, idx) => idx !== i),
    }));
  };

  async function onUpload(i: number, file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const a = assets[i];
    const ext = normalizeExt(file.name.split(".").pop() || a.ext || "bin");
    const name = a.name || file.name.replace(/\.[^.]+$/, "");
    // Avoid colliding with paths already in use by sibling embedded assets.
    const taken = new Set(
      assets
        .filter((x, idx) => idx !== i && isEmbededUri(x.uri))
        .map((x) => embededPath(x.uri)),
    );
    const path = buildAssetPath(a.type, name, ext, taken);
    if (isEmbededUri(a.uri)) setAssetBytes(embededPath(a.uri), null);
    setAssetBytes(path, bytes);
    updateAsset(i, { uri: toEmbededUri(path), ext, name });
  }

  const typeOptions = (current: string) =>
    KNOWN_ASSET_TYPES.includes(current as (typeof KNOWN_ASSET_TYPES)[number])
      ? [...KNOWN_ASSET_TYPES]
      : [current, ...KNOWN_ASSET_TYPES];

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
          {assets.map((a, i) => {
            const embedded = isEmbededUri(a.uri);
            const hasBytes = embedded && Boolean(state.assets[embededPath(a.uri)]);
            const showAsImage =
              isPreviewableImage(a.ext) || a.uri.startsWith("data:image");
            const bytes =
              embedded && showAsImage ? state.assets[embededPath(a.uri)] ?? null : null;
            const directSrc =
              showAsImage && !embedded && (isDataUri(a.uri) || isHttpUri(a.uri))
                ? a.uri
                : null;
            return (
              <div
                key={i}
                className="rounded-[12px] border border-border bg-surface/40 p-3"
              >
                <div className="flex gap-3">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-elevated">
                    <AssetThumbnail
                      bytes={bytes}
                      directSrc={directSrc}
                      mime={extToMime(a.ext)}
                      alt={a.name || "asset"}
                    />
                  </div>

                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[7rem_1fr_5rem]">
                    <select
                      className="input"
                      value={a.type}
                      onChange={(e) => updateAsset(i, { type: e.target.value })}
                    >
                      {typeOptions(a.type).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input"
                      value={a.name}
                      placeholder={d.assets.namePlaceholder}
                      onChange={(e) => updateAsset(i, { name: e.target.value })}
                    />
                    <input
                      className="input"
                      value={a.ext}
                      placeholder={d.assets.extPlaceholder}
                      onChange={(e) => updateAsset(i, { ext: e.target.value })}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAsset(i)}
                    className="btn-ghost h-9 px-2"
                    aria-label="Remove asset"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    className="input flex-1"
                    value={a.uri}
                    placeholder={d.assets.uriPlaceholder}
                    onChange={(e) => updateAsset(i, { uri: e.target.value })}
                  />
                  <label className="btn-secondary shrink-0 cursor-pointer text-sm">
                    <Upload size={14} /> {d.assets.upload}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onUpload(i, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {embedded &&
                  (hasBytes ? (
                    <p className="mt-1.5 text-[11px] text-success">
                      {d.assets.embedded}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-warning">
                      {d.assets.missingBytes}
                    </p>
                  ))}
              </div>
            );
          })}
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

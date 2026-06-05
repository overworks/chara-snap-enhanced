import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { useCard } from "../../state/CardContext";
import { imageFileToPng } from "../../lib/image";
import { pngObjectUrl } from "../../lib/io";
import { useI18n } from "../../i18n";
import { TextInput } from "../fields";

export default function ProfilePanel() {
  const { state, updateCard, setAvatar } = useCard();
  const { d } = useI18n();
  const { card } = state;
  const fileRef = useRef<HTMLInputElement>(null);

  async function onAvatar(file: File) {
    try {
      const png = await imageFileToPng(file);
      setAvatar(png, pngObjectUrl(png));
    } catch (e) {
      console.error(e);
    }
  }

  const tags = card.tags;

  function setTags(raw: string) {
    updateCard({
      tags: raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative block w-full overflow-hidden rounded-[14px] border border-border bg-surface/40"
      >
        <div className="aspect-[2/3] w-full">
          {state.avatarUrl ? (
            <img
              src={state.avatarUrl}
              alt={card.name || "avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-fg-subtle">
              <ImagePlus size={28} />
              <span className="text-xs">{d.profile.addAvatar}</span>
            </div>
          )}
        </div>
        {state.avatarUrl && (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">
            {d.profile.changeAvatar}
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onAvatar(f);
          e.target.value = "";
        }}
      />

      <TextInput
        label={d.profile.name}
        tooltip={d.profile.nameTip}
        value={card.name}
        onChange={(v) => updateCard({ name: v })}
        placeholder={d.profile.namePlaceholder}
      />
      <TextInput
        label={d.profile.creator}
        tooltip={d.profile.creatorTip}
        value={card.creator}
        onChange={(v) => updateCard({ creator: v })}
        placeholder={d.profile.creatorPlaceholder}
      />

      <div>
        <TextInput
          label={d.profile.tags}
          tooltip={d.profile.tagsTip}
          value={tags.join(", ")}
          onChange={setTags}
          placeholder={d.profile.tagsPlaceholder}
        />
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span key={`${t}-${i}`} className="chip">
                {t}
                <button
                  type="button"
                  onClick={() =>
                    updateCard({ tags: tags.filter((_, idx) => idx !== i) })
                  }
                  className="text-fg-faint hover:text-fg"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <TextInput
        label={d.profile.version}
        tooltip={d.profile.versionTip}
        value={card.character_version}
        onChange={(v) => updateCard({ character_version: v })}
        placeholder={d.profile.versionPlaceholder}
      />

      {state.detectedVersion && (
        <div className="rounded-[10px] border border-border bg-surface/40 px-3 py-2 text-xs text-fg-faint">
          {d.profile.importedAs}{" "}
          <span className="font-medium uppercase text-accent-text">
            {state.detectedVersion}
          </span>
          {state.fileName && (
            <span className="block truncate text-fg-subtle">{state.fileName}</span>
          )}
        </div>
      )}
    </div>
  );
}

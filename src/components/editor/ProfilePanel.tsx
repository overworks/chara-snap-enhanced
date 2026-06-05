import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { useCard } from "../../state/CardContext";
import { imageFileToPng } from "../../lib/image";
import { pngObjectUrl } from "../../lib/io";
import { TextInput } from "../fields";

export default function ProfilePanel() {
  const { state, updateCard, setAvatar } = useCard();
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
        className="group relative block w-full overflow-hidden rounded-[14px] border border-[#ffffff0f] bg-zinc-900/40"
      >
        <div className="aspect-[2/3] w-full">
          {state.avatarUrl ? (
            <img
              src={state.avatarUrl}
              alt={card.name || "avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-600">
              <ImagePlus size={28} />
              <span className="text-xs">Add avatar</span>
            </div>
          )}
        </div>
        {state.avatarUrl && (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs text-zinc-200 opacity-0 transition group-hover:opacity-100">
            Change avatar
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
        label="Name"
        tooltip="The character's display name, used for the {{char}} placeholder."
        value={card.name}
        onChange={(v) => updateCard({ name: v })}
        placeholder="Character name"
      />
      <TextInput
        label="Creator"
        tooltip="Your name or handle, shown in card listings."
        value={card.creator}
        onChange={(v) => updateCard({ creator: v })}
        placeholder="Your name"
      />

      <div>
        <TextInput
          label="Tags"
          tooltip="Comma-separated tags used by hosting sites for search and filtering."
          value={tags.join(", ")}
          onChange={setTags}
          placeholder="tag1, tag2, tag3"
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
                  className="text-zinc-500 hover:text-zinc-200"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <TextInput
        label="Character Version"
        tooltip="A version string for tracking revisions, e.g. 1.0."
        value={card.character_version}
        onChange={(v) => updateCard({ character_version: v })}
        placeholder="1.0"
      />

      {state.detectedVersion && (
        <div className="rounded-[10px] border border-[#ffffff0f] bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
          Imported as{" "}
          <span className="font-medium uppercase text-[#7e70ff]">
            {state.detectedVersion}
          </span>
          {state.fileName && (
            <span className="block truncate text-zinc-600">{state.fileName}</span>
          )}
        </div>
      )}
    </div>
  );
}

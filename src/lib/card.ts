// Card factory, normalization, and V2/V3 envelope (de)serialization.

import type {
  CharacterCard,
  CardVersion,
  Lorebook,
  LorebookEntry,
  DepthPrompt,
  AssetType,
} from "./types";

export const V2_SPEC = "chara_card_v2";
export const V3_SPEC = "chara_card_v3";

/** A blank card with every V2 field defaulted. */
export function emptyCard(): CharacterCard {
  return {
    name: "",
    description: "",
    personality: "",
    scenario: "",
    first_mes: "",
    mes_example: "",
    creator_notes: "",
    system_prompt: "",
    post_history_instructions: "",
    alternate_greetings: [],
    tags: [],
    creator: "",
    character_version: "",
    extensions: {},
  };
}

/** A fresh lorebook entry; `id`/`insertion_order` derive from the index. */
export function emptyEntry(index = 0): LorebookEntry {
  return {
    keys: [],
    content: "",
    extensions: {},
    enabled: true,
    insertion_order: index,
    case_sensitive: false,
    name: "",
    priority: 10,
    id: index,
    comment: "",
    selective: false,
    secondary_keys: [],
    constant: false,
    position: "before_char",
  };
}

export function emptyLorebook(): Lorebook {
  return { entries: [], extensions: {} };
}

const asString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const asStringRecord = (v: unknown): Record<string, string> => {
  const out: Record<string, string> = {};
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string") out[k] = val;
    }
  }
  return out;
};

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};

function normalizeEntry(raw: unknown, index: number): LorebookEntry {
  const e = asObject(raw);
  return {
    keys: asStringArray(e.keys),
    content: asString(e.content),
    extensions: asObject(e.extensions),
    enabled: e.enabled !== false,
    insertion_order:
      typeof e.insertion_order === "number" ? e.insertion_order : index,
    case_sensitive: e.case_sensitive === true,
    name: asString(e.name),
    priority: typeof e.priority === "number" ? e.priority : 10,
    id: typeof e.id === "number" ? e.id : index,
    comment: asString(e.comment),
    selective: e.selective === true,
    secondary_keys: asStringArray(e.secondary_keys),
    constant: e.constant === true,
    position: e.position === "after_char" ? "after_char" : "before_char",
  };
}

function normalizeLorebook(raw: unknown): Lorebook | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const b = raw as Record<string, unknown>;
  const entries = Array.isArray(b.entries)
    ? b.entries.map((e, i) => normalizeEntry(e, i))
    : [];
  const book: Lorebook = {
    entries,
    extensions: asObject(b.extensions),
  };
  if (typeof b.name === "string") book.name = b.name;
  if (typeof b.description === "string") book.description = b.description;
  if (typeof b.scan_depth === "number") book.scan_depth = b.scan_depth;
  if (typeof b.token_budget === "number") book.token_budget = b.token_budget;
  if (typeof b.recursive_scanning === "boolean")
    book.recursive_scanning = b.recursive_scanning;
  return book;
}

/** Normalize any raw card `data` object into a complete CharacterCard. */
export function normalizeCard(raw: unknown): CharacterCard {
  const d = asObject(raw);
  const card: CharacterCard = {
    name: asString(d.name),
    description: asString(d.description),
    personality: asString(d.personality),
    scenario: asString(d.scenario),
    first_mes: asString(d.first_mes),
    mes_example: asString(d.mes_example),
    creator_notes: asString(d.creator_notes),
    system_prompt: asString(d.system_prompt),
    post_history_instructions: asString(d.post_history_instructions),
    alternate_greetings: asStringArray(d.alternate_greetings),
    tags: asStringArray(d.tags),
    creator: asString(d.creator),
    character_version: asString(d.character_version),
    extensions: asObject(d.extensions),
  };

  const book = normalizeLorebook(d.character_book);
  if (book) card.character_book = book;

  // V3 fields — only attach when present so V2 detection stays accurate.
  if (typeof d.nickname === "string") card.nickname = d.nickname;
  if (Array.isArray(d.group_only_greetings))
    card.group_only_greetings = asStringArray(d.group_only_greetings);
  if (d.creator_notes_multilingual)
    card.creator_notes_multilingual = asStringRecord(
      d.creator_notes_multilingual,
    );
  if (Array.isArray(d.assets)) {
    const types = ["icon", "background", "emotion", "user_icon", "other"];
    card.assets = (d.assets as unknown[]).map((a) => {
      const o = asObject(a);
      return {
        type: (types.includes(o.type as string) ? o.type : "other") as AssetType,
        uri: asString(o.uri),
        name: asString(o.name),
        ext: asString(o.ext, "png"),
      };
    });
  }
  if (Array.isArray(d.source)) card.source = asStringArray(d.source);
  if (typeof d.creation_date === "number") card.creation_date = d.creation_date;
  if (typeof d.modification_date === "number")
    card.modification_date = d.modification_date;

  return card;
}

/** True if the card uses any V3-only field. */
export function hasV3Fields(card: CharacterCard): boolean {
  return Boolean(
    (typeof card.nickname === "string" && card.nickname.trim()) ||
      card.group_only_greetings?.length ||
      card.assets?.length ||
      typeof card.creation_date === "number" ||
      typeof card.modification_date === "number" ||
      card.source?.length ||
      (card.creator_notes_multilingual &&
        Object.keys(card.creator_notes_multilingual).length > 0),
  );
}

/** Decide the best export spec given how the card was detected + its content. */
export function preferredVersion(
  detected: CardVersion | null,
  card: CharacterCard,
): "v2" | "v3" {
  return detected === "v3" || hasV3Fields(card) ? "v3" : "v2";
}

/** Wrap a card in the V2 envelope (strips V3-only fields). */
export function toV2Envelope(card: CharacterCard) {
  const {
    nickname,
    group_only_greetings,
    creator_notes_multilingual,
    assets,
    source,
    creation_date,
    modification_date,
    ...v2
  } = card;
  return { spec: V2_SPEC, spec_version: "2.0", data: v2 };
}

/** Wrap a card in the V3 envelope, auto-stamping dates when missing. */
export function toV3Envelope(card: CharacterCard, now: number) {
  return {
    spec: V3_SPEC,
    spec_version: "3.0",
    data: {
      ...card,
      creation_date: card.creation_date ?? now,
      modification_date: card.modification_date ?? now,
    },
  };
}

/** Detect version + normalize from a parsed JSON object (any of v1/v2/v3). */
export function fromParsed(parsed: unknown): {
  card: CharacterCard;
  detectedVersion: CardVersion;
} {
  const obj = asObject(parsed);
  if (obj.spec === V3_SPEC) {
    return { card: normalizeCard(obj.data ?? obj), detectedVersion: "v3" };
  }
  if (obj.spec === V2_SPEC) {
    return { card: normalizeCard(obj.data ?? obj), detectedVersion: "v2" };
  }
  // Legacy V1: bare object, no spec wrapper.
  return { card: normalizeCard(obj), detectedVersion: "v1" };
}

/** Read the depth_prompt extension, if present and well-formed. */
export function getDepthPrompt(card: CharacterCard): DepthPrompt | null {
  const dp = card.extensions?.depth_prompt;
  if (dp && typeof dp === "object") {
    const o = dp as Record<string, unknown>;
    return {
      prompt: asString(o.prompt),
      depth: typeof o.depth === "number" ? o.depth : 4,
      role:
        o.role === "user" || o.role === "assistant"
          ? o.role
          : "system",
    };
  }
  return null;
}

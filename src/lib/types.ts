// Character Card data model — V2 (chara_card_v2) + V3 (chara_card_v3).
// Reconstructed from the SillyTavern Character Card V2/V3 specs and Chara Snap behavior.

export type CardVersion = "v1" | "v2" | "v3";

export interface DepthPrompt {
  prompt: string;
  depth: number;
  role: "system" | "user" | "assistant";
}

export interface LorebookEntry {
  keys: string[];
  content: string;
  extensions: Record<string, unknown>;
  enabled: boolean;
  insertion_order: number;
  case_sensitive: boolean;
  name: string;
  priority: number;
  id: number;
  comment: string;
  selective: boolean;
  secondary_keys: string[];
  constant: boolean;
  position: "before_char" | "after_char";
  /** V3: treat keys as regular expressions when matching. */
  use_regex: boolean;
}

export interface Lorebook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  entries: LorebookEntry[];
  extensions: Record<string, unknown>;
}

/** Preset asset types. V3 also allows custom `x_`-prefixed types, so `CardAsset.type` is a free string. */
export type AssetType = "icon" | "background" | "emotion" | "user_icon" | "other";

export interface CardAsset {
  /** A known AssetType value or a custom (e.g. `x_live2d`) type. */
  type: string;
  uri: string;
  name: string;
  ext: string;
}

// The unified in-memory card. Holds every V2 + V3 field; export strips to target spec.
export interface CharacterCard {
  // V2 core
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  alternate_greetings: string[];
  tags: string[];
  creator: string;
  character_version: string;
  extensions: Record<string, unknown>;
  character_book?: Lorebook;

  // V3 additions
  nickname?: string;
  group_only_greetings?: string[];
  creator_notes_multilingual?: Record<string, string>;
  assets?: CardAsset[];
  source?: string[];
  creation_date?: number;
  modification_date?: number;
}

// Full editor state around a card.
export interface CardState {
  card: CharacterCard;
  originalPngBytes: Uint8Array | null;
  avatarUrl: string | null;
  detectedVersion: CardVersion | null;
  fileName: string | null;
  /** Embedded CHARX asset bytes, keyed by zip-internal path (the `embeded://` target). */
  assets: Record<string, Uint8Array>;
}

export type ExportFormat =
  | "png_v2v3"
  | "png_v2"
  | "png_v3"
  | "json_v2"
  | "json_v3"
  | "charx";

export interface ExportOption {
  value: ExportFormat;
  label: string;
  description: string;
}

export type Severity = "error" | "warning" | "info";

export interface ValidationIssue {
  field: string;
  /** Key into the i18n `validation` dictionary. */
  code: string;
  /** Interpolation params for the message (e.g. { n: 2 }). */
  params?: Record<string, string | number>;
  severity: Severity;
}

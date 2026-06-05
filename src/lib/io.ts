// High-level import/export: detect file type, read a card, produce export blobs.

import type {
  CharacterCard,
  CardAsset,
  CardState,
  CardVersion,
  ExportFormat,
  ExportOption,
} from "./types";
import {
  fromParsed,
  toV2Envelope,
  toV3Envelope,
  emptyCard,
} from "./card";
import {
  readTextChunks,
  decodeBase64Json,
  encodeBase64Json,
  writeCardChunks,
} from "./png";
import { readCharx, writeCharx, looksLikeCharx } from "./charx";
import {
  isEmbededUri,
  embededPath,
  extToMime,
  extOf,
  findMainIcon,
  isPreviewableImage,
  normalizeExt,
} from "./assets";

export const EXPORT_OPTIONS: ExportOption[] = [
  {
    value: "png_v2v3",
    label: "PNG (V2 + V3)",
    description: "Both specs embedded — maximum compatibility",
  },
  {
    value: "png_v2",
    label: "PNG (V2 only)",
    description: "Standard format for most apps",
  },
  {
    value: "png_v3",
    label: "PNG (V3 only)",
    description: "Newer spec with V3 features",
  },
  { value: "json_v2", label: "JSON (V2)", description: "Data only, no image" },
  {
    value: "json_v3",
    label: "JSON (V3)",
    description: "Data only with V3 fields",
  },
  {
    value: "charx",
    label: "CHARX (.charx)",
    description: "V3 ZIP archive with embedded assets",
  },
];

/** Read a card from PNG bytes (looks for ccv3 then chara tEXt chunk). */
export function readCardFromPng(bytes: Uint8Array): {
  card: CharacterCard;
  detectedVersion: CardVersion;
} {
  const chunks = readTextChunks(bytes);
  if (chunks.ccv3) return fromParsed(decodeBase64Json(chunks.ccv3));
  if (chunks.chara) return fromParsed(decodeBase64Json(chunks.chara));
  throw new Error(
    'No character data found in this PNG (expected a "chara" or "ccv3" tEXt chunk).',
  );
}

/** Read a card from any supported file, returning a full CardState. */
export async function readCardFile(file: File): Promise<CardState> {
  const buf = new Uint8Array(await file.arrayBuffer());
  return readCardBytes(buf, file.name, file.type);
}

/** Build a CardState from raw card bytes, detecting PNG / CHARX / JSON. */
export function readCardBytes(
  bytes: Uint8Array,
  fileName: string,
  contentType = "",
): CardState {
  const lower = fileName.toLowerCase();
  const isPng =
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // "PK"

  // CHARX (zip) — by extension or zip magic bytes.
  const readAsCharx = (): CardState => {
    const { card, assets, detectedVersion } = readCharx(bytes);
    const avatar = resolveCharxAvatar(card, assets);
    return {
      card,
      originalPngBytes: avatar?.png ?? null,
      avatarUrl: avatar?.url ?? null,
      detectedVersion,
      fileName,
      assets,
    };
  };
  if (lower.endsWith(".charx") || (isZip && !lower.endsWith(".json"))) {
    return readAsCharx();
  }

  // PNG — by magic bytes or extension (a real character PNG, not a polyglot).
  if (isPng || lower.endsWith(".png")) {
    const { card, detectedVersion } = readCardFromPng(bytes);
    return {
      card,
      originalPngBytes: bytes,
      avatarUrl: pngObjectUrl(bytes),
      detectedVersion,
      fileName,
      assets: {},
    };
  }

  // Image-wrapped CHARX polyglot — RisuAI exports CharX embedded inside a JPEG
  // (named .jpg/.jpeg, or extension-less from a download endpoint). Detect the
  // appended ZIP by content, after the plain-PNG path has had its chance.
  if (!lower.endsWith(".json") && looksLikeCharx(bytes)) {
    return readAsCharx();
  }

  // JSON — extension, content-type, or fallback for anything else.
  const text = new TextDecoder().decode(bytes);
  const parsed: unknown = JSON.parse(text);
  // RisuRealm's JSON form wraps the card as { card, img }; unwrap it.
  const raw =
    parsed &&
    typeof parsed === "object" &&
    "card" in parsed &&
    !("spec" in parsed) &&
    !("data" in parsed) &&
    !("name" in parsed)
      ? (parsed as { card: unknown }).card
      : parsed;
  const { card, detectedVersion } = fromParsed(raw);
  return {
    card,
    originalPngBytes: null,
    avatarUrl: null,
    detectedVersion,
    fileName,
    assets: {},
  };
}

export interface ResolvedCardUrl {
  url: string;
  fileName: string;
}

/**
 * Resolve a user-pasted URL to a directly-fetchable card URL. Chub.ai /
 * CharacterHub character pages are rewritten to the CORS-open charhub avatars
 * CDN, which serves the full V2 card PNG. Any other URL is used as-is (works
 * when the host allows cross-origin reads, e.g. raw GitHub or a direct file).
 */
export function resolveCardUrl(raw: string): ResolvedCardUrl {
  const input = raw.trim();
  const m = input.match(
    /^https?:\/\/(?:www\.)?(?:chub\.ai|characterhub\.org)\/characters\/([^/?#]+)\/([^/?#]+)/i,
  );
  if (m) {
    const author = decodeURIComponent(m[1]);
    const name = decodeURIComponent(m[2]);
    return {
      url: `https://avatars.charhub.io/avatars/${author}/${name}/chara_card_v2.png`,
      fileName: `${name}.png`,
    };
  }
  // RisuRealm character page → its CORS-enabled dynamic download endpoint.
  const realm = input.match(
    /^https?:\/\/realm\.risuai\.net\/character\/([0-9a-fA-F-]+)/,
  );
  if (realm) {
    const id = realm[1];
    return {
      url: `https://realm.risuai.net/api/v1/download/dynamic/${id}?cors=true`,
      fileName: id, // extension is added from the response content-type
    };
  }
  let fileName = "character";
  try {
    const base = new URL(input).pathname.split("/").filter(Boolean).pop();
    if (base) fileName = decodeURIComponent(base);
  } catch {
    /* not a parseable URL — the fetch below will surface the error */
  }
  return { url: input, fileName };
}

/**
 * Fetch + parse a card from a public URL — a Chub/CharacterHub character page or
 * a direct .png/.json/.charx link. Browser-direct (no proxy, no backend); only
 * works for hosts that permit cross-origin reads.
 */
export async function readCardFromUrl(raw: string): Promise<CardState> {
  const { url, fileName } = resolveCardUrl(raw);
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "*/*" } });
  } catch {
    throw new Error(
      "Network or CORS error — the site may not allow direct browser access.",
    );
  }
  if (!res.ok) throw new Error(`The card URL returned HTTP ${res.status}.`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "";
  // Give extension-less names (e.g. a RisuRealm id) a sensible suffix.
  let name = fileName;
  if (!/\.(png|json|charx)$/i.test(name)) {
    const ext = extFromContentType(contentType);
    if (ext) name = `${name}.${ext}`;
  }
  return readCardBytes(bytes, name, contentType);
}

function extFromContentType(ct: string): string | null {
  const t = ct.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("charx") || t.includes("zip")) return "charx";
  if (t.includes("json")) return "json";
  return null;
}

/**
 * Resolve the avatar for a CHARX card. Prefers the embedded icon/main asset,
 * then any embedded image asset, then the first image file in the archive — so
 * cards that mislabel or omit their main icon still get a preview.
 */
function resolveCharxAvatar(
  card: CharacterCard,
  assets: Record<string, Uint8Array>,
): { png: Uint8Array | null; url: string } | null {
  const fromBytes = (bytes: Uint8Array, ext: string) => ({
    // Only reuse as the PNG export base when it's actually a PNG.
    png: normalizeExt(ext) === "png" ? bytes : null,
    url: URL.createObjectURL(bytesToBlob(bytes, extToMime(ext))),
  });
  const fromAsset = (a: CardAsset) => {
    if (!isEmbededUri(a.uri) || !isPreviewableImage(a.ext)) return null;
    const bytes = assets[embededPath(a.uri)];
    return bytes ? fromBytes(bytes, a.ext || "png") : null;
  };

  const main = findMainIcon(card.assets);
  if (main) {
    const r = fromAsset(main);
    if (r) return r;
  }
  for (const a of card.assets ?? []) {
    const r = fromAsset(a);
    if (r) return r;
  }
  for (const [path, bytes] of Object.entries(assets)) {
    if (isPreviewableImage(extOf(path))) return fromBytes(bytes, extOf(path) || "png");
  }
  return null;
}

/** Wrap raw bytes in a Blob (casts around TS's strict typed-array generics). */
function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as unknown as BlobPart], { type });
}

export function pngObjectUrl(bytes: Uint8Array): string {
  return URL.createObjectURL(bytesToBlob(bytes, "image/png"));
}

/** Fetch + parse a card PNG by URL (used for the bundled example cards). */
export async function loadExampleCard(
  url: string,
  fileName: string,
): Promise<CardState> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load example card (${res.status}).`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const { card, detectedVersion } = readCardFromPng(buf);
  return {
    card,
    originalPngBytes: buf,
    avatarUrl: pngObjectUrl(buf),
    detectedVersion,
    fileName,
    assets: {},
  };
}

/** A 1x1 transparent PNG, used when exporting a card that has no avatar yet. */
const BLANK_PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);

export interface ExportResult {
  blob: Blob;
  filename: string;
}

function safeBaseName(card: CharacterCard): string {
  const base = (card.name || "character").trim().toLowerCase();
  return base.replace(/[^a-z0-9-_]+/g, "_").replace(/^_+|_+$/g, "") || "character";
}

export function exportCard(
  state: CardState,
  format: ExportFormat,
  now: number,
): ExportResult {
  const { card } = state;
  const base = safeBaseName(card);

  if (format === "json_v2" || format === "json_v3") {
    const envelope =
      format === "json_v2" ? toV2Envelope(card) : toV3Envelope(card, now);
    const blob = new Blob([JSON.stringify(envelope, null, 2)], {
      type: "application/json",
    });
    return { blob, filename: `${base}.json` };
  }

  if (format === "charx") {
    const bytes = writeCharx(card, now, state.assets, state.originalPngBytes);
    return {
      blob: bytesToBlob(bytes, "application/octet-stream"),
      filename: `${base}.charx`,
    };
  }

  // PNG variants.
  const sourcePng = state.originalPngBytes ?? BLANK_PNG;
  const chunks: { keyword: string; text: string }[] = [];
  if (format === "png_v2v3" || format === "png_v3") {
    chunks.push({ keyword: "ccv3", text: encodeBase64Json(toV3Envelope(card, now)) });
  }
  if (format === "png_v2v3" || format === "png_v2") {
    chunks.push({ keyword: "chara", text: encodeBase64Json(toV2Envelope(card)) });
  }
  const out = writeCardChunks(sourcePng, chunks);
  return {
    blob: bytesToBlob(out, "image/png"),
    filename: `${base}.png`,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function newCardState(): CardState {
  return {
    card: emptyCard(),
    originalPngBytes: null,
    avatarUrl: null,
    detectedVersion: null,
    fileName: null,
    assets: {},
  };
}

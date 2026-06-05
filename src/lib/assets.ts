// V3 asset helpers: the `embeded://` URI scheme, the CHARX path layout, and
// data-URL (base64) codecs. Note the spec deliberately misspells the scheme as
// "embeded" — we follow the spec exactly so files round-trip with other apps.

import type { CardAsset } from "./types";

export const EMBEDED_PREFIX = "embeded://";
export const CCDEFAULT = "ccdefault:";

/** Asset `type` values the UI offers as presets. Custom (`x_*`) types are also valid. */
export const KNOWN_ASSET_TYPES = [
  "icon",
  "background",
  "emotion",
  "user_icon",
  "other",
] as const;

/** RisuAI's legacy embedded-asset scheme, accepted on import for compatibility. */
export const RISU_ASSET_PREFIX = "__asset:";

export function isEmbededUri(uri: string): boolean {
  return uri.startsWith(EMBEDED_PREFIX);
}

export function isDataUri(uri: string): boolean {
  return uri.startsWith("data:");
}

export function isHttpUri(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

export function isCcdefault(uri: string): boolean {
  return uri === CCDEFAULT || uri === "ccdefault";
}

/** A URI a reader resolves on its own — no embedded-file lookup needed. */
export function isExternalUri(uri: string): boolean {
  return isHttpUri(uri) || isDataUri(uri) || isCcdefault(uri);
}

/** Strip the `embeded://` scheme, returning the zip-internal path. */
export function embededPath(uri: string): string {
  return isEmbededUri(uri) ? uri.slice(EMBEDED_PREFIX.length) : uri;
}

export function toEmbededUri(path: string): string {
  return EMBEDED_PREFIX + path;
}

// --- CHARX path layout -------------------------------------------------------

const CATEGORY_BY_EXT: Record<string, string> = {
  png: "images", jpg: "images", jpeg: "images", gif: "images", webp: "images",
  avif: "images", bmp: "images", svg: "images",
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", m4a: "audio", aac: "audio",
  mp4: "video", webm: "video", mov: "video", mkv: "video",
  otf: "fonts", ttf: "fonts", woff: "fonts", woff2: "fonts",
  safetensors: "ai", ckpt: "ai", onnx: "ai", pt: "ai",
  lua: "code", js: "code", mjs: "code", ts: "code",
  obj: "3d", fbx: "3d", glb: "3d", gltf: "3d", vrm: "3d", pmx: "3d", pmd: "3d",
};

/** Map a file extension to its CHARX media-category folder. */
export function assetCategory(ext: string): string {
  return CATEGORY_BY_EXT[normalizeExt(ext)] ?? "other";
}

export function normalizeExt(ext: string): string {
  return ext.toLowerCase().replace(/^\.+/, "").trim();
}

function sanitizeSegment(s: string, fallback: string): string {
  const out = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return out || fallback;
}

/**
 * Build a unique, ASCII-safe CHARX path: `assets/{type}/{category}/{name}.{ext}`.
 * `taken` accumulates already-used paths so repeated names don't collide.
 */
export function buildAssetPath(
  type: string,
  name: string,
  ext: string,
  taken: Set<string>,
): string {
  const t = sanitizeSegment(type, "other");
  const cat = assetCategory(ext);
  const base = sanitizeSegment(name, "asset");
  const e = sanitizeSegment(normalizeExt(ext), "bin");
  let path = `assets/${t}/${cat}/${base}.${e}`;
  let i = 2;
  while (taken.has(path)) {
    path = `assets/${t}/${cat}/${base}_${i}.${e}`;
    i++;
  }
  taken.add(path);
  return path;
}

// --- data: URL + base64 codecs ----------------------------------------------

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", avif: "image/avif", bmp: "image/bmp", svg: "image/svg+xml",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
  mp4: "video/mp4", webm: "video/webm",
};

export function extToMime(ext: string): string {
  return MIME_BY_EXT[normalizeExt(ext)] ?? "application/octet-stream";
}

export function mimeToExt(mime: string): string {
  const m = mime.split(";")[0].trim().toLowerCase();
  for (const [ext, mt] of Object.entries(MIME_BY_EXT)) {
    if (mt === m && ext !== "jpg") return ext;
  }
  return "bin";
}

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export function bytesToDataUrl(bytes: Uint8Array, mime: string): string {
  return `data:${mime};base64,${bytesToBase64(bytes)}`;
}

export interface DecodedDataUrl {
  bytes: Uint8Array;
  mime: string;
  ext: string;
}

/** Decode a `data:` URL into bytes + inferred extension, or null if not a data URL. */
export function parseDataUrl(uri: string): DecodedDataUrl | null {
  const m = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(uri);
  if (!m) return null;
  const mime = m[1] || "application/octet-stream";
  const bytes = m[2]
    ? base64ToBytes(m[3])
    : new TextEncoder().encode(decodeURIComponent(m[3]));
  return { bytes, mime, ext: mimeToExt(mime) };
}

const PREVIEWABLE = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg",
]);

export function isPreviewableImage(ext: string): boolean {
  return PREVIEWABLE.has(normalizeExt(ext));
}

/** Find the asset a host would use as the main avatar (icon/main, else any icon). */
export function findMainIcon(assets: CardAsset[] | undefined): CardAsset | undefined {
  if (!assets?.length) return undefined;
  return (
    assets.find((a) => a.type === "icon" && a.name === "main") ??
    assets.find((a) => a.type === "icon")
  );
}

/** Lowercased extension of a path/filename, or "" if none. */
export function extOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot > 0 ? normalizeExt(base.slice(dot + 1)) : "";
}

/** Filename without directory or extension. */
export function baseName(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}

/**
 * The intended in-archive key for an asset URI, or null for external/data URIs.
 * Accepts `embeded://`, RisuAI's `__asset:`, and scheme-less bare paths.
 */
export function embeddedKey(uri: string): string | null {
  if (!uri) return null;
  if (isEmbededUri(uri)) return uri.slice(EMBEDED_PREFIX.length);
  if (uri.startsWith(RISU_ASSET_PREFIX)) return uri.slice(RISU_ASSET_PREFIX.length);
  if (isExternalUri(uri)) return null;
  // A bare path with no URI scheme — some exporters drop the `embeded://`.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(uri)) return uri;
  return null;
}

function cleanKey(key: string): string {
  let k = key.trim().replace(/^\.?\/+/, ""); // strip leading "/" or "./"
  try {
    k = decodeURIComponent(k);
  } catch {
    /* leave as-is on malformed escapes */
  }
  return k;
}

/**
 * Match an asset URI to a real archive path, tolerating the URL-encoding,
 * casing, leading-slash and folder-layout differences seen in non-conformant
 * CHARX files. Returns the matched path, or null when nothing plausibly fits.
 */
export function matchEmbeddedPath(uri: string, paths: string[]): string | null {
  const key = embeddedKey(uri);
  if (key === null) return null;
  const want = cleanKey(key);
  if (!want) return null;

  const set = new Set(paths);
  if (set.has(key)) return key; // exact, raw
  if (set.has(want)) return want; // exact, cleaned

  // Case-insensitive full-path match.
  const wantLower = want.toLowerCase();
  for (const p of paths) {
    if (cleanKey(p).toLowerCase() === wantLower) return p;
  }

  // Fall back to a unique basename match (handles differing folder layouts).
  const wantBase = wantLower.split("/").pop();
  if (wantBase) {
    const byBase = paths.filter(
      (p) => cleanKey(p).toLowerCase().split("/").pop() === wantBase,
    );
    if (byBase.length === 1) return byBase[0];
    if (byBase.length > 1) return byBase[0]; // ambiguous: take the first
  }

  return null;
}

/** Derive an asset type from a `assets/{type}/...` path, else "other". */
export function typeFromPath(path: string): string {
  const m = /(?:^|\/)assets\/([^/]+)\//i.exec(path);
  if (!m) return "other";
  const t = m[1].toLowerCase();
  if ((KNOWN_ASSET_TYPES as readonly string[]).includes(t) || t.startsWith("x_"))
    return t;
  return "other";
}

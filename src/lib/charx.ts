// CHARX (.charx) read/write — a ZIP archive holding card.json plus assets/.
// The original Chara Snap exposed CHARX in the UI but never implemented it;
// this is a real implementation using fflate that embeds and rehydrates assets.

import { unzipSync, zipSync, strToU8, strFromU8 } from "fflate";
import type { CharacterCard, CardAsset, CardVersion } from "./types";
import { fromParsed, toV3Envelope } from "./card";
import {
  isEmbededUri,
  isExternalUri,
  embededPath,
  toEmbededUri,
  buildAssetPath,
  parseDataUrl,
  matchEmbeddedPath,
  isPreviewableImage,
  typeFromPath,
  baseName,
  extOf,
  normalizeExt,
} from "./assets";

export interface CharxResult {
  card: CharacterCard;
  assets: Record<string, Uint8Array>; // path (e.g. "assets/icon/images/main.png") -> bytes
  detectedVersion: CardVersion;
}

/** Parse a .charx (zip) buffer into a card + raw asset files (lenient). */
export function readCharx(bytes: Uint8Array): CharxResult {
  const files = unzipSync(bytes);
  // Prefer a root card.json, but accept one nested anywhere (case-insensitive).
  const keys = Object.keys(files);
  const cardKey =
    keys.find((k) => k === "card.json") ??
    keys.find((k) => k.toLowerCase() === "card.json") ??
    keys.find((k) => k.toLowerCase().endsWith("/card.json"));
  if (!cardKey) {
    throw new Error("CHARX archive is missing card.json.");
  }
  const parsed = JSON.parse(stripBom(strFromU8(files[cardKey])));
  const { card, detectedVersion } = fromParsed(parsed);

  const assets: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    if (path === cardKey) continue;
    if (path.endsWith("/")) continue; // directory entry
    assets[path] = content;
  }

  return { card: reconcileAssets(card, assets), assets, detectedVersion };
}

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

/**
 * Repair an imported card's asset references against the archive's real paths,
 * rewriting matched URIs to canonical `embeded://<path>`. When the card lists no
 * assets but the archive embeds images, surface them so nothing is silently lost.
 */
function reconcileAssets(
  card: CharacterCard,
  assets: Record<string, Uint8Array>,
): CharacterCard {
  const paths = Object.keys(assets);
  if (!paths.length) return card;
  let changed = false;

  let list: CardAsset[] = (card.assets ?? []).map((a) => ({ ...a }));
  for (const a of list) {
    if (isExternalUri(a.uri)) continue;
    const match = matchEmbeddedPath(a.uri, paths);
    if (match && a.uri !== toEmbededUri(match)) {
      a.uri = toEmbededUri(match);
      if (!a.ext || normalizeExt(a.ext) === "unknown") a.ext = extOf(match) || a.ext;
      changed = true;
    }
  }

  if (list.length === 0) {
    const images = paths.filter((p) => isPreviewableImage(extOf(p)));
    if (images.length) {
      const mainPath =
        images.find((p) => /(?:^|\/)assets\/icon\//i.test(p)) ??
        images.find((p) => /(?:^|\/)(?:main|avatar|icon|card)\b/i.test(p)) ??
        images[0];
      list = images.map((p) => {
        const isMain = p === mainPath;
        return {
          type: isMain ? "icon" : typeFromPath(p),
          uri: toEmbededUri(p),
          name: isMain ? "main" : baseName(p),
          ext: extOf(p) || "png",
        };
      });
      changed = true;
    }
  }

  return changed ? { ...card, assets: list } : card;
}

/**
 * Assemble the file map for a CHARX archive, rewriting `card.assets` URIs to
 * point at the embedded files. Returns the rewritten card alongside the files.
 *
 * Behavior per asset URI:
 *  - `embeded://path` — written from `embedded[path]` (kept as-is).
 *  - `data:` URL       — decoded, written under assets/, URI rewritten to embeded.
 *  - http(s) / ccdefault / other — left untouched (a reader resolves them).
 *
 * When `avatarPng` is provided and no embedded main icon exists, it is embedded
 * as the icon/main asset so the avatar survives the round-trip.
 */
export function buildCharxFiles(
  card: CharacterCard,
  embedded: Record<string, Uint8Array>,
  avatarPng?: Uint8Array | null,
): { card: CharacterCard; files: Record<string, Uint8Array> } {
  const files: Record<string, Uint8Array> = {};
  const taken = new Set<string>();
  const assets: CardAsset[] = (card.assets ?? []).map((a) => ({ ...a }));

  // Reserve paths already referenced so generated names don't collide with them.
  for (const a of assets) {
    if (isEmbededUri(a.uri)) taken.add(embededPath(a.uri));
  }

  for (const a of assets) {
    if (isEmbededUri(a.uri)) {
      const path = embededPath(a.uri);
      const bytes = embedded[path];
      if (bytes) files[path] = bytes; // can't embed what we don't hold
      continue;
    }
    const data = parseDataUrl(a.uri);
    if (data) {
      const ext = a.ext && normalizeExt(a.ext) !== "unknown" ? a.ext : data.ext;
      const path = buildAssetPath(a.type, a.name || "asset", ext, taken);
      files[path] = data.bytes;
      a.uri = toEmbededUri(path);
      if (!a.ext || normalizeExt(a.ext) === "unknown") a.ext = data.ext;
    }
    // http(s) / ccdefault / unresolved: leave the URI as the reader's problem.
  }

  // Embed the editor avatar as icon/main when the card lacks an embedded one.
  if (avatarPng && avatarPng.length) {
    const main = assets.find((a) => a.type === "icon" && a.name === "main");
    const mainEmbedded =
      main && isEmbededUri(main.uri) && Boolean(files[embededPath(main.uri)]);
    if (!mainEmbedded) {
      const path = buildAssetPath("icon", "main", "png", taken);
      files[path] = avatarPng;
      if (main) {
        main.uri = toEmbededUri(path);
        main.ext = "png";
      } else {
        assets.unshift({ type: "icon", uri: toEmbededUri(path), name: "main", ext: "png" });
      }
    }
  }

  // Include any held asset bytes not already written (e.g. orphaned embeds).
  for (const [path, bytes] of Object.entries(embedded)) {
    if (!files[path]) files[path] = bytes;
  }

  const rewritten: CharacterCard =
    assets.length || card.assets ? { ...card, assets } : card;
  return { card: rewritten, files };
}

/** Build a .charx (zip) buffer from a card, its embedded asset bytes, and an optional avatar. */
export function writeCharx(
  card: CharacterCard,
  now: number,
  embedded: Record<string, Uint8Array> = {},
  avatarPng?: Uint8Array | null,
): Uint8Array {
  const { card: rewritten, files } = buildCharxFiles(card, embedded, avatarPng);
  files["card.json"] = strToU8(JSON.stringify(toV3Envelope(rewritten, now), null, 2));
  return zipSync(files, { level: 6 });
}

// CHARX (.charx) read/write — a ZIP archive holding card.json plus assets/.
// The original Chara Snap exposed CHARX in the UI but never implemented it;
// this is a real implementation using fflate.

import { unzipSync, zipSync, strToU8, strFromU8 } from "fflate";
import type { CharacterCard } from "./types";
import { normalizeCard, toV3Envelope } from "./card";

export interface CharxResult {
  card: CharacterCard;
  assets: Record<string, Uint8Array>; // path (e.g. "assets/icon/main.png") -> bytes
}

/** Parse a .charx (zip) buffer into a card + raw asset files. */
export function readCharx(bytes: Uint8Array): CharxResult {
  const files = unzipSync(bytes);
  const cardKey = Object.keys(files).find(
    (k) => k === "card.json" || k.endsWith("/card.json"),
  );
  if (!cardKey) {
    throw new Error("CHARX archive is missing card.json.");
  }
  const parsed = JSON.parse(strFromU8(files[cardKey]));
  const data =
    parsed && typeof parsed === "object" && "data" in parsed
      ? (parsed as { data: unknown }).data
      : parsed;
  const card = normalizeCard(data);

  const assets: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    if (path === cardKey) continue;
    if (path.endsWith("/")) continue; // directory entry
    assets[path] = content;
  }
  return { card, assets };
}

/** Build a .charx (zip) buffer from a card + optional asset files. */
export function writeCharx(
  card: CharacterCard,
  now: number,
  assets: Record<string, Uint8Array> = {},
): Uint8Array {
  const envelope = toV3Envelope(card, now);
  const files: Record<string, Uint8Array> = {
    "card.json": strToU8(JSON.stringify(envelope, null, 2)),
  };
  for (const [path, content] of Object.entries(assets)) {
    files[path] = content;
  }
  return zipSync(files, { level: 6 });
}

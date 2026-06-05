// PNG tEXt-chunk codec for embedding character-card JSON.
// Cards live in a `tEXt` chunk: keyword="chara" (V2) or "ccv3" (V3),
// value = base64(UTF-8 JSON). Mirrors the SillyTavern / Chara Snap convention.

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export interface PngChunk {
  name: string;
  data: Uint8Array;
}

// ── CRC32 ───────────────────────────────────────────────────────────
const CRC_TABLE: number[] = (() => {
  const table = new Array<number>(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ── Parse / build ───────────────────────────────────────────────────
export function parsePng(bytes: Uint8Array): PngChunk[] {
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) {
      throw new Error("Not a valid PNG file.");
    }
  }
  const chunks: PngChunk[] = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  while (offset < bytes.length) {
    const length = view.getUint32(offset);
    const name = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    const dataStart = offset + 8;
    const data = bytes.slice(dataStart, dataStart + length);
    chunks.push({ name, data });
    offset = dataStart + length + 4; // skip data + CRC
    if (name === "IEND") break;
  }
  return chunks;
}

export function buildPng(chunks: PngChunk[]): Uint8Array {
  let total = 8;
  for (const c of chunks) total += 12 + c.data.length;
  const out = new Uint8Array(total);
  out.set(PNG_SIGNATURE, 0);
  const view = new DataView(out.buffer);
  let offset = 8;
  const enc = new TextEncoder();
  for (const c of chunks) {
    view.setUint32(offset, c.data.length);
    const nameBytes = enc.encode(c.name);
    out.set(nameBytes, offset + 4);
    out.set(c.data, offset + 8);
    const crcInput = new Uint8Array(4 + c.data.length);
    crcInput.set(nameBytes, 0);
    crcInput.set(c.data, 4);
    view.setUint32(offset + 8 + c.data.length, crc32(crcInput));
    offset += 12 + c.data.length;
  }
  return out;
}

// ── tEXt chunk helpers ──────────────────────────────────────────────
export function encodeText(keyword: string, text: string): PngChunk {
  if (!/^[\x00-\xFF]*$/.test(keyword) || !/^[\x00-\xFF]*$/.test(text)) {
    throw new Error("tEXt chunks accept Latin-1 characters only.");
  }
  if (keyword.length >= 80) {
    throw new Error("tEXt keyword must be under 80 characters.");
  }
  const data = new Uint8Array(keyword.length + 1 + text.length);
  let i = 0;
  for (const ch of keyword) data[i++] = ch.charCodeAt(0);
  data[i++] = 0; // null separator
  for (const ch of text) data[i++] = ch.charCodeAt(0);
  return { name: "tEXt", data };
}

export function decodeText(chunk: PngChunk): { keyword: string; text: string } {
  let keyword = "";
  let text = "";
  let inKeyword = true;
  for (let i = 0; i < chunk.data.length; i++) {
    const byte = chunk.data[i];
    if (inKeyword) {
      if (byte === 0) inKeyword = false;
      else keyword += String.fromCharCode(byte);
    } else {
      text += String.fromCharCode(byte);
    }
  }
  return { keyword, text };
}

// ── base64 of UTF-8 JSON ────────────────────────────────────────────
export function encodeBase64Json(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decodeBase64Json(b64: string): unknown {
  const binary = atob(b64.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder("utf-8").decode(bytes));
}

/** Collect all tEXt chunks as a keyword→text map. */
export function readTextChunks(bytes: Uint8Array): Record<string, string> {
  const out: Record<string, string> = {};
  for (const chunk of parsePng(bytes)) {
    if (chunk.name === "tEXt") {
      const { keyword, text } = decodeText(chunk);
      out[keyword] = text;
    }
  }
  return out;
}

/** Insert/replace card tEXt chunks, returning a new PNG. */
export function writeCardChunks(
  bytes: Uint8Array,
  chunksToAdd: { keyword: string; text: string }[],
): Uint8Array {
  const dropped = new Set(["chara", "ccv3"]);
  const kept = parsePng(bytes).filter((c) => {
    if (c.name !== "tEXt") return true;
    return !dropped.has(decodeText(c).keyword);
  });
  const iendIdx = kept.findIndex((c) => c.name === "IEND");
  const insertAt = iendIdx >= 0 ? iendIdx : kept.length;
  const additions = chunksToAdd.map((c) => encodeText(c.keyword, c.text));
  kept.splice(insertAt, 0, ...additions);
  return buildPng(kept);
}

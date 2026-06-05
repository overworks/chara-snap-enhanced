import { describe, it, expect } from "vitest";
import {
  parsePng,
  buildPng,
  encodeText,
  decodeText,
  encodeBase64Json,
  decodeBase64Json,
  readTextChunks,
  writeCardChunks,
} from "./png";
import { emptyCard, fromParsed, toV2Envelope, toV3Envelope } from "./card";
import { readCardFromPng } from "./io";
import { zipSync, strToU8 } from "fflate";
import { writeCharx, readCharx } from "./charx";
import {
  bytesToDataUrl,
  isEmbededUri,
  embededPath,
  findMainIcon,
  buildAssetPath,
  parseDataUrl,
} from "./assets";
import { validateCard } from "./validate";
import { estimateTokens } from "./tokens";

// Minimal valid 1x1 PNG (signature + IHDR + IDAT + IEND).
const BASE_PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
  ),
  (c) => c.charCodeAt(0),
);

describe("PNG chunk parsing", () => {
  it("parses signature + IHDR/IDAT/IEND", () => {
    const chunks = parsePng(BASE_PNG);
    const names = chunks.map((c) => c.name);
    expect(names[0]).toBe("IHDR");
    expect(names).toContain("IDAT");
    expect(names[names.length - 1]).toBe("IEND");
  });

  it("rebuilds a PNG with valid CRCs (re-parseable)", () => {
    const rebuilt = buildPng(parsePng(BASE_PNG));
    expect(parsePng(rebuilt).map((c) => c.name)).toEqual(
      parsePng(BASE_PNG).map((c) => c.name),
    );
  });
});

describe("tEXt chunk codec", () => {
  it("round-trips keyword + text", () => {
    const chunk = encodeText("chara", "aGVsbG8=");
    expect(decodeText(chunk)).toEqual({ keyword: "chara", text: "aGVsbG8=" });
  });

  it("rejects keywords over 79 chars", () => {
    expect(() => encodeText("x".repeat(80), "y")).toThrow();
  });
});

describe("base64 JSON", () => {
  it("round-trips unicode", () => {
    const value = { name: "메구밍 ✨", emoji: "🃏" };
    expect(decodeBase64Json(encodeBase64Json(value))).toEqual(value);
  });
});

describe("PNG card embedding round-trip", () => {
  it("writes a V2 card and reads it back", () => {
    const card = { ...emptyCard(), name: "Megumin", description: "Crimson Demon" };
    const png = writeCardChunks(BASE_PNG, [
      { keyword: "chara", text: encodeBase64Json(toV2Envelope(card)) },
    ]);
    const { card: read, detectedVersion } = readCardFromPng(png);
    expect(detectedVersion).toBe("v2");
    expect(read.name).toBe("Megumin");
    expect(read.description).toBe("Crimson Demon");
  });

  it("prefers ccv3 (V3) over chara when both present", () => {
    const card = { ...emptyCard(), name: "Rem", nickname: "Rem-rin" };
    const png = writeCardChunks(BASE_PNG, [
      { keyword: "ccv3", text: encodeBase64Json(toV3Envelope(card, 1000)) },
      { keyword: "chara", text: encodeBase64Json(toV2Envelope(card)) },
    ]);
    const { detectedVersion, card: read } = readCardFromPng(png);
    expect(detectedVersion).toBe("v3");
    expect(read.nickname).toBe("Rem-rin");
  });

  it("replaces existing card chunks instead of duplicating", () => {
    const card = { ...emptyCard(), name: "A" };
    let png = writeCardChunks(BASE_PNG, [
      { keyword: "chara", text: encodeBase64Json(toV2Envelope(card)) },
    ]);
    png = writeCardChunks(png, [
      { keyword: "chara", text: encodeBase64Json(toV2Envelope({ ...card, name: "B" })) },
    ]);
    const charaChunks = parsePng(png).filter(
      (c) => c.name === "tEXt" && decodeText(c).keyword === "chara",
    );
    expect(charaChunks).toHaveLength(1);
    expect(readCardFromPng(png).card.name).toBe("B");
  });
});

describe("CHARX round-trip", () => {
  it("writes and reads a card with an asset", () => {
    const card = { ...emptyCard(), name: "Sherlock", nickname: "Holmes" };
    const asset = new Uint8Array([1, 2, 3, 4]);
    const charx = writeCharx(card, 5000, { "assets/icon/main.png": asset });
    const result = readCharx(charx);
    expect(result.card.name).toBe("Sherlock");
    expect(result.card.nickname).toBe("Holmes");
    expect(result.assets["assets/icon/main.png"]).toEqual(asset);
  });

  it("round-trips an embedded asset reference and its bytes", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const path = "assets/background/images/bg.png";
    const card = {
      ...emptyCard(),
      name: "X",
      assets: [{ type: "background", uri: `embeded://${path}`, name: "bg", ext: "png" }],
    };
    const charx = writeCharx(card, 1, { [path]: bytes });
    const { card: read, assets } = readCharx(charx);
    expect(read.assets?.[0].uri).toBe(`embeded://${path}`);
    expect(assets[path]).toEqual(bytes);
  });

  it("converts a data: URL asset into an embedded file", () => {
    const png = new Uint8Array([9, 8, 7, 6]);
    const card = {
      ...emptyCard(),
      name: "Data",
      assets: [
        { type: "emotion", uri: bytesToDataUrl(png, "image/png"), name: "smile", ext: "png" },
      ],
    };
    const { card: read, assets } = readCharx(writeCharx(card, 1, {}));
    const a = read.assets![0];
    expect(isEmbededUri(a.uri)).toBe(true);
    expect(assets[embededPath(a.uri)]).toEqual(png);
  });

  it("embeds the editor avatar as icon/main", () => {
    const avatar = new Uint8Array([4, 4, 4, 4]);
    const charx = writeCharx({ ...emptyCard(), name: "Ava" }, 1, {}, avatar);
    const { card: read, assets } = readCharx(charx);
    const main = findMainIcon(read.assets);
    expect(main && isEmbededUri(main.uri)).toBe(true);
    expect(assets[embededPath(main!.uri)]).toEqual(avatar);
  });

  it("preserves a custom asset type", () => {
    const card = {
      ...emptyCard(),
      name: "C",
      assets: [{ type: "x_live2d", uri: "ccdefault:", name: "model", ext: "unknown" }],
    };
    const { card: read } = readCharx(writeCharx(card, 1, {}));
    expect(read.assets?.[0].type).toBe("x_live2d");
  });
});

describe("CHARX lenient reading (non-conformant files)", () => {
  const v3 = (data: object) => ({ spec: "chara_card_v3", spec_version: "3.0", data });
  const makeCharx = (card: object, files: Record<string, Uint8Array>) =>
    zipSync({ "card.json": strToU8(JSON.stringify(card)), ...files });

  it("repairs a mismatched embeded:// folder via basename", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    // URI says .../images/... but the file is stored under .../image/...
    const charx = makeCharx(
      v3({
        name: "M",
        assets: [
          { type: "icon", uri: "embeded://assets/icon/images/main.png", name: "main", ext: "png" },
        ],
      }),
      { "assets/icon/image/main.png": bytes },
    );
    const { card, assets } = readCharx(charx);
    expect(card.assets?.[0].uri).toBe("embeded://assets/icon/image/main.png");
    expect(assets[embededPath(card.assets![0].uri)]).toEqual(bytes);
  });

  it("resolves RisuAI's __asset: scheme", () => {
    const bytes = new Uint8Array([4, 5]);
    const charx = makeCharx(
      v3({
        name: "R",
        assets: [
          { type: "emotion", uri: "__asset:assets/emotion/smile.png", name: "smile", ext: "png" },
        ],
      }),
      { "assets/emotion/smile.png": bytes },
    );
    const { card, assets } = readCharx(charx);
    expect(isEmbededUri(card.assets![0].uri)).toBe(true);
    expect(assets[embededPath(card.assets![0].uri)]).toEqual(bytes);
  });

  it("resolves a bare path and a URL-encoded path", () => {
    const a = new Uint8Array([7]);
    const b = new Uint8Array([8]);
    const charx = makeCharx(
      v3({
        name: "B",
        assets: [
          { type: "background", uri: "assets/bg.png", name: "bg", ext: "png" },
          { type: "icon", uri: "embeded://assets/icon/main%20icon.png", name: "main", ext: "png" },
        ],
      }),
      { "assets/bg.png": a, "assets/icon/main icon.png": b },
    );
    const { card, assets } = readCharx(charx);
    expect(assets[embededPath(card.assets![0].uri)]).toEqual(a);
    expect(assets[embededPath(card.assets![1].uri)]).toEqual(b);
  });

  it("reads a nested card.json with a BOM and detects v3", () => {
    const bom = "﻿" + JSON.stringify(v3({ name: "Nested" }));
    const charx = zipSync({ "chara/card.json": strToU8(bom) });
    const { card, detectedVersion } = readCharx(charx);
    expect(card.name).toBe("Nested");
    expect(detectedVersion).toBe("v3");
  });

  it("surfaces embedded images when the card lists no assets", () => {
    const bytes = new Uint8Array([9, 9, 9]);
    const charx = makeCharx(v3({ name: "NoAssets" }), { "assets/icon/main.png": bytes });
    const { card, assets } = readCharx(charx);
    const main = findMainIcon(card.assets);
    expect(main?.name).toBe("main");
    expect(assets[embededPath(main!.uri)]).toEqual(bytes);
  });
});

describe("asset helpers", () => {
  it("builds unique CHARX paths under the right category", () => {
    const taken = new Set<string>();
    expect(buildAssetPath("icon", "main", "png", taken)).toBe(
      "assets/icon/images/main.png",
    );
    expect(buildAssetPath("icon", "main", "png", taken)).toBe(
      "assets/icon/images/main_2.png",
    );
  });

  it("decodes a base64 data URL back to bytes", () => {
    const bytes = new Uint8Array([10, 20, 30, 40, 255]);
    const decoded = parseDataUrl(bytesToDataUrl(bytes, "image/png"));
    expect(decoded?.bytes).toEqual(bytes);
    expect(decoded?.ext).toBe("png");
  });
});

describe("version detection from envelopes", () => {
  it("detects v2 / v3 / v1", () => {
    expect(fromParsed(toV2Envelope(emptyCard())).detectedVersion).toBe("v2");
    expect(fromParsed(toV3Envelope(emptyCard(), 1)).detectedVersion).toBe("v3");
    expect(fromParsed({ name: "legacy" }).detectedVersion).toBe("v1");
  });
});

describe("validation", () => {
  it("flags a missing name as an error", () => {
    const issues = validateCard(emptyCard());
    expect(issues.find((i) => i.field === "name")?.severity).toBe("error");
  });

  it("passes a complete card without errors", () => {
    const card = {
      ...emptyCard(),
      name: "Complete",
      description: "desc",
      first_mes: "hello",
    };
    expect(validateCard(card).some((i) => i.severity === "error")).toBe(false);
  });
});

describe("token estimate", () => {
  it("is zero for empty and positive for text", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("hello world")).toBeGreaterThan(0);
  });
});

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
import { writeCharx, readCharx } from "./charx";
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

import { describe, it, expect } from "vitest";
import {
  AI_PROVIDERS,
  getProvider,
  aiHeaders,
  normalizeBaseUrl,
} from "./providers";

describe("AI providers", () => {
  it("includes the expected preset ids", () => {
    expect(AI_PROVIDERS.map((p) => p.id)).toEqual([
      "openai",
      "anthropic",
      "gemini",
      "openrouter",
      "ollama",
      "custom",
    ]);
  });

  it("custom has no base URL; presets do", () => {
    expect(getProvider("custom").baseUrl).toBe("");
    expect(getProvider("openai").baseUrl).toBe("https://api.openai.com/v1");
    for (const p of AI_PROVIDERS) {
      if (p.id !== "custom") expect(p.baseUrl).toMatch(/^https?:\/\//);
    }
  });

  it("only Ollama omits the key requirement", () => {
    expect(getProvider("ollama").needsKey).toBe(false);
    for (const p of AI_PROVIDERS) {
      if (p.id !== "ollama") expect(p.needsKey).toBe(true);
    }
  });

  it("falls back to the first preset for an unknown id", () => {
    // @ts-expect-error — exercising the runtime guard
    expect(getProvider("nope")).toBe(AI_PROVIDERS[0]);
  });
});

describe("aiHeaders", () => {
  it("sets bearer auth from a trimmed key", () => {
    expect(aiHeaders("openai", "  sk-123 ")).toEqual({
      Authorization: "Bearer sk-123",
    });
  });

  it("omits auth when the key is blank", () => {
    expect(aiHeaders("ollama", "  ")).toEqual({});
  });

  it("adds Anthropic's browser-access header", () => {
    const h = aiHeaders("anthropic", "sk-ant");
    expect(h.Authorization).toBe("Bearer sk-ant");
    expect(h["anthropic-dangerous-direct-browser-access"]).toBe("true");
  });
});

describe("normalizeBaseUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(normalizeBaseUrl("  https://x/v1/  ")).toBe("https://x/v1");
    expect(normalizeBaseUrl("https://x/v1")).toBe("https://x/v1");
  });
});

import { describe, it, expect } from "vitest";
import { parseSettings, DEFAULT_AI, DEFAULT_TRANSLATION } from "./SettingsContext";

describe("parseSettings", () => {
  it("returns defaults for null / empty input", () => {
    expect(parseSettings(null).ai).toEqual(DEFAULT_AI);
    expect(parseSettings(null).translation).toEqual(DEFAULT_TRANSLATION);
    expect(parseSettings("").ai).toEqual(DEFAULT_AI);
  });

  it("tolerates malformed JSON", () => {
    expect(parseSettings("{not json").ai).toEqual(DEFAULT_AI);
    expect(parseSettings("[]").ai).toEqual(DEFAULT_AI);
    expect(parseSettings("42").ai).toEqual(DEFAULT_AI);
  });

  it("merges a partial ai object over defaults", () => {
    const out = parseSettings(JSON.stringify({ ai: { apiKey: "sk-123" } }));
    expect(out.ai).toEqual({ ...DEFAULT_AI, apiKey: "sk-123" });
  });

  it("ignores non-string fields", () => {
    const out = parseSettings(JSON.stringify({ ai: { baseUrl: 5, model: null } }));
    expect(out.ai).toEqual(DEFAULT_AI);
  });

  it("round-trips a full settings object", () => {
    const ai = {
      provider: "openrouter" as const,
      baseUrl: "https://openrouter.ai/api/v1",
      apiKey: "sk-or-xyz",
      model: "anthropic/claude-3.5-sonnet",
    };
    const out = parseSettings(JSON.stringify({ ai }));
    expect(out.ai).toEqual(ai);
  });

  it("keeps a known provider and rejects an unknown one", () => {
    expect(parseSettings(JSON.stringify({ ai: { provider: "anthropic" } })).ai.provider).toBe(
      "anthropic",
    );
    expect(parseSettings(JSON.stringify({ ai: { provider: "bogus" } })).ai.provider).toBe(
      DEFAULT_AI.provider,
    );
  });

  it("parses translation settings and rejects unknown/hidden translators", () => {
    const ok = parseSettings(
      JSON.stringify({
        translation: {
          provider: "google",
          apiKey: "AIza",
          targetLang: "ja",
          llmPrompt: "be formal",
        },
      }),
    );
    expect(ok.translation).toEqual({
      provider: "google",
      apiKey: "AIza",
      targetLang: "ja",
      llmPrompt: "be formal",
    });
    const bad = parseSettings(JSON.stringify({ translation: { provider: "nope" } }));
    expect(bad.translation.provider).toBe(DEFAULT_TRANSLATION.provider);
    expect(bad.translation.targetLang).toBe(DEFAULT_TRANSLATION.targetLang);
    // DeepL is hidden, so a stored selection falls back to the default (Google).
    const hidden = parseSettings(JSON.stringify({ translation: { provider: "deepl" } }));
    expect(hidden.translation.provider).toBe(DEFAULT_TRANSLATION.provider);
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  TRANSLATORS,
  VISIBLE_TRANSLATORS,
  getTranslator,
  deeplIsFree,
  deeplBaseUrl,
  deeplHeaders,
  translatorTest,
  translate,
  translateLlm,
  decodeEntities,
  TranslateError,
} from "./translate";

describe("translators", () => {
  it("includes Google, LLM, and DeepL", () => {
    expect(TRANSLATORS.map((t) => t.id)).toEqual(["google", "llm", "deepl"]);
    expect(getTranslator("google").label).toBe("Google Cloud Translation");
    expect(getTranslator("deepl").label).toBe("DeepL");
    expect(getTranslator("llm").usesAiConfig).toBe(true);
  });

  it("flags DeepL as CORS-blocked but not Google", () => {
    expect(getTranslator("google").corsBlocked).toBeFalsy();
    expect(getTranslator("deepl").corsBlocked).toBe(true);
  });

  it("shows Google and LLM but hides DeepL", () => {
    expect(VISIBLE_TRANSLATORS.map((t) => t.id)).toEqual(["google", "llm"]);
  });
});

describe("translatorTest", () => {
  it("puts the Google key in the query string with no auth header", () => {
    const { url, headers } = translatorTest("google", "AIzaKEY");
    expect(url).toBe(
      "https://translation.googleapis.com/language/translate/v2/languages?key=AIzaKEY",
    );
    expect(headers).toEqual({});
  });

  it("uses DeepL's host + auth header", () => {
    const { url, headers } = translatorTest("deepl", "k:fx");
    expect(url).toBe("https://api-free.deepl.com/v2/usage");
    expect(headers).toEqual({ Authorization: "DeepL-Auth-Key k:fx" });
  });
});

describe("DeepL key handling", () => {
  it("detects Free keys by the :fx suffix", () => {
    expect(deeplIsFree("abc-123:fx")).toBe(true);
    expect(deeplIsFree("  abc-123:fx  ")).toBe(true);
    expect(deeplIsFree("abc-123")).toBe(false);
  });

  it("routes Free vs Pro to the right host", () => {
    expect(deeplBaseUrl("abc:fx")).toBe("https://api-free.deepl.com");
    expect(deeplBaseUrl("abc")).toBe("https://api.deepl.com");
  });

  it("builds the DeepL-Auth-Key header from a trimmed key", () => {
    expect(deeplHeaders("  k1 ")).toEqual({ Authorization: "DeepL-Auth-Key k1" });
    expect(deeplHeaders("   ")).toEqual({});
  });
});

describe("decodeEntities", () => {
  it("decodes named and numeric HTML entities", () => {
    expect(decodeEntities("it&#39;s a &quot;test&quot; &amp; more")).toBe(
      'it\'s a "test" & more',
    );
    expect(decodeEntities("&lt;tag&gt; &#x41;")).toBe("<tag> A");
  });
});

describe("translate", () => {
  afterEach(() => vi.unstubAllGlobals());

  function stubFetch(ok: boolean, json: unknown, status = ok ? 200 : 403) {
    const fetchMock = vi.fn(
      async (_url: string, _init: { method?: string; headers?: Record<string, string>; body?: unknown }) => ({
        ok,
        status,
        json: async () => json,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("calls Google with a form body + ?key= and decodes the result", async () => {
    const fetchMock = stubFetch(true, {
      data: { translations: [{ translatedText: "Bonjour &#39;monde&#39;" }] },
    });
    const out = await translate("Hello world", "fr", "google", " KEY ");
    expect(out).toBe("Bonjour 'monde'");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://translation.googleapis.com/language/translate/v2?key=KEY");
    expect(init.method).toBe("POST");
    const body = init.body as URLSearchParams;
    expect(body.get("q")).toBe("Hello world");
    expect(body.get("target")).toBe("fr");
    expect(body.get("format")).toBe("text");
  });

  it("calls DeepL with its host, auth header, and uppercased target", async () => {
    const fetchMock = stubFetch(true, { translations: [{ text: "안녕" }] });
    const out = await translate("hi", "ko", "deepl", "k:fx");
    expect(out).toBe("안녕");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api-free.deepl.com/v2/translate");
    expect(init.headers?.Authorization).toBe("DeepL-Auth-Key k:fx");
    expect((init.body as URLSearchParams).get("target_lang")).toBe("KO");
  });

  it("throws TranslateError with the status on a non-OK response", async () => {
    stubFetch(false, {}, 403);
    await expect(translate("x", "fr", "google", "KEY")).rejects.toMatchObject({
      name: "TranslateError",
      status: 403,
    });
  });
});

describe("translateLlm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts a chat completion and returns the trimmed content", async () => {
    const fetchMock = vi.fn(
      async (
        _url: string,
        _init: { method?: string; headers?: Record<string, string>; body?: unknown },
      ) => ({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: "  안녕하세요  " } }] }),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const out = await translateLlm("Hello", "한국어", {
      provider: "gemini",
      baseUrl: "https://example.com/v1/",
      apiKey: "K",
      model: "gemini-3.5-flash",
      prompt: "  Keep it casual.  ",
    });
    expect(out).toBe("안녕하세요");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.com/v1/chat/completions");
    expect(init.headers?.Authorization).toBe("Bearer K");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("gemini-3.5-flash");
    expect(body.messages[0].content).toContain("한국어");
    // The custom prompt is appended (trimmed) to the system message.
    expect(body.messages[0].content).toContain("Additional instructions:\nKeep it casual.");
    expect(body.messages[1].content).toBe("Hello");
  });
});

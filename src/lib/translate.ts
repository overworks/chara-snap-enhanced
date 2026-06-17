// Translation provider config. Pure data + helpers (no React) so it can be
// unit-tested directly. Kept in the same shape spirit as src/lib/providers.ts.
//
// Google Cloud Translation (Basic / v2) is the default: it authenticates with a
// plain `?key=` query param and serves CORS headers, so it works from a browser
// with no backend. DeepL is kept as an option but is CORS-blocked from the
// browser, so it needs a proxy. "llm" reuses the OpenAI-compatible AI config to
// translate via a chat completion — often the best quality for character text.

import { aiHeaders, normalizeBaseUrl, type ProviderId } from "./providers";

export type TranslatorId = "google" | "deepl" | "llm";

export interface Translator {
  id: TranslatorId;
  label: string;
  apiKeyUrl?: string;
  /** Example key shown as the input placeholder. */
  keyPlaceholder?: string;
  /** True when direct browser calls are typically CORS-blocked. */
  corsBlocked?: boolean;
  /** Hidden from the UI (config/code retained). DeepL: CORS-blocked in-browser. */
  hidden?: boolean;
  /** Uses the shared AI provider config (OpenAI-compatible) instead of a single key. */
  usesAiConfig?: boolean;
}

export const TRANSLATORS: Translator[] = [
  {
    id: "google",
    label: "Google Cloud Translation",
    apiKeyUrl: "https://console.cloud.google.com/apis/credentials",
    keyPlaceholder: "AIza…",
  },
  {
    id: "llm",
    label: "AI (LLM)",
    usesAiConfig: true,
  },
  {
    id: "deepl",
    label: "DeepL",
    apiKeyUrl: "https://www.deepl.com/your-account/keys",
    keyPlaceholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx",
    corsBlocked: true,
    hidden: true, // can't be called from the browser yet — needs a proxy
  },
];

/** Translators offered in the UI (excludes hidden ones like DeepL). */
export const VISIBLE_TRANSLATORS = TRANSLATORS.filter((t) => !t.hidden);

export function getTranslator(id: TranslatorId): Translator {
  return TRANSLATORS.find((t) => t.id === id) ?? TRANSLATORS[0];
}

// --- Google Cloud Translation (Basic / v2) -------------------------------
export const GOOGLE_TRANSLATE_BASE =
  "https://translation.googleapis.com/language/translate/v2";

// --- DeepL ----------------------------------------------------------------
/**
 * DeepL routes Free and Pro plans to different hosts; Free keys are identifiable
 * by the ":fx" suffix. Auto-detecting means the user only enters their key.
 */
export function deeplIsFree(apiKey: string): boolean {
  return apiKey.trim().endsWith(":fx");
}

export function deeplBaseUrl(apiKey: string): string {
  return deeplIsFree(apiKey)
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
}

/** DeepL uses a custom auth scheme, not Bearer. */
export function deeplHeaders(apiKey: string): Record<string, string> {
  const key = apiKey.trim();
  return key ? { Authorization: `DeepL-Auth-Key ${key}` } : {};
}

// --- Connection test ------------------------------------------------------
/**
 * A lightweight GET request that proves a translator's key works: Google lists
 * languages, DeepL reports usage. Returns the URL + headers to fetch.
 */
export function translatorTest(
  provider: TranslatorId,
  apiKey: string,
): { url: string; headers: Record<string, string> } {
  const key = apiKey.trim();
  if (provider === "deepl") {
    return { url: `${deeplBaseUrl(key)}/v2/usage`, headers: deeplHeaders(key) };
  }
  // google — key goes in the query string, no auth header.
  return {
    url: `${GOOGLE_TRANSLATE_BASE}/languages?key=${encodeURIComponent(key)}`,
    headers: {},
  };
}

// --- Target languages -----------------------------------------------------
// Curated common set. `google` is the canonical code we store; `deepl` is the
// matching DeepL `target_lang` (uppercase, sometimes regioned) to avoid fragile
// transforms. Labels are native names — not translated.
export interface TranslationTarget {
  label: string;
  google: string;
  deepl: string;
}

export const TRANSLATION_TARGETS: TranslationTarget[] = [
  { label: "English", google: "en", deepl: "EN-US" },
  { label: "한국어", google: "ko", deepl: "KO" },
  { label: "日本語", google: "ja", deepl: "JA" },
  { label: "中文 (简体)", google: "zh-CN", deepl: "ZH" },
  { label: "中文 (繁體)", google: "zh-TW", deepl: "ZH" },
  { label: "Español", google: "es", deepl: "ES" },
  { label: "Français", google: "fr", deepl: "FR" },
  { label: "Deutsch", google: "de", deepl: "DE" },
  { label: "Português (BR)", google: "pt", deepl: "PT-BR" },
  { label: "Русский", google: "ru", deepl: "RU" },
  { label: "Italiano", google: "it", deepl: "IT" },
  { label: "Polski", google: "pl", deepl: "PL" },
  { label: "Nederlands", google: "nl", deepl: "NL" },
  { label: "Türkçe", google: "tr", deepl: "TR" },
  { label: "Українська", google: "uk", deepl: "UK" },
  { label: "Indonesia", google: "id", deepl: "ID" },
];

export function getTarget(googleCode: string): TranslationTarget {
  return (
    TRANSLATION_TARGETS.find((t) => t.google === googleCode) ?? TRANSLATION_TARGETS[0]
  );
}

// --- Translate ------------------------------------------------------------
export class TranslateError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "TranslateError";
    this.status = status;
  }
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#39": "'",
  apos: "'",
  nbsp: " ",
};

/**
 * Google's v2 API returns HTML-escaped text even with format=text (e.g. `&#39;`).
 * Decode the common named + numeric entities. Pure (no DOM) so it's testable.
 */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[body] ?? m;
  });
}

/**
 * Translate `text` into `targetCode` (a Google language code) using the given
 * provider. Source language is auto-detected. Returns the translated string.
 * Throws TranslateError on a non-OK response (status attached).
 */
export async function translate(
  text: string,
  targetCode: string,
  provider: TranslatorId,
  apiKey: string,
): Promise<string> {
  const key = apiKey.trim();
  if (provider === "deepl") {
    const body = new URLSearchParams({ text, target_lang: getTarget(targetCode).deepl });
    const res = await fetch(`${deeplBaseUrl(key)}/v2/translate`, {
      method: "POST",
      headers: {
        ...deeplHeaders(key),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) throw new TranslateError(`HTTP ${res.status}`, res.status);
    const json = (await res.json()) as { translations?: { text: string }[] };
    return json.translations?.[0]?.text ?? "";
  }
  // google — form-encoded keeps it a "simple" request (no CORS preflight).
  const body = new URLSearchParams({ q: text, target: targetCode, format: "text" });
  const res = await fetch(`${GOOGLE_TRANSLATE_BASE}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new TranslateError(`HTTP ${res.status}`, res.status);
  const json = (await res.json()) as {
    data?: { translations?: { translatedText: string }[] };
  };
  return decodeEntities(json.data?.translations?.[0]?.translatedText ?? "");
}

export interface LlmTranslateConfig {
  provider: ProviderId;
  baseUrl: string;
  apiKey: string;
  model: string;
  /** Optional extra instructions appended to the translation system prompt. */
  prompt?: string;
}

/**
 * Translate via an OpenAI-compatible chat completion. `targetLabel` is a human
 * language name (e.g. "한국어") used in the prompt. Often the best quality for
 * character dialogue since it preserves voice and {{user}}/{{char}} macros.
 */
export async function translateLlm(
  text: string,
  targetLabel: string,
  cfg: LlmTranslateConfig,
): Promise<string> {
  const extra = cfg.prompt?.trim();
  const system =
    `Translate the user's message into ${targetLabel}. ` +
    "Preserve meaning, tone, and any markdown or placeholders such as " +
    "{{user}} and {{char}} exactly. Reply with only the translation — " +
    "no quotes, no notes, no explanations." +
    (extra ? `\n\nAdditional instructions:\n${extra}` : "");
  const res = await fetch(`${normalizeBaseUrl(cfg.baseUrl)}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...aiHeaders(cfg.provider, cfg.apiKey),
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
    }),
  });
  if (!res.ok) throw new TranslateError(`HTTP ${res.status}`, res.status);
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

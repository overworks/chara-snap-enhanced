// AI provider presets. Every provider here speaks the OpenAI-compatible
// `/chat/completions` + `/models` shape, so one client path serves them all —
// a preset just fills in the base URL, a sensible default model, and any extra
// headers a browser needs to reach it. "custom" lets the user point anywhere.
//
// Pure data + helpers (no React) so it can be unit-tested directly.

export type ProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "openrouter"
  | "ollama"
  | "custom";

export interface AiProvider {
  id: ProviderId;
  /** Brand name — shown as-is, not translated. */
  label: string;
  /** OpenAI-compatible base URL (ends before /chat/completions). "" for custom. */
  baseUrl: string;
  defaultModel: string;
  /** Whether an API key is required (false for a local Ollama). */
  needsKey: boolean;
  /** Where to obtain a key. */
  apiKeyUrl?: string;
  /** Extra headers required for direct browser (CORS) access. */
  extraHeaders?: Record<string, string>;
  /** True when direct browser calls are typically CORS-blocked. */
  corsBlocked?: boolean;
}

export const AI_PROVIDERS: AiProvider[] = [
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    needsKey: true,
    apiKeyUrl: "https://platform.openai.com/api-keys",
    corsBlocked: true, // api.openai.com sends no CORS headers
  },
  {
    id: "anthropic",
    label: "Claude",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-opus-4-8",
    needsKey: true,
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    // Anthropic's OpenAI-compatible endpoint allows browser calls only with this header.
    extraHeaders: { "anthropic-dangerous-direct-browser-access": "true" },
  },
  {
    id: "gemini",
    label: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-3.5-flash",
    needsKey: true,
    apiKeyUrl: "https://aistudio.google.com/apikey",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    needsKey: true,
    apiKeyUrl: "https://openrouter.ai/keys",
  },
  {
    id: "ollama",
    label: "Ollama",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    needsKey: false,
    apiKeyUrl: "https://ollama.com/download",
  },
  {
    id: "custom",
    label: "Custom",
    baseUrl: "",
    defaultModel: "",
    needsKey: true,
  },
];

export function getProvider(id: ProviderId): AiProvider {
  return AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0];
}

/** Headers for an OpenAI-compatible request: bearer auth plus any provider extras. */
export function aiHeaders(
  provider: ProviderId,
  apiKey: string,
): Record<string, string> {
  const headers: Record<string, string> = {};
  const key = apiKey.trim();
  if (key) headers.Authorization = `Bearer ${key}`;
  return { ...headers, ...(getProvider(provider).extraHeaders ?? {}) };
}

/** Normalize a base URL for joining (drop a trailing slash). */
export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

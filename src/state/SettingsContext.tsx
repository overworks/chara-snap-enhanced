import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AI_PROVIDERS,
  getProvider,
  type ProviderId,
} from "../lib/providers";
import { VISIBLE_TRANSLATORS, type TranslatorId } from "../lib/translate";

// User settings persisted in the browser only (no backend). Currently holds the
// OpenAI-compatible AI configuration that powers content generation. The API key
// lives in localStorage and is sent only to the endpoint the user configures.

const STORAGE_KEY = "chara-snap-settings";

export interface AiSettings {
  /** Selected provider preset (drives base URL defaults + request headers). */
  provider: ProviderId;
  /** OpenAI-compatible base URL, e.g. https://api.openai.com/v1 */
  baseUrl: string;
  apiKey: string;
  /** Model id, e.g. gpt-4o-mini */
  model: string;
}

export interface TranslationSettings {
  provider: TranslatorId;
  apiKey: string;
  /** Default target language (a Google language code, e.g. "en"). */
  targetLang: string;
  /** Optional extra instructions for the AI (LLM) translation prompt. */
  llmPrompt: string;
}

export interface Settings {
  ai: AiSettings;
  translation: TranslationSettings;
}

export const DEFAULT_AI: AiSettings = {
  provider: "openai",
  baseUrl: getProvider("openai").baseUrl,
  apiKey: "",
  model: getProvider("openai").defaultModel,
};

export const DEFAULT_TRANSLATION: TranslationSettings = {
  provider: "google",
  apiKey: "",
  targetLang: "en",
  llmPrompt: "",
};

const PROVIDER_IDS = AI_PROVIDERS.map((p) => p.id);
// Only visible translators are selectable; a stored hidden one falls back to default.
const TRANSLATOR_IDS = VISIBLE_TRANSLATORS.map((t) => t.id);

/**
 * Parse stored settings JSON, merging over defaults so missing/extra keys and
 * malformed input never break the app. Pure (no React) for easy unit testing.
 */
function defaults(): Settings {
  return { ai: { ...DEFAULT_AI }, translation: { ...DEFAULT_TRANSLATION } };
}

export function parseSettings(raw: string | null): Settings {
  if (!raw) return defaults();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return defaults();
    const ai = (parsed as { ai?: unknown }).ai;
    const src = ai && typeof ai === "object" ? (ai as Partial<AiSettings>) : {};
    const tr = (parsed as { translation?: unknown }).translation;
    const trSrc =
      tr && typeof tr === "object" ? (tr as Partial<TranslationSettings>) : {};
    return {
      ai: {
        provider:
          typeof src.provider === "string" && PROVIDER_IDS.includes(src.provider)
            ? (src.provider as ProviderId)
            : DEFAULT_AI.provider,
        baseUrl: typeof src.baseUrl === "string" ? src.baseUrl : DEFAULT_AI.baseUrl,
        apiKey: typeof src.apiKey === "string" ? src.apiKey : DEFAULT_AI.apiKey,
        model: typeof src.model === "string" ? src.model : DEFAULT_AI.model,
      },
      translation: {
        provider:
          typeof trSrc.provider === "string" &&
          TRANSLATOR_IDS.includes(trSrc.provider)
            ? (trSrc.provider as TranslatorId)
            : DEFAULT_TRANSLATION.provider,
        apiKey:
          typeof trSrc.apiKey === "string" ? trSrc.apiKey : DEFAULT_TRANSLATION.apiKey,
        targetLang:
          typeof trSrc.targetLang === "string"
            ? trSrc.targetLang
            : DEFAULT_TRANSLATION.targetLang,
        llmPrompt:
          typeof trSrc.llmPrompt === "string"
            ? trSrc.llmPrompt
            : DEFAULT_TRANSLATION.llmPrompt,
      },
    };
  } catch {
    return defaults();
  }
}

function readStored(): Settings {
  try {
    return parseSettings(localStorage.getItem(STORAGE_KEY));
  } catch {
    return defaults();
  }
}

interface SettingsContextValue {
  ai: AiSettings;
  /** Patch the AI settings; persisted immediately. */
  setAi: (patch: Partial<AiSettings>) => void;
  /** Switch provider, applying its base URL + default model (keeps the key). */
  selectProvider: (id: ProviderId) => void;
  translation: TranslationSettings;
  /** Patch the translation settings; persisted immediately. */
  setTranslation: (patch: Partial<TranslationSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const setAi = useCallback((patch: Partial<AiSettings>) => {
    setSettings((s) => ({ ...s, ai: { ...s.ai, ...patch } }));
  }, []);

  const selectProvider = useCallback((id: ProviderId) => {
    const p = getProvider(id);
    setSettings((s) => ({
      ...s,
      ai: {
        ...s.ai,
        provider: id,
        // Custom keeps whatever the user already typed; presets apply defaults.
        ...(id === "custom"
          ? {}
          : { baseUrl: p.baseUrl, model: p.defaultModel }),
      },
    }));
  }, []);

  const setTranslation = useCallback((patch: Partial<TranslationSettings>) => {
    setSettings((s) => ({ ...s, translation: { ...s.translation, ...patch } }));
  }, []);

  const value = useMemo(
    () => ({
      ai: settings.ai,
      setAi,
      selectProvider,
      translation: settings.translation,
      setTranslation,
    }),
    [settings.ai, setAi, selectProvider, settings.translation, setTranslation],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, ExternalLink } from "lucide-react";
import { ThemeToggle, LanguageToggle } from "../components/HeaderControls";
import SiteHeader from "../components/SiteHeader";
import { TextInput, TextArea, Field, SecretInput } from "../components/fields";
import { useI18n } from "../i18n";
import type { Dict } from "../i18n/en";
import { useSettings } from "../state/SettingsContext";
import { AI_PROVIDERS, getProvider, aiHeaders, normalizeBaseUrl } from "../lib/providers";
import {
  VISIBLE_TRANSLATORS,
  getTranslator,
  translatorTest,
  deeplIsFree,
} from "../lib/translate";

// AI content *generation* isn't wired up yet, so its dedicated section stays
// hidden. The AI provider config itself is still reachable — it powers LLM
// translation (see the Translation section). Flip this when generation ships.
const SHOW_AI_SETTINGS = false;

type Tr = (template: string, vars?: Record<string, string | number>) => string;

type TestState =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

// Probe an endpoint's GET path with the given headers; map result → TestState.
async function probeGet(
  url: string,
  headers: Record<string, string>,
  set: (st: TestState) => void,
  s: Dict["settings"],
  t: Tr,
) {
  set({ kind: "testing" });
  try {
    const res = await fetch(url, { headers });
    if (res.ok) set({ kind: "ok" });
    else set({ kind: "error", message: t(s.testFailHttp, { status: res.status }) });
  } catch {
    set({ kind: "error", message: s.testFailNetwork });
  }
}

export default function SettingsPage() {
  const { d, t } = useI18n();
  const s = d.settings;
  const { translation, setTranslation } = useSettings();
  const translator = getTranslator(translation.provider);
  const [trTest, setTrTest] = useState<TestState>({ kind: "idle" });

  function runTranslatorTest() {
    if (!translation.apiKey.trim()) {
      setTrTest({ kind: "error", message: s.testNoKey });
      return;
    }
    const { url, headers } = translatorTest(translation.provider, translation.apiKey);
    void probeGet(url, headers, setTrTest, s, t);
  }

  // DeepL auto-detects Free/Pro from the key; Google has a single key form.
  const trKeyHint =
    translation.provider === "deepl"
      ? translation.apiKey.trim()
        ? deeplIsFree(translation.apiKey)
          ? s.deeplFree
          : s.deeplPro
        : s.deeplKeyHint
      : s.googleKeyHint;

  return (
    <div className="min-h-full">
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-5 py-10 leading-relaxed text-fg-muted">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
          {s.title}
        </h1>
        <p className="mt-3 text-fg-muted">{s.subtitle}</p>

        {/* AI generation — hidden until the AI content-generation feature ships. */}
        {SHOW_AI_SETTINGS && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-fg">
              {s.aiHeading}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{s.aiIntro}</p>
            <div className="card-surface mt-4 space-y-4 p-5">
              <AiProviderFields />
            </div>
          </section>
        )}

        {/* Translation */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-fg">
            {s.translationHeading}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">{s.translationIntro}</p>

          <div className="card-surface mt-4 space-y-4 p-5">
            {VISIBLE_TRANSLATORS.length > 1 && (
              <Field label={s.translator}>
                <div className="flex flex-wrap gap-2">
                  {VISIBLE_TRANSLATORS.map((tr) => {
                    const on = tr.id === translation.provider;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => {
                          setTranslation({ provider: tr.id });
                          setTrTest({ kind: "idle" });
                        }}
                        aria-pressed={on}
                        className={`h-8 rounded-[8px] border px-3 text-sm font-medium transition ${
                          on
                            ? "border-accent-border bg-accent-subtle text-accent-text"
                            : "border-border text-fg-muted hover:bg-elevated hover:text-fg"
                        }`}
                      >
                        {tr.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}

            {translator.usesAiConfig ? (
              <>
                <p className="text-sm text-fg-muted">{s.llmHint}</p>
                <AiProviderFields />
                <TextArea
                  label={s.llmPrompt}
                  hint={s.llmPromptHint}
                  value={translation.llmPrompt}
                  onChange={(v) => setTranslation({ llmPrompt: v })}
                  placeholder={s.llmPromptPlaceholder}
                  rows={3}
                />
              </>
            ) : (
              <>
                <SecretInput
                  label={t(s.translatorKey, { provider: translator.label })}
                  hint={trKeyHint}
                  value={translation.apiKey}
                  onChange={(v) => {
                    setTranslation({ apiKey: v });
                    setTrTest({ kind: "idle" });
                  }}
                  placeholder={translator.keyPlaceholder}
                  showLabel={s.show}
                  hideLabel={s.hide}
                />

                {translator.apiKeyUrl && (
                  <a
                    href={translator.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
                  >
                    <ExternalLink size={14} />{" "}
                    {t(s.getKey, { provider: translator.label })}
                  </a>
                )}

                {translator.corsBlocked && (
                  <p className="rounded-[10px] border border-info/40 bg-info/5 px-3 py-2 text-xs leading-relaxed text-fg-muted">
                    {t(s.corsNote, { provider: translator.label })}
                  </p>
                )}

                <TestRow state={trTest} onRun={runTranslatorTest} s={s} />
              </>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-fg">
            {s.appearanceHeading}
          </h2>
          <div className="card-surface mt-4 flex items-center justify-between gap-4 p-5">
            <span className="text-sm font-medium text-fg">{s.appearanceTheme}</span>
            <ThemeToggle />
          </div>
        </section>

        {/* Language */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold tracking-tight text-fg">
            {s.languageHeading}
          </h2>
          <div className="card-surface mt-4 flex items-center justify-between gap-4 p-5">
            <span className="text-sm font-medium text-fg">{d.language.label}</span>
            <LanguageToggle />
          </div>
        </section>

        <div className="mt-14 flex items-center justify-between border-t border-border pt-6">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            {s.backHome}
          </Link>
          <Link to="/editor" className="btn-primary">
            {s.openEditorCta}
          </Link>
        </div>
      </article>
    </div>
  );
}

/**
 * The OpenAI-compatible AI provider config (preset chips, base URL, key, model,
 * Test). Shared by the (hidden) AI-generation section and LLM translation.
 * Renders just the fields — the caller supplies the surrounding card.
 */
function AiProviderFields() {
  const { d, t } = useI18n();
  const s = d.settings;
  const { ai, setAi, selectProvider } = useSettings();
  const provider = getProvider(ai.provider);
  const [test, setTest] = useState<TestState>({ kind: "idle" });

  function runAiTest() {
    const baseUrl = normalizeBaseUrl(ai.baseUrl);
    if (!baseUrl || (provider.needsKey && !ai.apiKey.trim())) {
      setTest({ kind: "error", message: s.testNoKey });
      return;
    }
    void probeGet(`${baseUrl}/models`, aiHeaders(ai.provider, ai.apiKey), setTest, s, t);
  }

  return (
    <>
      <Field label={s.provider}>
        <div className="flex flex-wrap gap-2">
          {AI_PROVIDERS.map((p) => {
            const on = p.id === ai.provider;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  selectProvider(p.id);
                  setTest({ kind: "idle" });
                }}
                aria-pressed={on}
                className={`h-8 rounded-[8px] border px-3 text-sm font-medium transition ${
                  on
                    ? "border-accent-border bg-accent-subtle text-accent-text"
                    : "border-border text-fg-muted hover:bg-elevated hover:text-fg"
                }`}
              >
                {p.id === "custom" ? s.providerCustom : p.label}
              </button>
            );
          })}
        </div>
      </Field>

      <TextInput
        label={s.baseUrl}
        hint={s.baseUrlHint}
        value={ai.baseUrl}
        onChange={(v) => setAi({ baseUrl: v })}
        placeholder={s.baseUrlPlaceholder}
      />

      <SecretInput
        label={s.apiKey}
        hint={provider.needsKey ? s.apiKeyHint : s.apiKeyOptional}
        value={ai.apiKey}
        onChange={(v) => setAi({ apiKey: v })}
        placeholder={s.apiKeyPlaceholder}
        showLabel={s.show}
        hideLabel={s.hide}
      />

      <TextInput
        label={s.model}
        hint={s.modelHint}
        value={ai.model}
        onChange={(v) => setAi({ model: v })}
        placeholder={s.modelPlaceholder}
      />

      {provider.apiKeyUrl && (
        <a
          href={provider.apiKeyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent-text hover:underline"
        >
          <ExternalLink size={14} /> {t(s.getKey, { provider: provider.label })}
        </a>
      )}

      {provider.corsBlocked && (
        <p className="rounded-[10px] border border-info/40 bg-info/5 px-3 py-2 text-xs leading-relaxed text-fg-muted">
          {t(s.corsNote, { provider: provider.label })}
        </p>
      )}

      <p className="rounded-[10px] border border-warning/40 bg-warning/5 px-3 py-2 text-xs leading-relaxed text-fg-muted">
        {s.securityNote}
      </p>

      <TestRow state={test} onRun={runAiTest} s={s} />
    </>
  );
}

/** Shared "Test connection" button + inline result, used by each provider card. */
function TestRow({
  state,
  onRun,
  s,
}: {
  state: TestState;
  onRun: () => void;
  s: Dict["settings"];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onRun}
        disabled={state.kind === "testing"}
        className="btn-secondary disabled:opacity-60"
      >
        {state.kind === "testing" ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 size={14} className="animate-spin" />
            {s.testing}
          </span>
        ) : (
          s.test
        )}
      </button>
      {state.kind === "ok" && <span className="text-sm text-success">{s.testOk}</span>}
      {state.kind === "error" && (
        <span className="text-sm text-error">{state.message}</span>
      )}
    </div>
  );
}

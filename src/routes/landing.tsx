import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Lock,
  BookOpen,
  Download,
  Smartphone,
  Upload,
  ChevronDown,
  Info,
  Github,
} from "lucide-react";
import { useCard } from "../state/CardContext";
import { readCardFile, readCardFromUrl, loadExampleCard } from "../lib/io";
import { useI18n } from "../i18n";
import { REPO_URL } from "../links";
import HeaderControls from "../components/HeaderControls";

const FEATURE_ICONS = [FileText, Lock, BookOpen, Download, Smartphone];

const EXAMPLES = [
  { name: "Megumin", file: "megumin.png" },
  { name: "Rem", file: "rem.png" },
  { name: "Sherlock Holmes", file: "sherlock-holmes.png" },
];

const COMPATIBLE = [
  ["SillyTavern", "https://sillytavern.app"],
  ["RisuAI", "https://risuai.net"],
  ["Agnai", "https://agnai.chat"],
  ["Janitor AI", "https://janitorai.com"],
  ["Venus AI", "https://venusai.chat"],
  ["Chub.ai", "https://chub.ai"],
  ["CharacterHub", "https://characterhub.org"],
  ["Backyard AI", "https://backyard.ai"],
  ["OpenRoleplay", "https://openroleplay.ai"],
];

export default function LandingPage() {
  const { setState, reset } = useCard();
  const { d, t } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const state = await readCardFile(file);
      setState(state);
      navigate({ to: "/editor" });
    } catch (e) {
      setError(e instanceof Error ? e.message : d.landing.errorRead);
    } finally {
      setLoading(false);
    }
  }

  async function handleUrl() {
    const value = url.trim();
    if (!value) return;
    setError(null);
    setLoading(true);
    try {
      const state = await readCardFromUrl(value);
      setState(state);
      navigate({ to: "/editor" });
    } catch (e) {
      console.error(e);
      setError(d.landing.errorUrl);
    } finally {
      setLoading(false);
    }
  }

  async function handleExample(file: string, name: string) {
    setError(null);
    setLoading(true);
    try {
      const url = `${import.meta.env.BASE_URL}example-cards/${file}`;
      const state = await loadExampleCard(url, file);
      setState(state);
      navigate({ to: "/editor" });
    } catch {
      setError(t(d.landing.errorExample, { name }));
    } finally {
      setLoading(false);
    }
  }

  function createNew() {
    reset();
    navigate({ to: "/editor" });
  }

  const base = import.meta.env.BASE_URL;

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span aria-hidden>🃏</span>
          <span>{d.common.appName}</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <HeaderControls className="hidden sm:flex" />
          <Link to="/guide" className="btn-ghost">
            {d.common.guide}
          </Link>
          <Link to="/editor" className="btn-secondary">
            {d.common.openEditor}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-6 text-center">
        <h1 className="bg-gradient-to-b from-fg to-fg-faint bg-clip-text font-display text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          {d.common.appName}
        </h1>
        <p className="mt-4 text-balance text-lg text-fg-muted">{d.landing.tagline}</p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-8 cursor-pointer rounded-[14px] border-2 border-dashed p-10 transition ${
            dragging
              ? "border-accent bg-accent-subtle"
              : "border-border-strong bg-surface hover:border-accent hover:bg-elevated/60"
          }`}
        >
          <Upload className="mx-auto text-fg-faint" size={28} />
          <p className="mt-3 font-medium text-fg">
            {loading ? d.landing.dropReading : d.landing.dropTitle}
          </p>
          <p className="mt-1 text-sm text-fg-faint">{d.landing.dropFormats}</p>
          <input
            ref={inputRef}
            type="file"
            accept=".png,.json,.charx,image/png,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        {/* Import by URL */}
        <div className="mt-5">
          <p className="text-sm text-fg-faint">{d.landing.urlLabel}</p>
          <div className="mx-auto mt-2 flex max-w-xl gap-2">
            <input
              type="url"
              className="input flex-1"
              value={url}
              placeholder={d.landing.urlPlaceholder}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUrl();
              }}
            />
            <button
              onClick={handleUrl}
              disabled={loading || !url.trim()}
              className="btn-secondary shrink-0"
            >
              {d.landing.urlImport}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <button onClick={createNew} className="btn-secondary">
            {d.common.createNew}
          </button>
        </div>

        {/* Examples */}
        <div className="mt-10">
          <p className="text-sm text-fg-faint">{d.landing.exampleHeading}</p>
          <div className="mt-4 flex justify-center gap-4">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.file}
                onClick={() => handleExample(ex.file, ex.name)}
                className="group w-28 text-center"
              >
                <div className="overflow-hidden rounded-[12px] border border-border transition group-hover:border-accent group-hover:shadow-[0_8px_24px_-8px_#f4623aaa]">
                  <img
                    src={`${base}example-cards/${ex.file}`}
                    alt={ex.name}
                    className="aspect-[2/3] w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="mt-2 block text-xs text-fg-muted transition group-hover:text-fg">
                  {ex.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight">
          {d.landing.featuresHeading}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-fg-muted">
          {d.landing.featuresSub}
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.landing.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? FileText;
            return (
              <div key={i} className="card-surface p-5">
                <Icon className="text-accent" size={22} />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{f.body}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center">
          <Link to="/guide" className="text-sm text-accent-text hover:underline">
            {d.landing.guideLink}
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight">
          {d.landing.faqHeading}
        </h2>
        <div className="mt-8 space-y-3">
          {d.landing.faq.map((item, i) => (
            <details key={i} className="card-surface group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-fg">
                {item.q}
                <ChevronDown
                  size={18}
                  className="text-fg-faint transition group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-5 py-16">
        <div className="card-surface p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {d.landing.whatTitle}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
            {d.landing.whatBody}
          </p>

          <div className="mt-6 flex gap-3 rounded-[12px] border border-warning/40 bg-warning/5 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-warning" />
            <div className="max-w-3xl space-y-1.5">
              <h3 className="text-sm font-semibold text-fg">
                {d.landing.originTitle}
              </h3>
              <p className="text-sm leading-relaxed text-fg-muted">
                {d.landing.originBody}
              </p>
              <p className="text-sm leading-relaxed text-fg-muted">
                {d.landing.originTakedown}
              </p>
              <p>
                <Link
                  to="/changes"
                  className="text-sm font-medium text-accent-text hover:underline"
                >
                  {d.landing.originLink}
                </Link>
              </p>
            </div>
          </div>

          <h3 className="mt-6 text-sm font-semibold text-fg-muted">
            {d.landing.compatible}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {COMPATIBLE.map(([name, href]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-accent-text"
              >
                {name}
              </a>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link to="/guide" className="text-sm text-accent-text hover:underline">
                {d.landing.guideFooterLink}
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition hover:text-accent-text"
              >
                <Github size={14} /> {d.common.sourceCode}
              </a>
            </div>
            <HeaderControls className="sm:hidden" />
          </div>
        </div>
      </footer>
    </div>
  );
}

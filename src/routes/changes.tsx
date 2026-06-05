import { Link } from "@tanstack/react-router";
import { Info, Github } from "lucide-react";
import HeaderControls from "../components/HeaderControls";
import { Rich } from "../components/Rich";
import { useI18n } from "../i18n";
import { REPO_URL } from "../links";
import { changesEn, changesKo } from "../i18n/changes";

export default function ChangesPage() {
  const { locale, d } = useI18n();
  const c = locale === "ko" ? changesKo : changesEn;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            {c.back}
          </Link>
          <div className="flex items-center gap-2">
            <HeaderControls className="hidden sm:flex" />
            <Link to="/editor" className="btn-secondary">
              {c.openEditor}
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 leading-relaxed text-fg-muted">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
          {c.title}
        </h1>
        <p className="mt-3 text-fg-muted">{c.subtitle}</p>

        {/* Reconstruction reminder */}
        <div className="mt-8 flex gap-3 rounded-[12px] border border-warning/40 bg-warning/5 p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-warning" />
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-fg-muted">
              <Rich text={c.originNote} />
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-text hover:underline"
            >
              <Github size={15} /> {d.common.sourceCode}
            </a>
          </div>
        </div>

        {/* Differences */}
        <section className="mt-12 space-y-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg">
            {c.diffTitle}
          </h2>
          <div className="space-y-3">
            {c.diffs.map((d) => (
              <div key={d.title} className="card-surface p-4">
                <h3 className="font-semibold text-fg">
                  <Rich text={d.title} />
                </h3>
                <p className="mt-1 text-sm text-fg-muted">
                  <Rich text={d.body} />
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Change log */}
        <section className="mt-12 space-y-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-fg">
            {c.logTitle}
          </h2>
          <p className="text-sm text-fg-muted">{c.logIntro}</p>
          <ol className="space-y-6">
            {c.log.map((entry) => (
              <li
                key={entry.date}
                className="relative border-l border-border pl-5"
              >
                <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-accent" />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-semibold text-fg">{entry.title}</h3>
                  <time className="font-mono text-xs text-fg-subtle">
                    {entry.date}
                  </time>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg-muted">
                  {entry.items.map((it, i) => (
                    <li key={i}>
                      <Rich text={it} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-14 flex items-center justify-between border-t border-border pt-6">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            {c.backHome}
          </Link>
          <Link to="/editor" className="btn-primary">
            {c.openEditorCta}
          </Link>
        </div>
      </article>
    </div>
  );
}

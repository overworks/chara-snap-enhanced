import { Link } from "@tanstack/react-router";
import HeaderControls from "../components/HeaderControls";
import { Rich } from "../components/Rich";
import { useI18n } from "../i18n";
import { guideEn, guideKo } from "../i18n/guide";

// Stable anchor ids (not translated), aligned to the `toc` / section order.
const SECTION_IDS = [
  "what-is-a-character-card",
  "getting-started",
  "character-card-fields",
  "lorebooks",
  "v2-vs-v3",
  "writing-tips",
  "exporting-and-sharing",
] as const;

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-20 font-display text-2xl font-bold tracking-tight text-fg">
      {children}
    </h2>
  );
}

export default function GuidePage() {
  const { locale } = useI18n();
  const g = locale === "ko" ? guideKo : guideEn;

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            {g.back}
          </Link>
          <div className="flex items-center gap-2">
            <HeaderControls className="hidden sm:flex" />
            <Link to="/editor" className="btn-secondary">
              {g.openEditor}
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-10 leading-relaxed text-fg-muted">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
          {g.title}
        </h1>
        <p className="mt-3 text-fg-muted">{g.subtitle}</p>

        <nav className="mt-8 card-surface p-5">
          <ul className="space-y-1.5 text-sm">
            {SECTION_IDS.map((id, i) => (
              <li key={id}>
                <a href={`#${id}`} className="text-accent-text hover:underline">
                  {g.toc[i]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[0]}>{g.s1.heading}</H>
          {g.s1.paras.map((p, i) => (
            <p key={i}>
              <Rich text={p} />
            </p>
          ))}
        </section>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[1]}>{g.s2.heading}</H>
          <h3 className="font-semibold text-fg">{g.s2.editTitle}</h3>
          <ol className="list-decimal space-y-1 pl-5">
            {g.s2.edit.map((li, i) => (
              <li key={i}>
                <Rich text={li} />
              </li>
            ))}
          </ol>
          <h3 className="font-semibold text-fg">{g.s2.createTitle}</h3>
          <ol className="list-decimal space-y-1 pl-5">
            {g.s2.create.map((li, i) => (
              <li key={i}>
                <Rich text={li} />
              </li>
            ))}
          </ol>
          <h3 className="font-semibold text-fg">{g.s2.tryTitle}</h3>
          <p>{g.s2.tryBody}</p>
        </section>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[2]}>{g.s3.heading}</H>
          <div className="space-y-4">
            {g.s3.fields.map((f) => (
              <div key={f.code}>
                <h3 className="font-semibold text-fg">
                  {f.name}{" "}
                  <code className="rounded bg-elevated px-1.5 py-0.5 text-xs text-fg-muted">
                    {f.code}
                  </code>
                </h3>
                <p className="mt-1 text-sm text-fg-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[3]}>{g.s4.heading}</H>
          <p>{g.s4.intro}</p>
          <h3 className="font-semibold text-fg">{g.s4.howTitle}</h3>
          <p className="text-sm text-fg-muted">
            <Rich text={g.s4.howBody} />
          </p>
          <h3 className="font-semibold text-fg">{g.s4.fieldsTitle}</h3>
          <div className="space-y-3">
            {g.s4.fields.map((f) => (
              <div key={f.name}>
                <h4 className="text-sm font-medium text-fg">{f.name}</h4>
                <p className="text-sm text-fg-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[4]}>{g.s5.heading}</H>
          <div className="overflow-hidden rounded-[12px] border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-fg-muted">
                <tr>
                  {g.s5.head.map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-fg-muted">
                {g.s5.rows.map((row) => (
                  <tr key={row[0]} className="border-t border-border">
                    {row.map((cell, i) => (
                      <td key={i} className="px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-fg-muted">
            <Rich text={g.s5.note} />
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[5]}>{g.s6.heading}</H>
          <div className="space-y-3">
            {g.s6.tips.map((t) => (
              <div key={t.name}>
                <h3 className="font-semibold text-fg">{t.name}</h3>
                <p className="text-sm text-fg-muted">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <H id={SECTION_IDS[6]}>{g.s7.heading}</H>
          <h3 className="font-semibold text-fg">{g.s7.pngTitle}</h3>
          <p className="text-sm text-fg-muted">
            <Rich text={g.s7.pngBody} />
          </p>
          <h3 className="font-semibold text-fg">{g.s7.altTitle}</h3>
          <p className="text-sm text-fg-muted">{g.s7.altBody}</p>
          <h3 className="font-semibold text-fg">{g.s7.whereTitle}</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {g.s7.where.map((li, i) => (
              <li key={i}>
                <Rich text={li} />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 flex items-center justify-between border-t border-border pt-6">
          <Link to="/" className="text-sm text-fg-muted hover:text-fg">
            {g.backHome}
          </Link>
          <Link to="/editor" className="btn-primary">
            {g.openEditorCta}
          </Link>
        </div>
      </article>
    </div>
  );
}

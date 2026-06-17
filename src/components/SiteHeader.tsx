import { Link } from "@tanstack/react-router";
import HeaderControls from "./HeaderControls";
import { useI18n } from "../i18n";

/**
 * The unified top bar shared across the content pages (landing, guide, changes,
 * settings). The brand returns home; the same nav (Guide · Settings · controls ·
 * Open Editor) appears everywhere, with the current page highlighted. The editor
 * keeps its own toolbar — it's the working surface, not a marketing page.
 */
export default function SiteHeader({
  wide = false,
  sticky = true,
}: {
  /** Wider container (max-w-5xl) to match the landing layout. */
  wide?: boolean;
  /** Stick to the top with a bottom border + blur (content pages). */
  sticky?: boolean;
}) {
  const { d } = useI18n();
  const max = wide ? "max-w-5xl" : "max-w-3xl";
  return (
    <header
      className={
        sticky ? "sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur" : ""
      }
    >
      <div className={`mx-auto flex ${max} items-center justify-between px-5 py-3`}>
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-base font-semibold tracking-tight text-fg"
        >
          <span aria-hidden>🃏</span>
          <span>{d.common.appName}</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm sm:gap-2">
          <Link
            to="/guide"
            className="btn-ghost"
            activeProps={{ className: "text-accent-text" }}
          >
            {d.common.guide}
          </Link>
          <Link
            to="/settings"
            className="btn-ghost"
            activeProps={{ className: "text-accent-text" }}
          >
            {d.common.settings}
          </Link>
          <HeaderControls className="hidden sm:flex" />
          <Link to="/editor" className="btn-secondary">
            {d.common.openEditor}
          </Link>
        </nav>
      </div>
    </header>
  );
}

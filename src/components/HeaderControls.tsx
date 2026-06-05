import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme, type ThemePreference } from "../theme/ThemeContext";
import { useI18n, LOCALES, type Locale } from "../i18n";

const THEME_OPTS: { value: ThemePreference; icon: typeof Sun; key: "system" | "light" | "dark" }[] = [
  { value: "system", icon: Monitor, key: "system" },
  { value: "light", icon: Sun, key: "light" },
  { value: "dark", icon: Moon, key: "dark" },
];

function Segmented({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-[10px] border border-border bg-surface p-0.5">
      {children}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { d } = useI18n();
  return (
    <Segmented>
      {THEME_OPTS.map((opt) => {
        const on = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            title={d.theme[opt.key]}
            aria-label={`${d.theme.label}: ${d.theme[opt.key]}`}
            aria-pressed={on}
            className={`flex size-7 items-center justify-center rounded-[7px] transition ${
              on
                ? "bg-accent text-white"
                : "text-fg-faint hover:text-fg hover:bg-elevated"
            }`}
          >
            <opt.icon size={15} />
          </button>
        );
      })}
    </Segmented>
  );
}

export function LanguageToggle() {
  const { locale, setLocale, d } = useI18n();
  return (
    <Segmented>
      {LOCALES.map((opt) => {
        const on = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value as Locale)}
            title={d.language.label}
            aria-pressed={on}
            className={`flex h-7 items-center justify-center rounded-[7px] px-2 text-xs font-medium transition ${
              on
                ? "bg-accent text-white"
                : "text-fg-faint hover:text-fg hover:bg-elevated"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </Segmented>
  );
}

export default function HeaderControls({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}

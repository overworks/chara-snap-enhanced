import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "chara-snap-theme";

interface ThemeContextValue {
  /** What the user picked: light, dark, or follow the system. */
  theme: ThemePreference;
  /** The theme actually applied right now (system resolved to light/dark). */
  resolved: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function readStored(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

function resolve(theme: ThemePreference): ResolvedTheme {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light";
  return theme;
}

function applyTheme(resolved: ResolvedTheme) {
  const el = document.documentElement;
  el.classList.toggle("dark", resolved === "dark");
  el.classList.toggle("light", resolved === "light");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => readStored());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(theme));

  // Apply + persist whenever the preference changes.
  useEffect(() => {
    const next = resolve(theme);
    setResolved(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Track OS changes while following the system.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = mq.matches ? "dark" : "light";
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: ThemePreference) => setThemeState(t), []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

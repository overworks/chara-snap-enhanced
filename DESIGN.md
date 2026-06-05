---
version: alpha
name: Chara Studio
description: >-
  Visual identity for Chara Studio, a 100% client-side AI character-card editor.
  Warm "persimmon" accent on a near-neutral, theme-aware (light/dark) surface
  system, a self-hosted display typeface for headings, and a token-driven
  component layer. Canonical values below are the DARK theme; light-theme
  overrides are documented in the Colors section.
colors:
  # Surfaces (dark canonical)
  bg: "#09090b"
  surface: "#111114"
  elevated: "#27272a"
  elevated-hover: "#3f3f46"
  # Foreground / text
  fg: "#f4f4f5"
  fg-muted: "#a1a1aa"
  fg-faint: "#71717a"
  fg-subtle: "#52525b"
  # Borders (alpha hex)
  border: "#ffffff0f"
  border-strong: "#ffffff1a"
  # Brand — Persimmon. `primary` is the white-text fill (deepened for contrast);
  # `accent` is the bright signature used for borders/icons/hover/focus.
  primary: "#e2552e"
  primary-hover: "#f4623a"
  accent: "#f4623a"
  accent-border: "#f4623a40"
  accent-text: "#ff8a66"
  accent-subtle: "#f4623a1f"
  on-primary: "#ffffff"
  # Status (dark canonical; light overrides in the Colors section)
  success: "#34d399"
  error: "#f87171"
  info: "#60a5fa"
  warning: "#f99c00"
typography:
  display-lg:
    fontFamily: "Bricolage Grotesque"
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 1.05
    letterSpacing: -0.02em
  display-md:
    fontFamily: "Bricolage Grotesque"
    fontSize: 30px
    fontWeight: "700"
    lineHeight: 1.1
    letterSpacing: -0.01em
  title-lg:
    fontFamily: "Bricolage Grotesque"
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 1.2
  heading-sm:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 1.4
  body-md:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 1.6
  body-sm:
    fontFamily: system-ui
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 1.6
  label-md:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 1.2
  label-sm:
    fontFamily: system-ui
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 1.4
  code-sm:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 1.5
rounded:
  sm: 6px
  DEFAULT: 10px
  md: 10px
  lg: 14px
  xl: 20px
  full: 9999px
spacing:
  unit: 4px
  field-gap: 16px
  section-gap: 24px
  page-padding: 20px
  header-height: 48px
  sidebar-width: 352px
  drawer-width: 272px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.fg}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.elevated-hover}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.fg-muted}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-ghost-hover:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.fg}"
  card-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: 38px
  textarea:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 12px
  chip:
    backgroundColor: "{colors.elevated}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  tab-active:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  tab-inactive:
    textColor: "{colors.fg-faint}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

## Brand & Style

Chara Studio is a free, 100%-client-side editor for AI character cards (SillyTavern
V2/V3 PNG, JSON, and CHARX). Its personality is **a warm, focused creative studio**:
calm neutral surfaces let the work — the character, its art, its lore — take center
stage, while a single warm **persimmon** accent gives the product its own identity and
guides the eye to the next action.

The feel is craft-tool, not marketing-SaaS: confident type, generous rhythm, restrained
depth, and quick, tactile feedback. Two non-negotiable principles shape every decision:

- **Theme-aware.** Light, dark, and system are first-class; nothing is hardcoded to one
  mode. Dark is the canonical reference but light must feel equally intentional.
- **Zero external network.** The app ships statically with no CDN, no fonts-over-the-wire,
  no telemetry. The display font is self-hosted and bundled. Honor this in every addition.

This file is the source of truth for the visual system. In code, the tokens below map to
CSS custom properties in `src/index.css` (the `@theme` block plus the `:root.dark` /
`:root.light` palettes), and components consume only those semantic tokens — so the system
re-themes from one place. Keep this file and `src/index.css` in sync.

## Colors

The palette is a near-neutral zinc surface ramp plus one warm brand accent and four status
hues. Components never hardcode hex; they reference semantic tokens (`bg`, `surface`,
`elevated`, `fg`, `fg-muted`, `border`, `accent`, `accent-text`, …), which resolve
per-theme at runtime.

**Brand — Persimmon.** The signature is `#F4623A`. Because the primary button and the
segmented toggles place **white text on the accent fill**, the fill token (`primary`) is a
deepened `#E2552E` for contrast; the bright `#F4623A` (`accent`) is reserved for borders,
icons, hover, and focus rings where white-text contrast is not required.

- Contrast note: white on `#E2552E` ≈ 3.6:1 (acceptable for the 14px medium button label as
  a documented brand tradeoff). If stricter AA is required, drop the fill to `#D94E28`.
- Never reintroduce the legacy purple (`#6d5cff`). The accent is the only chromatic brand
  element; everything else stays neutral.

**Light-theme overrides.** The YAML front matter lists dark (canonical) values. In light
mode these tokens change:

| token          | dark        | light       |
| -------------- | ----------- | ----------- |
| bg             | `#09090b`   | `#fafafa`   |
| surface        | `#111114`   | `#ffffff`   |
| elevated       | `#27272a`   | `#f4f4f5`   |
| elevated-hover | `#3f3f46`   | `#e4e4e7`   |
| fg             | `#f4f4f5`   | `#18181b`   |
| fg-muted       | `#a1a1aa`   | `#52525b`   |
| fg-subtle      | `#52525b`   | `#a1a1aa`   |
| border         | `#ffffff0f` | `#00000014` |
| border-strong  | `#ffffff1a` | `#00000024` |
| accent-text    | `#ff8a66`   | `#c2451f`   |
| accent-subtle  | `#f4623a1f` | `#f4623a14` |
| success / error / info / warning | `#34d399` / `#f87171` / `#60a5fa` / `#f99c00` | `#0f9d6b` / `#dc2626` / `#2563eb` / `#c2710c` |

`primary`, `primary-hover`, and `accent` are brand-constant across themes; `accent-text`,
`accent-subtle`, and the status hues are deepened in light mode for contrast on white.

## Typography

Two families, applied by role:

- **Display — Bricolage Grotesque** (self-hosted via `@fontsource/bricolage-grotesque`,
  weights 600/700). A warm, characterful grotesque used **only** for headings and the
  wordmark: hero `h1` (`display-lg`), page `h1` (`display-md`), and section `h2`
  (`title-lg`). It carries the brand voice without compromising legibility.
- **Body / UI — system sans** (`system-ui` stack). Everything else: `h3` (`heading-sm`),
  body copy (`body-md`/`body-sm`), form field labels (`label-sm`), and buttons
  (`label-md`). Keeps the bundle light and rendering instant.
- **Code — monospace** (`code-sm`) for the Raw JSON editor, lorebook/asset code, and the
  CHARX/JSON examples.

Always declare the display family with a `system-ui` fallback so a missing glyph or a
slow font load never breaks layout (FOUT is acceptable; FOIT is not).

## Layout & Spacing

A 4px base grid governs spacing; rhythm steps land on 8 / 12 / 16 / 24.

- **Editor** is an app shell: a 48px top header (`header-height`), a horizontally
  scrollable tab bar, a scrollable content column capped at `max-w-2xl` for comfortable
  form reading, and a persistent right **profile sidebar** (`sidebar-width` 352px) on
  `lg+`. Below `lg`, the profile becomes a right-anchored **drawer** (`drawer-width`
  272px) over a scrim.
- **Landing & Guide** are single centered columns: hero/FAQ at `max-w-3xl`, feature/footer
  bands at `max-w-5xl`, page padding `page-padding` (20px), growing on `sm+`.
- **Field rhythm:** `field-gap` (16px) between inputs within a group, `section-gap` (24px)
  between sections. Two-column field grids collapse to one column below `sm`.

Preserve generous negative space; density should come from clear grouping, not cramming.

## Elevation & Depth

Depth is **border-first, shadow-second** — surfaces are defined primarily by their
background step and a 1px token border, with shadows used sparingly for genuine layering:

- **Base:** `bg`. **Raised:** `surface` / `card-surface` with a `border` and an
  ultra-low-alpha shadow. **Floating:** modals and the mobile drawer sit on a
  `rgba(0,0,0,0.6)` scrim.
- **Hover lift:** interactive cards/buttons may raise their shadow slightly and use
  `active:scale-[0.98]` for tactile feedback; transitions cover color + transform.
- **Focus:** a visible accent focus ring (`ring-2` at ~30–40% accent) on inputs and
  buttons — never remove focus affordances.

Keep shadows ultra-low-alpha so dark mode never looks muddy; verify depth in both themes.

## Shapes

A small, deliberate radius scale (`rounded`): inputs, buttons, tabs, and small controls use
`md` (10px); cards and panels use `lg` (14px); chips and pills use `full`; large feature
surfaces may use `xl` (20px). Consistency across a screen matters more than any single
value — don't mix arbitrary radii.

## Components

- **Buttons** — `button-primary` (persimmon fill, white text, soft warm shadow),
  `button-secondary` (elevated surface + border), `button-ghost` (transparent → elevated on
  hover). All share `label-md` type, `md` radius, `active:scale-[0.98]`, and an accent
  focus ring. Disabled = 50% opacity, no pointer events.
- **Inputs / textarea** — `surface` background, `border`, `md` radius, accent focus ring;
  textarea is `resize-y` with relaxed line height. Field label uses `label-sm` (`fg-muted`);
  optional helper hint uses `fg-faint`; tooltips explain non-obvious fields.
- **card-surface** — the standard panel: `surface` + `border` + `lg` radius + subtle shadow.
  Used for grouped settings, feature cards, FAQ items, and the guide's ToC.
- **chip** — `full`-radius `elevated` pill for tags and keys; `label-sm`.
- **Editor tabs** — active = accent pill (`tab-active`: `accent-subtle` bg + `accent-text`);
  inactive = `fg-faint` with an `elevated` hover background. Keeps the existing tab layout.
- **Export modal** — `card-surface` over a scrim; format options are bordered radio cards
  that highlight with `accent` + `accent-subtle` when selected; validation issues use the
  status colors (`error`/`warning`/`info`).

## Do's and Don'ts

- **Do** drive all color from the semantic tokens here / in `src/index.css`. **Don't**
  hardcode hex in components (the only literal-color spots are the token definitions).
- **Do** keep persimmon as the sole brand accent. **Don't** reintroduce purple or add a
  second chromatic brand color without updating this file first.
- **Do** put white text only on the `primary` (`#E2552E`) fill. **Don't** put white text on
  bright `accent` (`#F4623A`) — its contrast is too low.
- **Do** use the display font for headings and the wordmark only. **Don't** apply it to body
  copy, labels, inputs, or data (e.g. the editor's character-name field).
- **Do** keep light and dark at parity — design and verify both. **Don't** tune one theme
  and assume the other follows.
- **Do** preserve the zero-network principle: self-host any font/asset, no CDN, no
  telemetry. **Don't** add an external request to satisfy a visual.
- **Do** keep focus rings and aria affordances. **Don't** trade accessibility for polish.

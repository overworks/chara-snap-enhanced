# Repository Guidelines

## Project Structure & Module Organization

Chara Studio is a client-only Vite + React + TypeScript app. Application entry points live in `src/main.tsx` and `src/router.tsx`. Route screens are in `src/routes/`, shared UI is in `src/components/`, editor tab panels are in `src/components/editor/tabs/`, state is in `src/state/`, theme/i18n helpers are in `src/theme/` and `src/i18n/`, and pure card/PNG/CHARX logic is in `src/lib/`. Unit tests currently live next to library code, for example `src/lib/io.test.ts`. Static public assets belong in `public/`; production output is generated into `dist/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite development server.
- `npm test`: run Vitest once for unit tests.
- `npm run test:watch`: run Vitest in watch mode while editing.
- `npm run typecheck`: run `tsc --noEmit` for TypeScript validation.
- `npm run build`: create the production build in `dist/`, including the GitHub Pages SPA fallback files.
- `npm run preview`: serve the built output locally.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and ESM imports. Match the existing two-space indentation, semicolon usage, and double-quoted strings. Keep reusable, deterministic data transforms in `src/lib/` as pure functions; keep browser and UI concerns in components or routes. Name React components and context providers in `PascalCase` (`ProfilePanel.tsx`, `CardContext.tsx`), hooks and helpers in `camelCase`, and route files in lowercase (`editor.tsx`, `guide.tsx`).

For any UI or visual work, follow `DESIGN.md` — the design system source of truth, written in Google Stitch's open [DESIGN.md format](https://github.com/google-labs-code/design.md). It encodes the brand (persimmon accent), theme-aware color tokens, typography (self-hosted display font), spacing, radius, and component styles. These tokens map to CSS custom properties in `src/index.css`; components consume only the semantic tokens, never hardcoded hex. Keep `DESIGN.md` and `src/index.css` in sync.

## Testing Guidelines

Vitest is configured in `vite.config.ts` with Node environment and `src/**/*.test.ts` discovery. Add focused tests beside the code they cover, using descriptive `describe` and `it` names. Prioritize round-trip coverage for PNG, JSON, CHARX, assets, validation, and token logic. Run `npm test` and `npm run typecheck` before submitting changes.

## Commit & Pull Request Guidelines

Follow the existing Conventional Commit style: `feat(ui): ...`, `fix(actions): ...`, `test(charx): ...`, `docs: ...`, or `refactor: ...`. Keep commits scoped and imperative. Pull requests should include a short summary, testing performed, linked issues when applicable, and screenshots or screen recordings for visible UI changes. Note any deployment-impacting changes such as `VITE_BASE`, routing, or GitHub Pages behavior.

## Security & Configuration Tips

This app is intentionally client-side: do not add backend uploads, accounts, telemetry, or network dependencies without explicit project approval. Keep card parsing tolerant but validate exports carefully. For GitHub Pages builds, use the default base `/chara-snap-enhanced/`; set `VITE_BASE=/` only for custom domains or user/org pages.

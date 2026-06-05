# Chara Studio

A free, 100% client-side **AI character card editor** for SillyTavern / RisuAI / Agnai —
a clean reconstruction of [charasnap.com](https://charasnap.com) with added features.
No backend, no accounts, no uploads: everything runs in your browser.

## Why this project exists

I wanted to add features to [charasnap.com](https://charasnap.com), but it ships **no
public source** and its author **could not be reached**. This is an independent,
clean-room reconstruction built out of necessity so that work could continue.

> [!IMPORTANT]
> This project is **not affiliated with or endorsed by** the original Chara Snap or its
> author. If the original author objects, **this repository and its deployed site will be
> taken down immediately on request.** Open an issue or contact the maintainer.

## Features

- Import **PNG** (V2 `chara` / V3 `ccv3` tEXt chunks), **JSON**, and **CHARX** cards
- Full editor across 7 tabs: Identity, Messages, Prompts, Lorebook, Extensions, Assets,
  Raw JSON
- Lorebook editor with keywords, secondary keys, priority, order, selective/constant,
  position, and per-entry/book extensions
- `depth_prompt`, `talkativeness`, `fav` extensions; V3 nickname, group greetings,
  multilingual notes, source links, assets
- Export to **PNG (V2 / V3 / both)**, **JSON (V2 / V3)**, or **CHARX (.charx ZIP)**
- Live validation (error/warning/info) and per-field token estimates
- Three starter example cards

### New vs. the original
- **Real CHARX (.charx) read/write** with embedded assets (the original only stubbed it)
- Self-contained Raw JSON editor (no CDN dependency → genuinely zero network calls)

## Tech

Vite + React + TanStack Router + Tailwind v4 + fflate. All card logic lives in
[`src/lib`](src/lib) as pure, tested functions.

## Develop

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (PNG/JSON/CHARX round-trips, validation)
npm run typecheck  # tsc --noEmit
npm run build      # production build → dist/
```

## Deploy (GitHub Pages)

Pushing to `0.x` triggers `.github/workflows/deploy.yml`, which builds with
`VITE_BASE=/chara-snap-enhanced/` and publishes `dist/` to Pages. A `404.html` copy of
`index.html` provides the SPA fallback for deep links (`/editor`, `/guide`).

- **Project page** (`user.github.io/chara-snap-enhanced/`): default, no changes needed.
- **Custom domain or user/org page**: build with `VITE_BASE=/`.

Enable Pages once under **Settings → Pages → Source: GitHub Actions**.

## Reverse-engineering notes

This is a clean reconstruction from the public production bundle (the original ships no
source). The reconstructed spec lives in [`SPEC.md`](SPEC.md); raw analysis scratch is in
`_analysis/` (gitignored).

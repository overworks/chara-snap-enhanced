# Chara Snap — Reverse-Engineered Spec

Reconstructed from the production bundle at https://charasnap.com (Vite/React build,
`index-0DU9sIfN.js`, captured 2026-06-05). This documents the **original** app so the
rebuild can be faithful. New/added features are tracked separately in the repo.

> The original ships **no source** and **no author info** by design. This rebuild is a
> clean reconstruction from observed behavior + the public client bundle.

## 1. Stack & hosting

- **Original**: Vite + React + TanStack Router + Tailwind v4 + Monaco editor (Raw JSON tab).
- **Hosting**: Vercel. Our target: **GitHub Pages (fully static, no backend)** — already
  matches the original's 100%-client-side design.
- Routing on GH Pages: path-based routes (`/editor`, `/guide`) need a `404.html` → SPA
  fallback, OR use hash routing. (Decision pending.)

## 2. Routes

| Path | Purpose |
|------|---------|
| `/`        | Landing: hero, dropzone, example cards, features, FAQ, footer |
| `/editor`  | The editor (7 tabs + profile panel + export modal) |
| `/guide`   | Long-form documentation page (7 sections) |

## 3. Design tokens (from CSS)

- Accent `#6d5cff`, hover `#7e70ff`, subtle `#6d5cff1a`, border `#6d5cff40`
- Surface base `#111114`, body `bg-zinc-950`, text `zinc-100`
- Status: success `#34d399`, error `#f87171`, info `#60a5fa`, warning `#f99c00`
- Fonts: system stack (`ui-sans-serif, system-ui…`), mono (`ui-monospace…`). No web fonts.
- Radius: sm 6px, md 10px, lg 14px, xl 20px
- Layout: header 48px, left drawer 17rem, right drawer 22rem, mobile footer 56px, tabbar 44px
- Favicon: inline SVG 🃏 emoji

## 4. Character card data model

### V2 envelope
`{ spec: "chara_card_v2", spec_version: "2.0", data: {...} }`

Core `data` fields (defaults):
```
name "", description "", personality "", scenario "",
first_mes "", mes_example "", creator_notes "",
system_prompt "", post_history_instructions "",
alternate_greetings [], tags [], creator "", character_version "",
extensions {}, character_book? (optional)
```

### V3 envelope
`{ spec: "chara_card_v3", spec_version: "3.0", data: {...} }` — all V2 fields plus:
```
nickname?, group_only_greetings? [], creator_notes_multilingual? {lang: text},
assets? [], source? [], creation_date? (ms), modification_date? (ms)
```
On V3 export, `creation_date`/`modification_date` auto-fill with `Date.now()` if missing.

### Extensions (known keys)
- `depth_prompt: { prompt: string, depth: number, role: "system"|"user"|"assistant" }`
- `talkativeness: number` (0–1, default 0.5)
- `fav: boolean`
- Any other keys are preserved read-only on export.

### Assets (V3)
`{ type: "icon"|"background"|"emotion"|"user_icon"|"other", uri, name, ext }`

## 5. Lorebook (character_book)

Book-level: `name?, description?, scan_depth?, token_budget?, recursive_scanning?,
entries[], extensions?`

Entry defaults:
```
keys [], content "", extensions {}, enabled true, insertion_order n,
case_sensitive false, name "", priority 10, id (=insertion_order),
comment "", selective false, secondary_keys [], constant false,
position "before_char"   // or "after_char"
```

## 6. File I/O

### PNG read (`i0`)
1. Parse PNG chunks. Collect all `tEXt` chunks → `{keyword: text}`.
2. Priority: `ccv3` (V3) > `chara` (V2). base64-decode → `JSON.parse` → normalize.
3. Legacy V1 = no `spec` field → treat raw object as data, `detectedVersion: "v1"`.
4. Error if neither key present.

### PNG write (`IN`)
1. Parse chunks, drop existing `chara`/`ccv3` tEXt chunks.
2. Per export format, build base64(JSON) tEXt chunks:
   - `png_v2v3` → both `ccv3` + `chara`
   - `png_v3` → `ccv3` only
   - `png_v2` → `chara` only
3. Insert before `IEND`. Recompute CRC32 per chunk. Re-emit PNG.

tEXt encoding: `keyword \0 text`, Latin-1 only, keyword < 80 chars, no 0x00 in body.
base64: UTF-8 encode → binary string → `btoa`. Decode: `atob` → bytes → UTF-8 decode.

### JSON export
`json_v2` → V2 envelope, `json_v3` → V3 envelope, `JSON.stringify(…, null, 2)`.

### Version pick on export (`Ld`)
Use v3 if detected as v3 OR card has any V3-only field present; else v2.

## 7. Validation (severity error/warning/info)
- error: name required
- warning: empty description; missing first_mes; empty alt/group greetings; empty
  source links; lorebook entry without keywords/content; modification_date < creation_date
- info: personality > 4000 chars; lorebook metadata set but no entries;
  mes_example missing `<START>`; asset missing name

## 8. Token counting
Per-field token counts (name, description, personality, scenario, first_mes, mes_example,
system_prompt, post_history_instructions, creator_notes, sum of alt greetings, sum of
lorebook entry content) + total. Shown in export modal.

## 9. Editor — 7 tabs

1. **Identity** — name, nickname(V3), description, personality, scenario, creator_notes,
   multilingual notes(V3, add/remove lang+text)
2. **Messages** — first_mes; alternate_greetings (collapsible, reorderable, add/remove);
   group_only_greetings(V3); mes_example (mono, `<START>` hint)
3. **Prompts** — system_prompt, post_history_instructions
4. **Lorebook** — book settings (name, description, scan_depth, token_budget, recursive,
   extensions JSON) + searchable entry list; each entry expandable with all fields above
5. **Extensions** — depth_prompt (prompt/depth/role), talkativeness slider, fav checkbox,
   other extensions (read-only JSON)
6. **Assets** — V3 source links (add/remove), asset management
7. **Raw JSON** — Monaco editor, Format/Refresh/Apply, shows parse errors

**Profile panel** (right/left drawer): avatar upload (2:3, image/*), name, creator, tags
(pills), character_version, "Imported as V2/V3" badge + filename, Export button.

**Export modal**: format selector (5 options), stats (greetings/entries/assets counts,
per-field token breakdown), validation messages, Download button.

## 10. Landing page content
- Hero: "Chara Snap" / "Create, edit, and export character cards for AI roleplay platforms."
- Dropzone: "Drop a character card here" / "PNG or JSON" + "Create New"
- Examples: Megumin, Rem, Sherlock Holmes (`/example-cards/{name}.png`)
- 5 feature cards, 6 FAQ items, footer with compatible-app links.
- Compatible apps (footer links): SillyTavern, RisuAI, Agnai, Janitor AI, Venus AI,
  Chub.ai, CharacterHub, Backyard AI, OpenRoleplay. (No Discord/GitHub/Ko-fi.)

## 11. Guide page — 7 sections
1. What is a Character Card?  2. Getting Started  3. Character Card Fields (15 field docs)
4. Working with Lorebooks  5. V2 vs V3 (CHARX)  6. Writing tips  7. Exporting & sharing
(Full copy captured in `_analysis/` agent reports; reproduce verbatim where reasonable.)

## 12. Persistence
Original uses React Context only (no localStorage for WIP). **Candidate enhancement**:
add localStorage autosave/draft restore.

## 13. Known gaps / enhancement candidates
- CHARX (zip) read/write — menu exists but original does NOT implement it.
- localStorage drafts / multi-card library.
- Better token counter (original `Un` is a heuristic).
- Image cropping/resizing on avatar upload.

// Card validation — mirrors Chara Snap's severity model (error/warning/info).
// Issues carry a `code` (key into the i18n `validation` dict) so the UI can
// render messages in the active language.

import type { CharacterCard, ValidationIssue } from "./types";

export function validateCard(card: CharacterCard): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (
    field: string,
    code: string,
    severity: ValidationIssue["severity"],
    params?: Record<string, string | number>,
  ) => issues.push({ field, code, severity, params });

  if (!card.name?.trim()) push("name", "nameRequired", "error");
  if (!card.description?.trim())
    push("description", "descriptionEmpty", "warning");
  if (!card.first_mes?.trim())
    push("first_mes", "firstMesMissing", "warning");
  if (card.personality && card.personality.length > 4000)
    push("personality", "personalityLong", "info");

  if (card.alternate_greetings.some((g) => !g.trim()))
    push("alternate_greetings", "altGreetingsEmpty", "warning");
  if (card.group_only_greetings?.some((g) => !g.trim()))
    push("group_only_greetings", "groupGreetingsEmpty", "warning");

  if (card.creator_notes_multilingual) {
    for (const [lang, text] of Object.entries(card.creator_notes_multilingual)) {
      if (!lang.trim())
        push("creator_notes_multilingual", "emptyLangCode", "warning");
      if (!text.trim())
        push(`creator_notes_multilingual.${lang}`, "emptyTranslation", "warning");
    }
  }

  if (card.source?.some((s) => !s.trim()))
    push("source", "sourceEmpty", "warning");

  card.assets?.forEach((asset, idx) => {
    if (!asset.uri.trim())
      push(`assets.${idx}.uri`, "assetUriMissing", "warning", { n: idx + 1 });
    if (!asset.name.trim())
      push(`assets.${idx}.name`, "assetNameMissing", "info", { n: idx + 1 });
  });

  if (card.character_book) {
    const book = card.character_book;
    if (!book.entries.length && (book.name || book.description))
      push("character_book", "lorebookNoEntries", "info");
    book.entries.forEach((entry, i) => {
      const name = entry.name || `Entry ${i + 1}`;
      if (entry.keys.length === 0 || entry.keys.every((k) => !k.trim()))
        push(`lorebook.${name}`, "entryNoKeywords", "warning");
      if (!entry.content?.trim())
        push(`lorebook.${name}`, "entryNoContent", "warning");
    });
  }

  if (
    typeof card.creation_date === "number" &&
    typeof card.modification_date === "number" &&
    card.modification_date < card.creation_date
  )
    push("modification_date", "dateOrder", "warning");

  if (card.mes_example && !card.mes_example.includes("<START>"))
    push("mes_example", "mesExampleStart", "info");

  return issues;
}

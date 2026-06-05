// Card validation — mirrors Chara Snap's severity model (error/warning/info).

import type { CharacterCard, ValidationIssue } from "./types";

export function validateCard(card: CharacterCard): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (
    field: string,
    message: string,
    severity: ValidationIssue["severity"],
  ) => issues.push({ field, message, severity });

  if (!card.name?.trim()) push("name", "Name is required", "error");
  if (!card.description?.trim())
    push("description", "Description is empty", "warning");
  if (!card.first_mes?.trim())
    push(
      "first_mes",
      "First message is missing — most clients expect one",
      "warning",
    );
  if (card.personality && card.personality.length > 4000)
    push("personality", "Personality field is very long", "info");

  if (card.alternate_greetings.some((g) => !g.trim()))
    push(
      "alternate_greetings",
      "One or more alternate greetings are empty",
      "warning",
    );
  if (card.group_only_greetings?.some((g) => !g.trim()))
    push(
      "group_only_greetings",
      "One or more group-only greetings are empty",
      "warning",
    );

  if (card.creator_notes_multilingual) {
    for (const [lang, text] of Object.entries(card.creator_notes_multilingual)) {
      if (!lang.trim())
        push("creator_notes_multilingual", "Empty language code", "warning");
      if (!text.trim())
        push(
          `creator_notes_multilingual.${lang}`,
          "Empty translation",
          "warning",
        );
    }
  }

  if (card.source?.some((s) => !s.trim()))
    push("source", "One or more source links are empty", "warning");

  card.assets?.forEach((asset, idx) => {
    if (!asset.uri.trim())
      push(`assets.${idx}.uri`, `Asset ${idx + 1} is missing a URI`, "warning");
    if (!asset.name.trim())
      push(`assets.${idx}.name`, `Asset ${idx + 1} is missing a name`, "info");
  });

  if (card.character_book) {
    const book = card.character_book;
    if (!book.entries.length && (book.name || book.description))
      push(
        "character_book",
        "Lorebook metadata is set, but it has no entries",
        "info",
      );
    book.entries.forEach((entry, i) => {
      const name = entry.name || `Entry ${i + 1}`;
      if (entry.keys.length === 0 || entry.keys.every((k) => !k.trim()))
        push(`lorebook.${name}`, "Lorebook entry has no keywords", "warning");
      if (!entry.content?.trim())
        push(`lorebook.${name}`, "Lorebook entry has no content", "warning");
    });
  }

  if (
    typeof card.creation_date === "number" &&
    typeof card.modification_date === "number" &&
    card.modification_date < card.creation_date
  )
    push(
      "modification_date",
      "Modification date is earlier than creation date",
      "warning",
    );

  if (card.mes_example && !card.mes_example.includes("<START>"))
    push(
      "mes_example",
      "Message examples typically start with a <START> delimiter",
      "info",
    );

  return issues;
}

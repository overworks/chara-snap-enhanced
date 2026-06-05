// Lightweight token estimation. Not a real BPE tokenizer — a heuristic that
// approximates GPT-style counts well enough for budgeting (the original used a
// similar heuristic). ~ words + punctuation, with a chars/4 floor.

import type { CharacterCard } from "./types";

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const words = trimmed.split(/\s+/).length;
  const punctuation = (trimmed.match(/[.,!?;:'"()\[\]{}<>/\\|@#$%^&*=+~`-]/g) || [])
    .length;
  const byWords = Math.ceil(words * 1.3) + Math.ceil(punctuation * 0.5);
  const byChars = Math.ceil(trimmed.length / 4);
  return Math.max(byWords, byChars);
}

export interface TokenBreakdown {
  name: number;
  description: number;
  personality: number;
  scenario: number;
  first_mes: number;
  mes_example: number;
  system_prompt: number;
  post_history_instructions: number;
  creator_notes: number;
  alternate_greetings: number;
  lorebook: number;
  total: number;
}

export function countTokens(card: CharacterCard): TokenBreakdown {
  const b: Omit<TokenBreakdown, "total"> = {
    name: estimateTokens(card.name),
    description: estimateTokens(card.description),
    personality: estimateTokens(card.personality),
    scenario: estimateTokens(card.scenario),
    first_mes: estimateTokens(card.first_mes),
    mes_example: estimateTokens(card.mes_example),
    system_prompt: estimateTokens(card.system_prompt),
    post_history_instructions: estimateTokens(card.post_history_instructions),
    creator_notes: estimateTokens(card.creator_notes),
    alternate_greetings: card.alternate_greetings.reduce(
      (sum, g) => sum + estimateTokens(g),
      0,
    ),
    lorebook:
      card.character_book?.entries.reduce(
        (sum, e) => sum + estimateTokens(e.content),
        0,
      ) ?? 0,
  };
  const total = Object.values(b).reduce((a, c) => a + c, 0);
  return { ...b, total };
}

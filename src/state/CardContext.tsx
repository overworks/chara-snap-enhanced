import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CharacterCard, CardState } from "../lib/types";
import { newCardState } from "../lib/io";

interface CardContextValue {
  state: CardState;
  /** Replace the whole editor state (e.g. after importing a file). */
  setState: (state: CardState) => void;
  /** Shallow-merge fields into the card. */
  updateCard: (patch: Partial<CharacterCard>) => void;
  /** Functional update of the card. */
  mutateCard: (fn: (card: CharacterCard) => CharacterCard) => void;
  /** Set/clear the avatar image. */
  setAvatar: (pngBytes: Uint8Array | null, url: string | null) => void;
  /** Reset to a blank card. */
  reset: () => void;
}

const CardContext = createContext<CardContextValue | null>(null);

export function CardProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<CardState>(() => newCardState());

  const setState = useCallback((next: CardState) => setStateRaw(next), []);

  const updateCard = useCallback((patch: Partial<CharacterCard>) => {
    setStateRaw((s) => ({ ...s, card: { ...s.card, ...patch } }));
  }, []);

  const mutateCard = useCallback(
    (fn: (card: CharacterCard) => CharacterCard) => {
      setStateRaw((s) => ({ ...s, card: fn(s.card) }));
    },
    [],
  );

  const setAvatar = useCallback(
    (pngBytes: Uint8Array | null, url: string | null) => {
      setStateRaw((s) => ({ ...s, originalPngBytes: pngBytes, avatarUrl: url }));
    },
    [],
  );

  const reset = useCallback(() => setStateRaw(newCardState()), []);

  const value = useMemo(
    () => ({ state, setState, updateCard, mutateCard, setAvatar, reset }),
    [state, setState, updateCard, mutateCard, setAvatar, reset],
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCard(): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("useCard must be used within a CardProvider");
  return ctx;
}

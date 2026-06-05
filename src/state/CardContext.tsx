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
  /** Store or remove embedded CHARX asset bytes by zip path (pass null to delete). */
  setAssetBytes: (path: string, bytes: Uint8Array | null) => void;
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

  const setAssetBytes = useCallback(
    (path: string, bytes: Uint8Array | null) => {
      setStateRaw((s) => {
        const next = { ...s.assets };
        if (bytes) next[path] = bytes;
        else delete next[path];
        return { ...s, assets: next };
      });
    },
    [],
  );

  const reset = useCallback(() => setStateRaw(newCardState()), []);

  const value = useMemo(
    () => ({
      state,
      setState,
      updateCard,
      mutateCard,
      setAvatar,
      setAssetBytes,
      reset,
    }),
    [state, setState, updateCard, mutateCard, setAvatar, setAssetBytes, reset],
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCard(): CardContextValue {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error("useCard must be used within a CardProvider");
  return ctx;
}

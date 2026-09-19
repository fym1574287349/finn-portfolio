export const ROUND_MS = 60_000;
export const FLIP_BACK_MS = 850;
export const PAIRS = 6;

export type Card = { id: number; face: number };
export type GameState = {
  phase: 'ready' | 'playing' | 'won' | 'lost';
  deck: Card[];
  open: number[];
  matched: number[];
  deadline: number;
  seconds: number;
  resolveAt: number | null;
};
export type GameAction =
  | { type: 'start'; deck: Card[]; now: number }
  | { type: 'flip'; id: number; now: number }
  | { type: 'tick'; now: number };

export const initialGame: GameState = {
  phase: 'ready', deck: [], open: [], matched: [], deadline: 0, seconds: 60, resolveAt: null,
};

export function shuffleDeck(random = Math.random): Card[] {
  const cards = Array.from({ length: PAIRS * 2 }, (_, id) => ({ id, face: Math.floor(id / 2) + 1 }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

// All timing uses an absolute deadline so a background tab cannot extend a round.
export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'start') {
    return { ...initialGame, phase: 'playing', deck: action.deck, deadline: action.now + ROUND_MS };
  }
  if (state.phase !== 'playing') return state;
  const seconds = Math.max(0, Math.ceil((state.deadline - action.now) / 1000));
  if (seconds === 0) return { ...state, phase: 'lost', seconds: 0, open: [], resolveAt: null };
  let current = seconds === state.seconds ? state : { ...state, seconds };
  if (current.resolveAt !== null && action.now >= current.resolveAt) {
    current = { ...current, open: [], resolveAt: null };
  }
  if (action.type === 'tick') return current;
  const card = current.deck.find(item => item.id === action.id);
  if (!card || current.resolveAt !== null || current.open.includes(card.id) || current.matched.includes(card.id)) return current;
  if (current.open.length === 0) return { ...current, open: [card.id] };
  const first = current.deck.find(item => item.id === current.open[0])!;
  if (first.face === card.face) {
    const matched = [...current.matched, first.id, card.id];
    return { ...current, matched, open: [], phase: matched.length === PAIRS * 2 ? 'won' : 'playing' };
  }
  return { ...current, open: [first.id, card.id], resolveAt: action.now + FLIP_BACK_MS };
}

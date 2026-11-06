import { ComponentType, createContext, useContext } from 'react';

// swipe: false keeps the page from swiping away, for pages with their own horizontal gestures.
export type Page = { component: ComponentType; swipe?: boolean };

// Page dots live in each screen's header, so the pager only shares where it is.
// index is the page's own position; current is the page on screen.
// lockSwipe(true) pauses page swiping while a finger is on something that swipes sideways itself.
export const PagerContext = createContext<{
  index: number;
  current: number;
  count: number;
  goTo: (i: number) => void;
  lockSwipe: (locked: boolean) => void;
}>({
  index: 0,
  current: 0,
  count: 1,
  goTo: () => {},
  lockSwipe: () => {},
});

export const usePager = () => useContext(PagerContext);

import { useMemo, useState } from 'react';

import { Page, PagerContext } from './pager/context';

// Web preview only: react-native-pager-view has no web build, so pages switch via the dots.
export function Pager({ pages }: { pages: Page[] }) {
  const [index, setIndex] = useState(0);
  const ctx = useMemo(
    () => ({ index, current: index, count: pages.length, goTo: (i: number) => setIndex(Math.max(0, Math.min(pages.length - 1, i))), lockSwipe: () => {} }),
    [index, pages.length],
  );
  const Comp = pages[index].component;

  return (
    <PagerContext.Provider value={ctx}>
      <Comp />
    </PagerContext.Provider>
  );
}

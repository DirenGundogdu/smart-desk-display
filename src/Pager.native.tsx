import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import { Page, PagerContext } from './pager/context';

export function Pager({ pages }: { pages: Page[] }) {
  const ref = useRef<PagerView>(null);
  const [index, setIndex] = useState(0);
  const allowed = pages[index]?.swipe !== false;
  // Imperative so locking doesn't re-render every page mid-gesture.
  const lockSwipe = useCallback((locked: boolean) => ref.current?.setScrollEnabled(allowed && !locked), [allowed]);
  const ctx = useMemo(
    () => ({
      index,
      current: index,
      count: pages.length,
      goTo: (i: number) => ref.current?.setPage(Math.max(0, Math.min(pages.length - 1, i))),
      lockSwipe,
    }),
    [index, pages.length, lockSwipe],
  );

  return (
    <PagerContext.Provider value={ctx}>
      <PagerView
        ref={ref}
        style={styles.fill}
        initialPage={0}
        offscreenPageLimit={1}
        scrollEnabled={allowed}
        onPageSelected={(e) => setIndex(e.nativeEvent.position)}
      >
        {pages.map(({ component: Comp }, i) => (
          <View key={i} style={styles.fill} collapsable={false}>
            {/* Each page reads its own position for its label and dots. */}
            <PagerContext.Provider value={{ ...ctx, index: i }}>
              <Comp />
            </PagerContext.Provider>
          </View>
        ))}
      </PagerView>
    </PagerContext.Provider>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

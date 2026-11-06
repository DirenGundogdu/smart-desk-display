import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { DEFAULT_DESIGN } from './config';

export type Design = 'studio' | 'fieldnotes';

const KEY = 'design.v1';

const DesignContext = createContext<{ design: Design; toggle: () => void }>({ design: DEFAULT_DESIGN, toggle: () => {} });

// The chosen art direction; long-pressing a screen's label flips it, and the choice is remembered.
export function DesignProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<Design>(DEFAULT_DESIGN);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((d) => (d === 'studio' || d === 'fieldnotes') && setDesign(d));
  }, []);

  const toggle = () =>
    setDesign((d) => {
      const next = d === 'studio' ? 'fieldnotes' : 'studio';
      AsyncStorage.setItem(KEY, next);
      return next;
    });

  return <DesignContext.Provider value={{ design, toggle }}>{children}</DesignContext.Provider>;
}

export const useDesign = () => useContext(DesignContext);

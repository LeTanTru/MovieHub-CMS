'use client';

import { createContext, useContext } from 'react';

export type IndicatorAction = 'initial' | 'play-pause' | 'volume' | 'none';

export const IndicatorContext = createContext<{
  currentAction: IndicatorAction;
  setCurrentAction: (action: IndicatorAction) => void;
}>({
  currentAction: 'initial',
  setCurrentAction: () => {}
});

export const useIndicator = () => useContext(IndicatorContext);

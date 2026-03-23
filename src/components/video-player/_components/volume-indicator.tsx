'use client';

import { useIndicator } from '@/components/video-player/video-player';
import { useMediaState } from '@vidstack/react';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useReducer } from 'react';

type IndicatorState = {
  showIndicator: boolean;
};

type IndicatorAction = { type: 'show' } | { type: 'hide' };

const initialState: IndicatorState = {
  showIndicator: false
};

function indicatorReducer(
  state: IndicatorState,
  action: IndicatorAction
): IndicatorState {
  switch (action.type) {
    case 'show':
      return { showIndicator: true };
    case 'hide':
      return { ...state, showIndicator: false };
    default:
      return state;
  }
}

export default function VolumeIndicator() {
  const volume = useMediaState('volume');
  const [{ showIndicator }, dispatch] = useReducer(
    indicatorReducer,
    initialState
  );
  const { currentAction } = useIndicator();

  useEffect(() => {
    if (currentAction === 'initial' || currentAction === 'volume') {
      dispatch({ type: 'show' });

      const timeout = setTimeout(() => {
        dispatch({ type: 'hide' });
      }, 800);

      return () => clearTimeout(timeout);
    } else {
      dispatch({ type: 'hide' });
    }
  }, [volume, currentAction]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <m.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.4 }}
          transition={{
            opacity: { duration: 0.2 },
            scale: { duration: 0.2, ease: 'easeOut' }
          }}
          className={
            'pointer-events-none absolute inset-0 z-50 flex h-full items-center justify-center'
          }
        >
          <div className='flex aspect-video items-center justify-center gap-1 rounded-lg bg-black/60 px-4 py-2 text-base font-semibold text-white backdrop-blur-sm md:px-8 md:py-4 md:text-xl'>
            {Math.round(volume * 100)}%
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

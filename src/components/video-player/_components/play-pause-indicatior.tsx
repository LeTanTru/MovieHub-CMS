'use client';

import { useIndicator } from '@/components/video-player/video-player';
import { useMediaState } from '@vidstack/react';
import { PauseIcon, PlayIcon } from '@vidstack/react/icons';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useReducer } from 'react';

type IndicatorAction = 'play' | 'pause';

type IndicatorState = {
  showIndicator: boolean;
  lastAction: IndicatorAction;
};

type IndicatorReducerAction =
  | { type: 'show'; payload: IndicatorAction }
  | { type: 'hide' };

const initialState: IndicatorState = {
  showIndicator: false,
  lastAction: 'pause'
};

function indicatorReducer(
  state: IndicatorState,
  action: IndicatorReducerAction
): IndicatorState {
  switch (action.type) {
    case 'show':
      return {
        showIndicator: true,
        lastAction: action.payload
      };
    case 'hide':
      return {
        ...state,
        showIndicator: false
      };
    default:
      return state;
  }
}

export default function PlayPauseIndicator() {
  const isPaused = useMediaState('paused');
  const [{ showIndicator, lastAction }, dispatch] = useReducer(
    indicatorReducer,
    initialState
  );
  const { currentAction } = useIndicator();

  useEffect(() => {
    if (currentAction === 'initial' || currentAction === 'play-pause') {
      dispatch({ type: 'show', payload: isPaused ? 'pause' : 'play' });

      const timeout = setTimeout(() => {
        dispatch({ type: 'hide' });
      }, 800);

      return () => clearTimeout(timeout);
    } else {
      dispatch({ type: 'hide' });
    }
  }, [isPaused, currentAction]);

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
          className='pointer-events-none absolute inset-0 flex items-center justify-center'
        >
          <div className='rounded-full bg-black/60 p-4 backdrop-blur-sm md:p-6'>
            {lastAction === 'pause' ? (
              <PlayIcon className='h-8 w-8 fill-white md:h-12 md:w-12' />
            ) : (
              <PauseIcon className='h-8 w-8 fill-white md:h-12 md:w-12' />
            )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

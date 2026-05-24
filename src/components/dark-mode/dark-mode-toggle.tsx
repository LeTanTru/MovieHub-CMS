'use client';

import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useTheme } from 'next-themes';
import { useIsMounted } from '@/hooks';
import { AnimatePresence, m } from 'framer-motion';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();
  const isDark = theme === 'dark';

  if (!isMounted) return null;

  return (
    <Toggle
      variant='outline'
      className='group data-[state=on]:hover:bg-muted relative size-9 cursor-pointer border-none shadow-none data-[state=on]:bg-transparent'
      pressed={isDark}
      onPressedChange={() => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode='wait' initial={false}>
        {isDark ? (
          <m.div
            key='moon'
            initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className='absolute inset-0 flex items-center justify-center'
          >
            <Moon size={16} className='shrink-0' aria-hidden='true' />
          </m.div>
        ) : (
          <m.div
            key='sun'
            initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className='absolute inset-0 flex items-center justify-center'
          >
            <Sun size={16} className='shrink-0' aria-hidden='true' />
          </m.div>
        )}
      </AnimatePresence>
    </Toggle>
  );
}

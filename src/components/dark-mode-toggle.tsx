'use client';

import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useTheme } from 'next-themes';
import { useIsMounted } from '@/hooks';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div>
      <Toggle
        variant='outline'
        className='group data-[state=on]:hover:bg-muted size-9 cursor-pointer data-[state=on]:bg-transparent'
        pressed={theme === 'dark'}
        onPressedChange={() => {
          setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
        }}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <Moon
          size={16}
          className='shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:rotate-[720deg] group-data-[state=on]:opacity-100'
          aria-hidden='true'
        />
        <Sun
          size={16}
          className='absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0'
          aria-hidden='true'
        />
      </Toggle>
    </div>
  );
}

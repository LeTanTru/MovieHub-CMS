'use client';

import { cn } from '@/lib';
import type { ReactNode } from 'react';

type FieldSetProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export default function FieldSet({
  title,
  description,
  children,
  className = ''
}: FieldSetProps) {
  return (
    <fieldset
      className={cn(
        'mb-4 rounded-md border border-gray-200 p-4 dark:border-gray-700',
        className
      )}
    >
      {title && (
        <legend className='px-2 text-base font-semibold text-gray-800 dark:text-gray-100'>
          {title}
        </legend>
      )}

      {description && (
        <p className='mb-3 text-sm text-gray-500 dark:text-gray-400'>
          {description}
        </p>
      )}

      <div className='space-y-3'>{children}</div>
    </fieldset>
  );
}

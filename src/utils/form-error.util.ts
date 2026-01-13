import type { ErrorMaps } from '@/types';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

export const applyFormErrors = <TFields extends FieldValues>(
  form: UseFormReturn<TFields>,
  code: string,
  errorMaps: ErrorMaps<TFields>
) => {
  const errors = errorMaps[code];
  if (!errors) return;

  for (const [field, error] of errors) {
    form.setError(field, error);
  }
};

import type { ErrorMaps } from '@/types';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * @param form The react-hook-form instance
 * @param code The error code returned from the API
 * @param errorMaps The mapping of error codes to field errors
 */
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

import type { FieldValues, Path } from 'react-hook-form';

export type FieldError = { type: string; message: string };

export type ErrorMaps<TFields extends FieldValues> = Record<
  string,
  Array<[Path<TFields>, FieldError]>
>;

import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType } from 'zod';
import {
  DefaultValues,
  FieldValues,
  useForm,
  useFormState,
  type Resolver
} from 'react-hook-form';

/**
 * Hook to initialize react-hook-form with Zod validation.
 *
 * @param params - The configuration options for the form hook.
 * @param params.schema - The Zod schema to validate form values.
 * @param params.defaultValues - The initial values for the form fields.
 * @param params.mode - The validation mode (defaults to 'onChange').
 */
export const useBaseForm = <T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange'
}: {
  schema: ZodType;
  defaultValues: DefaultValues<T>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}) => {
  const form = useForm<T>({
    resolver: zodResolver(
      schema as unknown as ZodType<T, T>
    ) as unknown as Resolver<T, unknown, T>,
    defaultValues,
    mode
  });

  const formState = useFormState({ control: form.control });

  return { ...form, formState };
};

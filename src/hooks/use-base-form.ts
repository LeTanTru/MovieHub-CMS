import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodTypeAny, ZodType } from 'zod';
import {
  DefaultValues,
  FieldValues,
  useForm,
  useFormState,
  type Resolver
} from 'react-hook-form';

export const useBaseForm = <T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange'
}: {
  schema: ZodTypeAny;
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

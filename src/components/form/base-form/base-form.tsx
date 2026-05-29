'use client';

import { Form } from '@/components/ui/form';
import { cn } from '@/lib';
import { logger } from '@/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type FormHTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect
} from 'react';
import type { ZodObject, ZodType } from 'zod';
import {
  type DefaultValues,
  useForm,
  type UseFormReturn,
  useFormState,
  type FieldValues,
  type Resolver
} from 'react-hook-form';

type BaseFormProps<T extends FieldValues> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'children' | 'onSubmit'
> & {
  ref?: Ref<HTMLFormElement>;
  defaultValues: DefaultValues<T>;
  initialValues?: T;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  schema: ZodObject;
  children?: (methods: UseFormReturn<T>) => ReactNode;
  onSubmit: (values: T, form: UseFormReturn<T>) => Promise<void> | void;
  onFormChange?: (isFormChanged: boolean) => void;
};

export function BaseForm<T extends FieldValues>({
  className,
  defaultValues,
  id,
  initialValues,
  mode = 'onChange',
  ref,
  schema,
  children,
  onSubmit,
  onFormChange,
  ...rest
}: BaseFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(
      schema as unknown as ZodType<T, T>
    ) as unknown as Resolver<T, unknown, T>,
    defaultValues,
    mode,
    shouldFocusError: false
  });

  const formState = useFormState({ control: form.control });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  if (Object.keys(formState.errors).length) {
    logger.info('BaseForm ~ form:', formState.errors);
    logger.info('BaseForm ~ form:', form.getValues());
  }

  const enhancedForm = {
    ...form,
    formState
  };

  useEffect(() => {
    onFormChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onFormChange]);

  return (
    <Form {...form}>
      <form
        ref={ref}
        id={id}
        className={cn('relative rounded-lg bg-white p-4', className)}
        onSubmit={form.handleSubmit((values) => onSubmit(values, enhancedForm))}
        {...rest}
      >
        {children?.(enhancedForm as UseFormReturn<T>)}
      </form>
    </Form>
  );
}

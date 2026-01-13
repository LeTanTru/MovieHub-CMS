'use client';

import { Form } from '@/components/ui/form';
import { cn } from '@/lib';
import { logger } from '@/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, type Ref, useEffect } from 'react';
import {
  type DefaultValues,
  useForm,
  type UseFormReturn,
  useFormState
} from 'react-hook-form';

type AsyncDefaultValues<T> = (payload?: unknown) => Promise<T>;

type BaseFormProps<T extends Record<string, any>> = {
  schema: any;
  defaultValues: DefaultValues<T> | AsyncDefaultValues<T>;
  onSubmit: (values: T, form: UseFormReturn<T>) => Promise<void> | void;
  children?: (methods: UseFormReturn<T>) => ReactNode;
  className?: string;
  initialValues?: T;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  id?: string;
  onChange?: () => void;
  ref?: Ref<HTMLFormElement> | undefined;
};

export default function BaseForm<T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  initialValues,
  mode = 'onChange',
  onChange,
  id,
  ref
}: BaseFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
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

  return (
    <Form {...form}>
      <form
        ref={ref}
        id={id}
        className={cn('relative rounded-lg bg-white p-4', className)}
        onSubmit={form.handleSubmit((values) => onSubmit(values, form))}
        onChange={onChange}
      >
        {children?.(enhancedForm as UseFormReturn<T>)}
      </form>
    </Form>
  );
}

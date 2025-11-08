'use client';

import { Form } from '@/components/ui/form';
import { cn } from '@/lib';
import { logger } from '@/logger';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { DefaultValues, useForm, UseFormReturn } from 'react-hook-form';

type AsyncDefaultValues<T> = (payload?: unknown) => Promise<T>;

type BaseFormProps<T extends Record<string, any>> = {
  schema: any;
  defaultValues: DefaultValues<T> | AsyncDefaultValues<T>;
  onSubmit: (values: T, form: UseFormReturn<T>) => Promise<void> | void;
  children?: (methods: UseFormReturn<T>) => React.ReactNode;
  className?: string;
  initialValues?: T;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all' | undefined;
  onChange?: () => void;
};

export default function BaseForm<T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  initialValues,
  mode = 'onChange',
  onChange
}: BaseFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);
  logger.info('BaseForm ~ form:', form.formState.errors);

  return (
    <Form {...form}>
      <form
        className={cn(
          'relative w-4/5 rounded-lg bg-white p-4 max-[1560px]:w-full',
          className
        )}
        onSubmit={form.handleSubmit((values) => onSubmit(values, form))}
        onChange={onChange}
      >
        {children?.(form)}
      </form>
    </Form>
  );
}

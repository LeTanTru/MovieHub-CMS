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
import {
  type DefaultValues,
  useForm,
  type UseFormReturn,
  useFormState
} from 'react-hook-form';

type BaseFormProps<T extends Record<string, any>> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'children' | 'onSubmit'
> & {
  ref?: Ref<HTMLFormElement>;
  defaultValues: DefaultValues<T>;
  initialValues?: T;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  schema: any;
  children?: (methods: UseFormReturn<T>) => ReactNode;
  onSubmit: (values: T, form: UseFormReturn<T>) => Promise<void> | void;
  onFormChange?: (isFormChanged: boolean) => void;
};

export const BaseForm = <T extends Record<string, any>>({
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
}: BaseFormProps<T>) => {
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
};

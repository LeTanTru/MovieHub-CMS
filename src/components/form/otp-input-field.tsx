'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

type OtpInputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  length?: number;
  required?: boolean;
  className?: string;
  formItemClassName?: string;
  containerClassName?: string;
  groupClassName?: string;
  labelClassName?: string;
  description?: React.ReactNode;
};

export default function OtpInputField<T extends FieldValues>({
  control,
  name,
  label,
  length = 6,
  required,
  className,
  formItemClassName,
  containerClassName,
  groupClassName,
  labelClassName,
  description
}: OtpInputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            'relative flex flex-col items-center',
            formItemClassName
          )}
        >
          {label && (
            <FormLabel className={cn('mb-2', labelClassName)}>
              {label}
              {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div>
              <InputOTP
                maxLength={length}
                pattern={REGEXP_ONLY_DIGITS}
                {...field}
                className={cn('flex justify-center', className)}
                containerClassName={cn('w-full', containerClassName)}
              >
                <InputOTPGroup
                  className={cn(
                    'w-full justify-center gap-x-2',
                    groupClassName
                  )}
                >
                  {Array.from({ length: length }).map((_, i) => (
                    <InputOTPSlot
                      className={cn(
                        'data-[active=true]:ring-green-primary h-12 w-12 rounded-md border-l text-base duration-200 ease-linear data-[active=true]:border-none data-[active=true]:ring-2',
                        {
                          'border-red-500 data-[active=true]:ring-red-500':
                            !!fieldState.error
                        }
                      )}
                      key={i}
                      index={i}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {description && (
                <FormDescription className='text-center'>
                  {description}
                </FormDescription>
              )}
              {fieldState.error && (
                <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end justify-center'>
                  <FormMessage className='leading-5.5' />
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

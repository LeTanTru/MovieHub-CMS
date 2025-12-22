'use client';

import { Button } from '@/components/form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

type InputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  type?: string;
  className?: string;
  formItemClassName?: string;
  required?: boolean;
  labelClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
};

export default function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'password',
  className,
  formItemClassName,
  required,
  labelClassName,
  disabled,
  readOnly = false
}: InputFieldProps<T>) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: 'Ít nhất 8 ký tự' },
      { regex: /[0-9]/, text: 'Ít nhất 1 số' },
      { regex: /[a-z]/, text: 'Ít nhất 1 chữ cái thường' },
      { regex: /[A-Z]/, text: 'Ít nhất 1 chữ cái hoa' }
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text
    }));
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value || '';

        const strength = checkStrength(value);
        const strengthScore = strength.filter((req) => req.met).length;

        return (
          <FormItem
            className={cn(
              { 'cursor-not-allowed': disabled },
              formItemClassName
            )}
          >
            {label && (
              <FormLabel
                className={cn('ml-2 gap-1.5', labelClassName, {
                  'opacity-50 select-none': disabled
                })}
              >
                {label}
                {required && <span className='text-destructive'>*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className='relative'>
                <Input
                  placeholder={placeholder}
                  type={isVisible ? 'text' : type}
                  disabled={disabled}
                  readOnly={readOnly}
                  autoFocus={false}
                  autoComplete='off'
                  {...field}
                  value={value}
                  style={{ paddingTop: 0 }}
                  className={cn(
                    className,
                    'pb-0 leading-9 shadow-none placeholder:text-gray-300 focus-visible:ring-2',
                    {
                      'cursor-not-allowed': disabled
                    },
                    {
                      'cursor-not-allowed': disabled,
                      'border-red-500 focus-visible:border-red-500 focus-visible:ring-[1px] focus-visible:ring-red-500':
                        !!fieldState.error
                    },
                    !fieldState.error &&
                      'focus-visible:ring-dodger-blue focus-visible:border-transparent',
                    {
                      'pt-0! pb-0!': !value
                    }
                  )}
                />
                <Button
                  variant='ghost'
                  className='text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none hover:bg-transparent! focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                  type='button'
                  onClick={toggleVisibility}
                  aria-label={isVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isVisible}
                  aria-controls='password'
                  tabIndex={-1}
                >
                  {isVisible ? (
                    <EyeOffIcon size={16} aria-hidden='true' />
                  ) : (
                    <EyeIcon size={16} aria-hidden='true' />
                  )}
                </Button>
                {fieldState.error && (
                  <div className='animate-in fade-in absolute -bottom-6 left-2 z-0 mt-1 text-sm text-red-500'>
                    <FormMessage />
                  </div>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}

            {/* Strength bar */}
            {/* <div
              className='bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full'
              role='progressbar'
              aria-valuenow={strengthScore}
              aria-valuemin={0}
              aria-valuemax={4}
              aria-label='Password strength'
            >
              <div
                className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                style={{ width: `${(strengthScore / 4) * 100}%` }}
              ></div>
            </div>

            <p
              id={`${id}-description`}
              className='text-foreground mb-2 text-sm font-medium'
            >
              {getStrengthText(strengthScore)}. Phải chứa:
            </p>

            <List className='space-y-1.5' aria-label='Password requirements'>
              {strength.map((req, index) => (
                <ListItem key={index} className='flex items-center gap-1'>
                  {req.met ? (
                    <CheckIcon
                      size={16}
                      className='text-emerald-500'
                      aria-hidden='true'
                    />
                  ) : (
                    <XIcon
                      size={16}
                      className='text-muted-foreground/80'
                      aria-hidden='true'
                    />
                  )}
                  <span
                    className={`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`}
                  >
                    {req.text}
                    <span className='sr-only'>
                      {req.met
                        ? ' - Requirement met'
                        : ' - Requirement not met'}
                    </span>
                  </span>
                </ListItem>
              ))}
            </List> */}
          </FormItem>
        );
      }}
    />
  );
}

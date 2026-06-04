'use client';

import { Button } from '@/components/form';
import { List, ListItem } from '@/components/list';
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
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react';
import { useId, useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_SCORE = 4;

type PasswordFieldProps<T extends FieldValues> = {
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
  showStrength?: boolean;
};

const getStrengthColor = (score: number): string => {
  if (score === 0) return 'bg-gray-200';
  if (score <= 1) return 'bg-rose-500';
  if (score <= 2) return 'bg-orange-500';
  if (score <= 3) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

const getStrengthText = (score: number): string => {
  if (score === 0) return 'Nhập mật khẩu';
  if (score <= 1) return 'Mật khẩu yếu';
  if (score <= 2) return 'Mật khẩu trung bình';
  if (score <= 3) return 'Mật khẩu khá';
  return 'Mật khẩu mạnh';
};

export function PasswordField<T extends FieldValues>({
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
  readOnly = false,
  showStrength = false
}: PasswordFieldProps<T>) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      {
        regex: new RegExp(`.{${PASSWORD_MIN_LENGTH},}`),
        text: `Ít nhất ${PASSWORD_MIN_LENGTH} ký tự`
      },
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
              'relative',
              { 'cursor-not-allowed select-none': disabled },
              formItemClassName
            )}
          >
            {label && (
              <FormLabel
                className={cn('ml-2', labelClassName, {
                  'pointer-events-none opacity-50 select-none': disabled
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
                  autoComplete='off'
                  {...field}
                  value={value}
                  className={cn(
                    'text-sm shadow-none placeholder:text-gray-300 focus-visible:border-transparent focus-visible:ring-2 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none',
                    {
                      'border-rose-500 focus-visible:ring-rose-500':
                        !!fieldState.error,
                      'focus-visible:ring-sporty-blue': !fieldState.error,
                      'pb-0.5': !isVisible && !!field.value, // not show and have value
                      'pb-1': (!isVisible && !field.value) || isVisible, // not show and no value
                      'pb-1.25': isVisible && !!field.value
                    },
                    className
                  )}
                />
                <Button
                  variant='ghost'
                  className='text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 mr-0.75 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none hover:bg-transparent! focus:z-10 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
                  type='button'
                  onClick={toggleVisibility}
                  aria-label={isVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isVisible}
                  aria-controls='password'
                  tabIndex={-1}
                  disabled={disabled || readOnly}
                >
                  {isVisible ? (
                    <EyeOffIcon size={16} aria-hidden='true' />
                  ) : (
                    <EyeIcon size={16} aria-hidden='true' />
                  )}
                </Button>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                {fieldState.error && (
                  <div className='animate-in fade-in -mb-6 ml-2 flex min-h-6 items-end'>
                    <FormMessage className='leading-5.5' />
                  </div>
                )}
              </div>
            </FormControl>

            {showStrength && value && (
              <>
                {/* Strength bar */}
                <div
                  className='bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full'
                  role='progressbar'
                  aria-valuenow={strengthScore}
                  aria-valuemin={0}
                  aria-valuemax={PASSWORD_MAX_SCORE}
                  aria-label='Password strength'
                >
                  <div
                    className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                    style={{
                      width: `${(strengthScore / PASSWORD_MAX_SCORE) * 100}%`
                    }}
                  ></div>
                </div>

                <p
                  id={`${id}-description`}
                  className='text-foreground mb-2 text-sm font-medium'
                >
                  {getStrengthText(strengthScore)}. Phải chứa:
                </p>

                <List
                  className='space-y-1.5'
                  aria-label='Password requirements'
                >
                  {strength.map((req) => (
                    <ListItem
                      key={req.text}
                      className='flex items-center gap-2'
                    >
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
                </List>
              </>
            )}
          </FormItem>
        );
      }}
    />
  );
}

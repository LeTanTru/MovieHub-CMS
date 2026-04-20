'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

type SliderFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  className?: string;
  formItemClassName?: string;
  required?: boolean;
  labelClassName?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  showValue?: boolean;
  description?: string;
  unit?: string;
  showUnit?: boolean;
  step?: number;
  markers?: (number | string)[];
};

export default function SliderField<T extends FieldValues>({
  control,
  name,
  label,
  className,
  formItemClassName,
  required,
  labelClassName,
  disabled,
  min = 0,
  max = 100,
  trackClassName,
  rangeClassName,
  thumbClassName,
  showValue = true,
  description,
  unit,
  showUnit = true,
  step = 1,
  markers
}: SliderFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <FormItem
            className={cn(
              { 'cursor-not-allowed select-none': disabled },
              formItemClassName
            )}
          >
            <div className='flex items-center justify-between'>
              {label && (
                <FormLabel
                  className={cn(labelClassName, {
                    'opacity-50 select-none': disabled
                  })}
                >
                  {label}
                  {required && <span className='text-destructive'>*</span>}
                </FormLabel>
              )}
              {showValue && (
                <span>
                  {markers && markers.length ? (
                    markers[field.value - 1]
                  ) : (
                    <>{field.value}</>
                  )}
                  {showUnit && unit}
                </span>
              )}
            </div>
            <FormControl>
              <div className='relative'>
                <div className='flex items-center gap-2'>
                  <Slider
                    className={cn(
                      'cursor-pointer transition-all duration-200 ease-linear',
                      className
                    )}
                    step={step}
                    min={min}
                    max={max}
                    onValueChange={(e) => field.onChange(e[0])}
                    value={[field.value ?? 0]}
                    rangeClassName={cn('bg-golden-glow', rangeClassName)}
                    thumbClassName={cn('bg-white', thumbClassName)}
                    trackClassName={cn('bg-charade', trackClassName)}
                  />
                </div>
                {markers && (
                  <div className='text-muted-foreground -mx-1.5 mt-2 flex items-center justify-between text-xs'>
                    {markers.map((marker) => (
                      <span key={marker}>
                        {typeof marker === 'string'
                          ? marker
                          : `${marker}${unit}`}
                      </span>
                    ))}
                  </div>
                )}
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                {fieldState.error && (
                  <div className='animate-in fade-in -mb-6 flex min-h-6 items-end'>
                    <FormMessage className='leading-5.5' />
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}

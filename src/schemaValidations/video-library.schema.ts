import { VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL } from '@/constants';
import { z } from 'zod';

export const videoLibrarySchema = z
  .object({
    content: z.string().nonempty('Bắt buộc'),
    description: z.string().nonempty('Bắt buộc'),
    introEnd: z.union([z.string(), z.number()]).nullable().optional(),
    introStart: z.union([z.string(), z.number()]).nullable().optional(),
    outroStart: z.union([z.string(), z.number()]).nullable().optional(),
    name: z.string().nonempty('Bắt buộc'),
    status: z.number({ error: 'Bắt buộc' }),
    thumbnailUrl: z.string().nonempty('Bắt buộc'),
    sourceType: z.number({ error: 'Bắt buộc' }),
    duration: z.union([z.string(), z.number()]).nullable().optional(),
    vttUrl: z.string().optional().nullable(),
    spriteUrl: z.string().optional().nullable()
  })
  .superRefine((data, ctx) => {
    // URL validation regex
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

    const isValidUrl = (value: string | null | undefined): boolean => {
      if (!value) return true; // Empty is okay, handled by nonempty()
      return urlRegex.test(value);
    };

    // Validate URL fields when sourceType is EXTERNAL (2)
    const isExternalSource =
      data.sourceType === VIDEO_LIBRARY_SOURCE_TYPE_EXTERNAL;

    if (!isExternalSource) return;

    // content is required and must be a valid URL
    if (data.content && !isValidUrl(data.content)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đường dẫn video không hợp lệ',
        path: ['content']
      });
    }

    // vttUrl validation (optional but must be valid if provided)
    if (data.vttUrl && !isValidUrl(data.vttUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đường dẫn VTT không hợp lệ',
        path: ['vttUrl']
      });
    }

    // spriteUrl validation (optional but must be valid if provided)
    if (data.spriteUrl && !isValidUrl(data.spriteUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đường dẫn sprite không hợp lệ',
        path: ['spriteUrl']
      });
    }

    // Helper function to convert time to seconds
    const toSeconds = (value: string | number | null | undefined): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        if (value === '00:00:00' || value === '') return 0;
        // Handle HH:MM:SS format
        const parts = value.split(':').map(Number);
        if (parts.length === 3) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      }
      return 0;
    };

    const introStartSec = toSeconds(data.introStart);
    const introEndSec = toSeconds(data.introEnd);
    const outroStartSec = toSeconds(data.outroStart);
    const durationSec = toSeconds(data.duration);

    const hasIntroStart = introStartSec > 0;
    const hasIntroEnd = introEndSec > 0;
    const hasOutroStart = outroStartSec > 0;
    const hasDuration = durationSec > 0;

    // Rule 0: duration is required when sourceType is EXTERNAL
    if (isExternalSource && !hasDuration) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc',
        path: ['duration']
      });
    }

    // Rule 1: introStart < introEnd
    // Error on BOTH fields if invalid, so fixing either one will clear both
    if (hasIntroStart && hasIntroEnd && introStartSec >= introEndSec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Thời gian bắt đầu intro phải nhỏ hơn thời gian kết thúc intro',
        path: ['introStart']
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Thời gian kết thúc intro phải lớn hơn thời gian bắt đầu intro',
        path: ['introEnd']
      });
    }

    // Rule 2: introStart < duration
    if (hasDuration && hasIntroStart && introStartSec >= durationSec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu intro phải nhỏ hơn thời lượng video',
        path: ['introStart']
      });
    }

    // Rule 3: introEnd < duration
    if (hasDuration && hasIntroEnd && introEndSec >= durationSec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc intro phải nhỏ hơn thời lượng video',
        path: ['introEnd']
      });
    }

    // Rule 4: outroStart > introEnd
    // Error on BOTH fields if invalid
    if (hasIntroEnd && hasOutroStart && outroStartSec <= introEndSec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Thời gian bắt đầu outro phải lớn hơn thời gian kết thúc intro',
        path: ['outroStart']
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Thời gian kết thúc intro phải nhỏ hơn thời gian bắt đầu outro',
        path: ['introEnd']
      });
    }

    // Rule 5: outroStart < duration
    if (hasDuration && hasOutroStart && outroStartSec >= durationSec) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu outro phải nhỏ hơn thời lượng video',
        path: ['outroStart']
      });
    }
  });

export const retryProcessVideoLibrarySchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  content: z.string().nonempty('Bắt buộc')
});

export const videoLibrarySearchSchema = z.object({
  name: z.string().optional().nullable(),
  state: z.number().optional().nullable(),
  sourceType: z.number().optional().nullable(),
  serverConfigId: z.string().optional().nullable()
});

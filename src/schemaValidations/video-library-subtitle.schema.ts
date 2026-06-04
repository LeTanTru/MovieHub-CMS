import { isValidClockTime, timeToSeconds } from '@/utils';
import z from 'zod';

export const videoLibrarySubtitleSearchSchema = z.object({
  videoLibraryId: z.string().nonempty('Bắt buộc'),
  language: z.string().optional().nullable()
});

export const videoLibrarySubtitleTranslateSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  label: z.string().nonempty('Bắt buộc'),
  language: z.string().nonempty('Bắt buộc')
});

export const videoLibrarySubtitleSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  isDefault: z.boolean().default(false),
  label: z.string().nonempty('Bắt buộc')
});

export const subtitleSchema = z
  .object({
    start: z.string().nonempty('Bắt buộc'),
    end: z.string().nonempty('Bắt buộc'),
    text: z.string().nonempty('Bắt buộc')
  })
  .superRefine(({ start, end }, ctx) => {
    const isValidStart = isValidClockTime(start);
    const isValidEnd = isValidClockTime(end);

    if (start && !isValidStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu không hợp lệ',
        path: ['start']
      });
    }

    if (end && !isValidEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc không hợp lệ',
        path: ['end']
      });
    }

    if (!isValidStart || !isValidEnd) return;

    const startTime = timeToSeconds(start);
    const endTime = timeToSeconds(end);

    const hasStartTime = !!start;
    const hasEndTime = !!end;

    // startTime < endTime
    if (hasStartTime && hasEndTime && startTime >= endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
        path: ['start']
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu',
        path: ['end']
      });
    }
  });

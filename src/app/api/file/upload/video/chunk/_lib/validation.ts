import { HttpStatusCode } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UPLOAD_FOLDER, UPLOAD_PREFIX } from '@/lib/s3';

const KILOBYTE = 1024;
const MEGABYTE = 1024 * KILOBYTE;
const GIGABYTE = 1024 * MEGABYTE;
const MAX_FILE_SIZE = 5 * GIGABYTE;
const MIN_PART_NUMBER = 1;
const MAX_PART_NUMBER = 10000;
const MAX_FILE_NAME_LENGTH = 255;
const MAX_UPLOAD_ID_LENGTH = 2048;
const MAX_ETAG_LENGTH = 128;
const allowedVideoMimeTypes = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/ogg'
] as const;
const allowedExtensions = ['mp4', 'mov', 'webm', 'ogg'] as const;
const escapedUploadFolder = String(UPLOAD_FOLDER || '').replace(
  /[.*+?^${}()|[\]\\]/g,
  '\\$&'
);
const escapedUploadPrefix = String(UPLOAD_PREFIX || '').replace(
  /[.*+?^${}()|[\]\\]/g,
  '\\$&'
);
const objectNamePattern = new RegExp(
  `^${escapedUploadFolder}/${escapedUploadPrefix}_[a-f0-9]{20}\\.(${allowedExtensions.join('|')})$`
);

const uploadIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_UPLOAD_ID_LENGTH)
  .regex(/^[A-Za-z0-9+/=_-]+$/);

const objectNameSchema = z.string().trim().min(1).regex(objectNamePattern);

const partNumberSchema = z
  .number()
  .int()
  .min(MIN_PART_NUMBER)
  .max(MAX_PART_NUMBER);

const etagSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_ETAG_LENGTH)
  .regex(/^[A-Za-z0-9-]+$/);

export const initMultipartUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(MAX_FILE_NAME_LENGTH),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE),
  mimeType: z.enum(allowedVideoMimeTypes)
});

export const presignMultipartUploadSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema,
  partNumber: partNumberSchema
});

export const completeMultipartUploadSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema,
  parts: z
    .array(
      z.object({
        partNumber: partNumberSchema,
        etag: etagSchema
      })
    )
    .min(1)
    .max(MAX_PART_NUMBER)
    .superRefine((parts, ctx) => {
      const seen = new Set<number>();

      parts.forEach((part, index) => {
        if (seen.has(part.partNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Duplicate partNumber is not allowed',
            path: [index, 'partNumber']
          });
          return;
        }

        seen.add(part.partNumber);

        if (index > 0 && part.partNumber <= parts[index - 1].partNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Parts must be sorted by partNumber in ascending order',
            path: [index, 'partNumber']
          });
        }
      });
    })
});

export const abortMultipartUploadSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema
});

export const parseRequestBody = async <T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<
  { success: true; data: T } | { success: false; response: NextResponse }
> => {
  const body = await req.json().catch(() => null);

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          message: 'Invalid request payload',
          errors: parsed.error.flatten().fieldErrors
        },
        { status: HttpStatusCode.BadRequest }
      )
    };
  }

  return {
    success: true,
    data: parsed.data
  };
};

export const getVideoExtensionFromMimeType = (
  mimeType: (typeof allowedVideoMimeTypes)[number]
) => {
  switch (mimeType) {
    case 'video/quicktime':
      return 'mov';
    case 'video/webm':
      return 'webm';
    case 'video/ogg':
      return 'ogg';
    default:
      return 'mp4';
  }
};

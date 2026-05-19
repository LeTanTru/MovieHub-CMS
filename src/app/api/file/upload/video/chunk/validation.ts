import { z } from 'zod';

// S3 key: allow alphanumeric, hyphens, underscores, dots, forward slashes
// Reject path traversal patterns (.., //, leading /)
const S3_KEY_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_\-/.]*$/;
const S3_KEY_MAX_LENGTH = 1024;

// S3 ETag: hex string optionally wrapped in quotes (for multipart uploads)
const ETAG_PATTERN = /^"?[a-f0-9]{32,}"?$/i;

// Max number of parts in a multipart upload (S3 limit)
const MAX_PART_NUMBER = 10000;

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/ogg',
  'video/x-msvideo',
  'video/x-matroska'
];

export const objectNameSchema = z
  .string()
  .min(1, 'objectName is required')
  .max(
    S3_KEY_MAX_LENGTH,
    `objectName must be <= ${S3_KEY_MAX_LENGTH} characters`
  )
  .regex(S3_KEY_PATTERN, 'objectName contains invalid characters')
  .refine(
    (val) => !val.includes('..'),
    'objectName must not contain path traversal sequences'
  );

export const uploadIdSchema = z.string().min(1, 'uploadId is required');

export const partNumberSchema = z
  .number()
  .int('partNumber must be an integer')
  .min(1, 'partNumber must be >= 1')
  .max(MAX_PART_NUMBER, `partNumber must be <= ${MAX_PART_NUMBER}`);

export const etagSchema = z
  .string()
  .min(1, 'etag is required')
  .regex(ETAG_PATTERN, 'etag must be a valid hex string');

export const presignSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema,
  partNumber: partNumberSchema
});

export const completeSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema,
  parts: z
    .array(
      z.object({
        partNumber: partNumberSchema,
        etag: etagSchema
      })
    )
    .min(1, 'parts array must not be empty')
    .max(MAX_PART_NUMBER, `parts array must be <= ${MAX_PART_NUMBER}`)
    .refine(
      (parts) => {
        const seen = new Set<number>();
        for (const p of parts) {
          if (seen.has(p.partNumber)) {
            return false;
          }
          seen.add(p.partNumber);
        }
        return true;
      },
      { message: 'parts must not contain duplicate partNumbers' }
    )
});

export const abortSchema = z.object({
  objectName: objectNameSchema,
  uploadId: uploadIdSchema
});

export const initSchema = z.object({
  mimeType: z
    .string()
    .min(1, 'mimeType is required')
    .refine(
      (val) => ALLOWED_VIDEO_TYPES.includes(val),
      'mimeType must be a supported video format'
    )
});

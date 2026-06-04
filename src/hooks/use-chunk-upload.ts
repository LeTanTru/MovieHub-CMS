import { apiConfig } from '@/constants';
import { logger } from '@/logger';
import { http } from '@/utils';
import { useState, useCallback } from 'react';

const MEGABYTE = 1024 ** 2;
const GIGABYTE = 1024 ** 3;
const PERCENTAGE_MULTIPLIER = 100;

const CHUNK_UPLOAD_SMALL_FILE_LIMIT = 100 * MEGABYTE;
const CHUNK_UPLOAD_MEDIUM_FILE_LIMIT = 500 * MEGABYTE;
const CHUNK_UPLOAD_LARGE_FILE_LIMIT = 1.5 * GIGABYTE;

const CHUNK_UPLOAD_SMALL_SIZE = 6 * MEGABYTE;
const CHUNK_UPLOAD_MEDIUM_SIZE = 8 * MEGABYTE;
const CHUNK_UPLOAD_LARGE_SIZE = 16 * MEGABYTE;
const CHUNK_UPLOAD_XL_SIZE = 32 * MEGABYTE;

const CHUNK_UPLOAD_SMALL_CONCURRENCY = 3;
const CHUNK_UPLOAD_MEDIUM_CONCURRENCY = 6;
const CHUNK_UPLOAD_LARGE_CONCURRENCY = 9;
const CHUNK_UPLOAD_XL_CONCURRENCY = 12;

function getChunkConfig(fileSize: number) {
  if (fileSize < CHUNK_UPLOAD_SMALL_FILE_LIMIT) {
    return {
      chunkSize: CHUNK_UPLOAD_SMALL_SIZE,
      concurrency: CHUNK_UPLOAD_SMALL_CONCURRENCY
    };
  }
  if (fileSize < CHUNK_UPLOAD_MEDIUM_FILE_LIMIT) {
    return {
      chunkSize: CHUNK_UPLOAD_MEDIUM_SIZE,
      concurrency: CHUNK_UPLOAD_MEDIUM_CONCURRENCY
    };
  }
  if (fileSize < CHUNK_UPLOAD_LARGE_FILE_LIMIT) {
    return {
      chunkSize: CHUNK_UPLOAD_LARGE_SIZE,
      concurrency: CHUNK_UPLOAD_LARGE_CONCURRENCY
    };
  }
  return {
    chunkSize: CHUNK_UPLOAD_XL_SIZE,
    concurrency: CHUNK_UPLOAD_XL_CONCURRENCY
  };
}

type Part = {
  partNumber: number;
  etag: string;
};

export const useChunkUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<string> => {
      setUploading(true);
      setProgress(0);

      const { chunkSize, concurrency } = getChunkConfig(file.size);

      let uploadId = '';
      let objectName = '';

      try {
        // 1. Init multipart upload → receive uploadId + objectName
        const initRes = await http.post<{
          uploadId: string;
          objectName: string;
        }>(apiConfig.file.uploadChunkInit, {
          body: {
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          }
        });

        uploadId = initRes.uploadId;
        objectName = initRes.objectName;

        const totalParts = Math.ceil(file.size / chunkSize);
        const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1);

        // 2. Batch-fetch all presigned URLs in a single request
        const { urls: presignedUrlMap } = await http.post<{
          urls: Record<number, string>;
        }>(apiConfig.file.uploadChunkPresignBatch, {
          body: { objectName, uploadId, partNumbers }
        });

        const parts: Part[] = [];
        let done = 0;
        let isAborted = false;

        // Queue part numbers: [1, 2, 3, ...]
        const queue = [...partNumbers];

        async function uploadNext(): Promise<void> {
          if (isAborted) return;
          const partNumber = queue.shift();
          if (partNumber === undefined) return;

          try {
            const start = (partNumber - 1) * chunkSize;
            const chunk = file.slice(start, start + chunkSize);
            const url = presignedUrlMap[partNumber];

            if (!url) {
              throw new Error(`Missing presigned URL for part ${partNumber}`);
            }

            // 3. PUT chunk directly to MinIO — not through Next.js
            const res = await fetch(url, { method: 'PUT', body: chunk });
            if (!res.ok) throw new Error(`Part ${partNumber} failed`);

            const etagHeader = res.headers.get('ETag');
            if (!etagHeader) {
              throw new Error(
                `Missing ETag in part ${partNumber}. Check MinIO CORS ExposeHeaders.`
              );
            }
            const etag = etagHeader.replace(/"/g, '');
            parts.push({ partNumber, etag });

            done++;
            const currentProgress = Math.round(
              (done / totalParts) * PERCENTAGE_MULTIPLIER
            );
            setProgress(currentProgress);
            onProgress?.(currentProgress);

            return uploadNext(); // pick up next chunk
          } catch (error) {
            isAborted = true; // stop other workers from picking up new chunks
            throw error;
          }
        }

        // Run `concurrency` workers in parallel
        await Promise.all(Array.from({ length: concurrency }, uploadNext));

        // Sort by partNumber before complete (required by S3/MinIO)
        const sortedParts = parts.toSorted(
          (a, b) => a.partNumber - b.partNumber
        );

        // 4. Tell MinIO to complete the upload
        const res = await http.post<{ filePath: string }>(
          apiConfig.file.uploadChunkComplete,
          {
            body: { objectName, uploadId, parts: sortedParts }
          }
        );

        return res?.filePath || '';
      } catch (error) {
        logger.error('Upload failed', error);

        if (uploadId && objectName) {
          try {
            await http.post(apiConfig.file.uploadChunkAbort, {
              body: { objectName, uploadId }
            });
            logger.info(`Successfully aborted upload for ${objectName}`);
          } catch (abortError) {
            logger.error('Failed to abort upload', abortError);
          }
        }

        throw error;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return { upload, progress, uploading };
};

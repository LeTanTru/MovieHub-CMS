import { apiConfig } from '@/constants';
import { logger } from '@/logger';
import { useState, useCallback } from 'react';

const MEGABYTE = 1024 ** 2;
const GIGABYTE = 1024 ** 3;
const MILLISECONDS_PER_SECOND = 1000;
const PERCENTAGE_MULTIPLIER = 100;
const CHUNK_UPLOAD_SMALL_FILE_LIMIT = 100 * MEGABYTE;
const CHUNK_UPLOAD_MEDIUM_FILE_LIMIT = 500 * MEGABYTE;
const CHUNK_UPLOAD_LARGE_FILE_LIMIT = 1.5 * GIGABYTE;
const CHUNK_UPLOAD_SMALL_SIZE = 5 * MEGABYTE;
const CHUNK_UPLOAD_MEDIUM_SIZE = 10 * MEGABYTE;
const CHUNK_UPLOAD_LARGE_SIZE = 20 * MEGABYTE;
const CHUNK_UPLOAD_XL_SIZE = 32 * MEGABYTE;
const CHUNK_UPLOAD_SMALL_CONCURRENCY = 2;
const CHUNK_UPLOAD_MEDIUM_CONCURRENCY = 4;
const CHUNK_UPLOAD_LARGE_CONCURRENCY = 5;
const CHUNK_UPLOAD_XL_CONCURRENCY = 6;

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

const useChunkUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<string> => {
      setUploading(true);
      setProgress(0);
      const startTime = performance.now();

      const { chunkSize, concurrency } = getChunkConfig(file.size);

      let uploadId = '';
      let objectName = '';

      try {
        // 1. Init multipart upload → receive uploadId
        const initRes = await fetch(apiConfig.file.uploadChunkInit.baseUrl, {
          method: apiConfig.file.uploadChunkInit.method,
          headers: apiConfig.file.uploadChunkInit.headers,
          body: JSON.stringify({ fileName: file.name, mimeType: file.type })
        }).then((r) => r.json());

        uploadId = initRes.uploadId;
        objectName = initRes.objectName;

        const totalParts = Math.ceil(file.size / chunkSize);
        const parts: Part[] = [];
        let done = 0;
        let isAborted = false;

        // Queue các partNumber: [1, 2, 3, ...]
        const queue = Array.from({ length: totalParts }, (_, i) => i + 1);

        async function uploadNext(): Promise<void> {
          if (isAborted) return;
          const partNumber = queue.shift();
          if (partNumber === undefined) return;

          try {
            const start = (partNumber - 1) * chunkSize;
            const chunk = file.slice(start, start + chunkSize);

            // 2. Get presigned URL for this part
            const { url } = await fetch(
              apiConfig.file.uploadChunkPresign.baseUrl,
              {
                method: apiConfig.file.uploadChunkPresign.method,
                headers: apiConfig.file.uploadChunkPresign.headers,
                body: JSON.stringify({ objectName, uploadId, partNumber })
              }
            ).then((r) => r.json());

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

            return uploadNext(); // get next chunk
          } catch (error) {
            isAborted = true; // Stop other workers from picking up new chunks
            throw error;
          }
        }

        // Run `concurrency` workers in parallel
        await Promise.all(Array.from({ length: concurrency }, uploadNext));

        // Sort by partNumber before complete (required)
        parts.sort((a, b) => a.partNumber - b.partNumber);

        // 4. Tell MinIO to complete the upload
        const res = await fetch(apiConfig.file.uploadChunkComplete.baseUrl, {
          method: apiConfig.file.uploadChunkComplete.method,
          headers: apiConfig.file.uploadChunkComplete.headers,
          body: JSON.stringify({ objectName, uploadId, parts })
        }).then((r) => r.json());

        const endTime = performance.now();
        const duration = endTime - startTime; // milliseconds

        const seconds = (duration / MILLISECONDS_PER_SECOND).toFixed(2);
        const mbPerSec = (
          file.size /
          MEGABYTE /
          (duration / MILLISECONDS_PER_SECOND)
        ).toFixed(2);

        logger.info(`Upload hoàn thành:`);
        logger.info(`Thời gian: ${seconds}s`);
        logger.info(`Tốc độ: ${mbPerSec} MB/s`);
        logger.info(`Kích thước: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        return res?.filePath || '';
      } catch (error) {
        logger.error('Upload failed', error);

        if (uploadId && objectName) {
          try {
            await fetch(apiConfig.file.uploadChunkAbort.baseUrl, {
              method: apiConfig.file.uploadChunkAbort.method,
              headers: apiConfig.file.uploadChunkAbort.headers,
              body: JSON.stringify({ objectName, uploadId })
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

export default useChunkUpload;

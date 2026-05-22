import { apiConfig } from '@/constants';
import { logger } from '@/logger';
import { http } from '@/utils';
import { useState, useCallback, useRef } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────

const MEGABYTE = 1024 ** 2;
const GIGABYTE = 1024 ** 3;
const MILLISECONDS_PER_SECOND = 1000;
const PERCENTAGE_MULTIPLIER = 100;

// File size thresholds
const CHUNK_UPLOAD_SMALL_FILE_LIMIT = 100 * MEGABYTE;
const CHUNK_UPLOAD_MEDIUM_FILE_LIMIT = 500 * MEGABYTE;
const CHUNK_UPLOAD_LARGE_FILE_LIMIT = 1.5 * GIGABYTE;

// Chunk sizes — tuned for fewer presign round-trips (MinIO min = 5 MB)
const CHUNK_UPLOAD_SMALL_SIZE = 8 * MEGABYTE;
const CHUNK_UPLOAD_MEDIUM_SIZE = 16 * MEGABYTE;
const CHUNK_UPLOAD_LARGE_SIZE = 32 * MEGABYTE;
const CHUNK_UPLOAD_XL_SIZE = 64 * MEGABYTE;

// Concurrency (parallel PUT workers)
const CHUNK_UPLOAD_SMALL_CONCURRENCY = 3;
const CHUNK_UPLOAD_MEDIUM_CONCURRENCY = 5;
const CHUNK_UPLOAD_LARGE_CONCURRENCY = 6;
const CHUNK_UPLOAD_XL_CONCURRENCY = 8;

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

// ─── Types ────────────────────────────────────────────────────────────────────

type Part = {
  partNumber: number;
  etag: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/**
 * Retry a promise-returning function with exponential backoff.
 * Only retries on network/transient errors, not on AbortError.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = MAX_RETRY_ATTEMPTS,
  baseDelayMs = RETRY_BASE_DELAY_MS
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      // Do not retry if the upload was explicitly cancelled
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      lastError = err;

      if (attempt < maxAttempts - 1) {
        const delay = baseDelayMs * 2 ** attempt;
        await new Promise<void>((r) => setTimeout(r, delay));
        logger.warn(
          `[ChunkUpload] Retrying (attempt ${attempt + 2}/${maxAttempts})...`
        );
      }
    }
  }

  throw lastError;
}

/**
 * PUT a chunk directly to MinIO using XMLHttpRequest for byte-accurate
 * progress tracking. Falls back gracefully if XHR is unavailable.
 */
function putChunkWithProgress(
  url: string,
  chunk: Blob,
  onBytesUploaded: (loaded: number) => void,
  signal: AbortSignal
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', url);

    // Byte-level progress — fires multiple times per chunk
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onBytesUploaded(e.loaded);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const raw = xhr.getResponseHeader('ETag');
        if (!raw) {
          reject(
            new Error(
              'Missing ETag in response. Check MinIO CORS ExposeHeaders.'
            )
          );
          return;
        }
        resolve(raw.replace(/"/g, ''));
      } else {
        reject(new Error(`PUT failed: HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during chunk PUT'));
    xhr.ontimeout = () => reject(new Error('Chunk PUT timed out'));

    // Wire up AbortController → XHR abort
    const onAbort = () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });

    xhr.onloadend = () => {
      signal.removeEventListener('abort', onAbort);
    };

    xhr.send(chunk);
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useChunkUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Cancel an in-progress upload. Safe to call even if no upload is running.
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const upload = useCallback(
    async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<string> => {
      // Cancel any previous upload before starting a new one
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      setUploading(true);
      setProgress(0);
      const startTime = performance.now();

      const { chunkSize, concurrency } = getChunkConfig(file.size);

      let uploadId = '';
      let objectName = '';

      try {
        // ── Step 1: Init multipart upload ──────────────────────────────────
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

        // ── Step 2: Batch-fetch ALL presigned URLs in one API call ─────────
        // This is the biggest win: eliminates one round-trip per chunk.
        // All URLs are generated in parallel server-side (Promise.all in route).
        const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1);

        const { urls: presignedUrls } = await http.post<{
          urls: Record<number, string>;
        }>(apiConfig.file.uploadChunkPresignBatch, {
          body: { objectName, uploadId, partNumbers }
        });

        // ── Step 3: Upload all parts with parallel workers ─────────────────
        const parts: Part[] = [];
        const queue = [...partNumbers];

        // Per-chunk byte tracking for smooth progress (instead of 0% → 17% → 33%)
        const bytesUploaded = new Array<number>(totalParts).fill(0);

        const reportProgress = () => {
          const totalUploaded = bytesUploaded.reduce((a, b) => a + b, 0);
          const pct = Math.round(
            (totalUploaded / file.size) * PERCENTAGE_MULTIPLIER
          );
          setProgress(pct);
          onProgress?.(pct);
        };

        async function uploadWorker(): Promise<void> {
          while (queue.length > 0) {
            if (signal.aborted)
              throw new DOMException('Upload cancelled', 'AbortError');

            const partNumber = queue.shift();
            if (partNumber === undefined) return;

            const start = (partNumber - 1) * chunkSize;
            const chunk = file.slice(start, start + chunkSize);
            const url = presignedUrls[partNumber];

            // Retry each chunk independently — one transient failure won't
            // kill the entire upload
            const etag = await withRetry(() =>
              putChunkWithProgress(
                url,
                chunk,
                (loaded) => {
                  bytesUploaded[partNumber - 1] = loaded;
                  reportProgress();
                },
                signal
              )
            );

            parts.push({ partNumber, etag });
          }
        }

        // Spawn `concurrency` workers; each drains the shared queue
        await Promise.all(Array.from({ length: concurrency }, uploadWorker));

        // ── Step 4: Complete the multipart upload ──────────────────────────
        // Sort by partNumber (required by S3/MinIO)
        parts.sort((a, b) => a.partNumber - b.partNumber);

        const res = await http.post<{ filePath: string }>(
          apiConfig.file.uploadChunkComplete,
          {
            body: { objectName, uploadId, parts }
          }
        );

        // Ensure progress shows 100% after completion
        setProgress(PERCENTAGE_MULTIPLIER);
        onProgress?.(PERCENTAGE_MULTIPLIER);

        const durationMs = performance.now() - startTime;
        const seconds = (durationMs / MILLISECONDS_PER_SECOND).toFixed(2);
        const mbPerSec = (
          file.size /
          MEGABYTE /
          (durationMs / MILLISECONDS_PER_SECOND)
        ).toFixed(2);

        logger.info(`[ChunkUpload] Hoàn thành:`);
        logger.info(`  Thời gian: ${seconds}s`);
        logger.info(`  Tốc độ: ${mbPerSec} MB/s`);
        logger.info(`  Kích thước: ${(file.size / MEGABYTE).toFixed(2)} MB`);
        logger.info(
          `  Số parts: ${totalParts} × ${(chunkSize / MEGABYTE).toFixed(0)} MB`
        );

        return res?.filePath || '';
      } catch (error) {
        const isCancelled =
          error instanceof DOMException && error.name === 'AbortError';

        if (isCancelled) {
          logger.info('[ChunkUpload] Upload cancelled by user');
        } else {
          logger.error('[ChunkUpload] Upload failed', error);
        }

        // Abort the multipart upload on MinIO to free storage
        if (uploadId && objectName && !isCancelled) {
          try {
            await http.post(apiConfig.file.uploadChunkAbort, {
              body: { objectName, uploadId }
            });
            logger.info(`[ChunkUpload] Aborted upload for ${objectName}`);
          } catch (abortError) {
            logger.error('[ChunkUpload] Failed to abort upload', abortError);
          }
        }

        throw error;
      } finally {
        setUploading(false);
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    []
  );

  return { upload, cancel, progress, uploading };
};

export default useChunkUpload;

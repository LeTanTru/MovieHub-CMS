import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/logger';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { ApiResponse } from '@/types';

type UseFileUploadManagerProps = {
  initialUrl?: string;
  deleteFileMutate: UseMutateAsyncFunction<
    ApiResponse<any>,
    Error,
    {
      filePath: string;
    },
    unknown
  >;
  isEditing: boolean;
  onOpen?: boolean;
};

export const useFileUploadManager = ({
  initialUrl = '',
  deleteFileMutate,
  isEditing,
  onOpen = false
}: UseFileUploadManagerProps) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (onOpen) {
      const url = initialUrl || '';
      setCurrentUrl(url);
      setOriginalUrl(url);
      setUploadedFiles(url ? [url] : []);
    }
  }, [initialUrl, onOpen]);

  // Reset state
  const reset = useCallback(() => {
    setCurrentUrl('');
    setUploadedFiles([]);
    setOriginalUrl('');
  }, []);

  // Reset state but keep current URL (for cancel without navigation)
  const resetKeepingCurrentUrl = useCallback(() => {
    setUploadedFiles([]);
    setOriginalUrl(initialUrl);
    setCurrentUrl(initialUrl);
  }, [initialUrl]);

  // Add new uploaded file to tracking list
  const trackUpload = useCallback((url: string) => {
    if (url) {
      setCurrentUrl(url);
      setUploadedFiles((prev) => [...prev, url]);
      setIsUploading(false);
    }
  }, []);

  // Track upload start
  const trackUploadStart = useCallback(() => {
    setIsUploading(true);
  }, []);

  // Handle delete on click X button
  const handleDeleteOnClick = useCallback(
    async (url: string) => {
      if (!url) return;

      // Only allow immediate deletion if:
      // 1. Creating mode (no original), OR
      // 2. Editing mode and current file is NOT the original
      const canDeleteImmediately =
        !isEditing || (isEditing && url !== originalUrl);

      if (canDeleteImmediately && url) {
        try {
          const result = await deleteFileMutate({
            filePath: url
          });
          setUploadedFiles((prev) => prev.filter((img) => img !== url));
          setCurrentUrl('');
          return result;
        } catch (err) {
          logger.error('[DELETE_FILE_ERROR]', url, err);
          throw err;
        }
      } else {
        // Just clear UI, don't delete file yet
        setCurrentUrl('');
      }
    },
    [originalUrl, isEditing, deleteFileMutate]
  );

  // Delete multiple files helper
  const deleteFiles = useCallback(
    async (files: string[]) => {
      const validFiles = files.filter(Boolean);
      if (!validFiles.length) return;

      await Promise.all(
        validFiles.map((filePath) =>
          deleteFileMutate({ filePath }).catch((err: Error) => {
            logger.error('[DELETE_FILE_ERROR]', filePath, err);
          })
        )
      );
    },
    [deleteFileMutate]
  );

  // Get files to delete when canceling
  const getFilesToDeleteOnCancel = useCallback(() => {
    const filesToDelete: string[] = [];

    if (isEditing) {
      // EDITING MODE
      if (originalUrl) {
        // Original file exists - delete all new uploads, keep original
        const newUploads = uploadedFiles.filter(
          (img) => img && img !== originalUrl
        );
        filesToDelete.push(...newUploads);
      } else {
        // No original file - delete all uploads
        filesToDelete.push(...uploadedFiles.filter(Boolean));
      }
    } else {
      // CREATING MODE - delete all uploads
      filesToDelete.push(...uploadedFiles.filter(Boolean));
    }

    return filesToDelete;
  }, [isEditing, originalUrl, uploadedFiles]);

  // Get files to delete when submitting
  const getFilesToDeleteOnSubmit = useCallback(() => {
    const filesToDelete: string[] = [];

    if (isEditing) {
      // EDITING MODE

      // Case 1: Original file was changed/removed
      if (originalUrl && currentUrl !== originalUrl) {
        filesToDelete.push(originalUrl);
      }

      // Case 2: Delete all intermediate files
      if (uploadedFiles.length > 0) {
        const filesToKeep = [originalUrl, currentUrl].filter(Boolean);
        const intermediate = uploadedFiles.filter(
          (img) => img && !filesToKeep.includes(img)
        );
        filesToDelete.push(...intermediate);
      }
    } else {
      // CREATING MODE
      // Delete all except the latest (current) file
      if (uploadedFiles.length > 0) {
        const toDelete = uploadedFiles.filter(
          (img) => img && img !== currentUrl
        );
        filesToDelete.push(...toDelete);
      }
    }

    return filesToDelete.filter(Boolean);
  }, [isEditing, originalUrl, currentUrl, uploadedFiles]);

  // Execute deletion on cancel
  // shouldNavigate: true if user will navigate away, false if staying on same page
  const handleCancel = useCallback(
    async (shouldNavigate: boolean = true) => {
      const filesToDelete = getFilesToDeleteOnCancel();
      await deleteFiles(filesToDelete);

      if (shouldNavigate) {
        reset();
      } else {
        resetKeepingCurrentUrl();
      }
    },
    [getFilesToDeleteOnCancel, deleteFiles, reset, resetKeepingCurrentUrl]
  );

  // Execute deletion on submit
  const handleSubmit = useCallback(async () => {
    const filesToDelete = getFilesToDeleteOnSubmit();
    await deleteFiles(filesToDelete);
  }, [getFilesToDeleteOnSubmit, deleteFiles]);

  return {
    currentUrl,
    uploadedFiles,
    originalUrl,
    trackUpload,
    trackUploadStart,
    isUploading,
    handleDeleteOnClick,
    handleCancel,
    handleSubmit,
    reset,
    // For debugging
    getFilesToDeleteOnCancel,
    getFilesToDeleteOnSubmit
  };
};

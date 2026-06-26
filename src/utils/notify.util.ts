import type { ReactNode } from 'react';
import { toast, ToastOptions, Bounce } from 'react-toastify';

const TOAST_AUTO_CLOSE_MS = 3000;

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: TOAST_AUTO_CLOSE_MS,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
  transition: Bounce,
  className: `
    pr-10!
    min-w-80!
    max-w-120!
    w-fit!
  `
};

/**
 * @param message The success message to display
 * @param options Optional toast configuration
 */
const showSuccess = (message: string | ReactNode, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

/**
 * @param message The error message to display
 * @param options Optional toast configuration
 */
const showError = (message: string | ReactNode, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

/**
 * @param message The info message to display
 * @param options Optional toast configuration
 */
const showInfo = (message: string | ReactNode, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

/**
 * @param message The warning message to display
 * @param options Optional toast configuration
 */
const showWarning = (message: string | ReactNode, options?: ToastOptions) => {
  toast.warn(message, { ...defaultOptions, ...options });
};

export const notify = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning
};

import { toast, ToastOptions, Bounce } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
  transition: Bounce,
  className: `
    whitespace-nowrap
    pr-10!
    min-w-80!
    max-w-120!
  `
};

const showSuccess = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  toast.success(message, { ...defaultOptions, ...options });
};

const showError = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  toast.error(message, { ...defaultOptions, ...options });
};

const showInfo = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  toast.info(message, { ...defaultOptions, ...options });
};

const showWarning = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  toast.warn(message, { ...defaultOptions, ...options });
};

export const notify = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning
};

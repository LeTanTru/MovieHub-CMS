export const logger = {
  info: (...args: any[]) => {
    console.log('[INFO]', ...args); // eslint-disable-line no-console
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args); // eslint-disable-line no-console
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args); // eslint-disable-line no-console
  }
};

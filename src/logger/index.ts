export const logger = {
  info: (...args: unknown[]) => {
    console.log('[INFO]', ...args); // eslint-disable-line no-console
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args); // eslint-disable-line no-console
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args); // eslint-disable-line no-console
  }
};

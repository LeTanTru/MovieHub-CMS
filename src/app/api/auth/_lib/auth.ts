export const getBasicAuthHeader = (): string => {
  const credentials = `${process.env.APP_USERNAME}:${process.env.APP_PASSWORD}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
};

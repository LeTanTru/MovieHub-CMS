import { DATE_TIME_FORMAT } from '@/constants';
import { logger } from '@/logger';
import { format as formatFn, isValid, parse } from 'date-fns';

export const formatDate = (
  date: string | null | undefined,
  outputFormat: string = DATE_TIME_FORMAT,
  inputFormat: string = DATE_TIME_FORMAT
) => {
  if (!date) return '';

  try {
    const parsedDate = parse(date, inputFormat, new Date());

    if (!isValid(parsedDate)) return '';

    return formatFn(parsedDate, outputFormat);
  } catch (error) {
    logger.error('Invalid date format', date, error);
    return '';
  }
};

export const convertLocalToUTC = (
  date: string | null,
  inputFormat: string = DATE_TIME_FORMAT,
  outputFormat: string = DATE_TIME_FORMAT
) => {
  if (!date) return '';

  try {
    const parsedDate = parse(date, inputFormat, new Date());
    if (!isValid(parsedDate)) return '';

    const utcDate = new Date(
      parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60 * 1000
    );

    return formatFn(utcDate, outputFormat);
  } catch (error) {
    logger.error('convertLocalToUTC error', date, error);
    return '';
  }
};

export const convertUTCToLocal = (
  date: string | null,
  inputFormat: string = DATE_TIME_FORMAT,
  outputFormat: string = DATE_TIME_FORMAT
) => {
  if (!date) return '';

  try {
    const parsedDate = parse(date, inputFormat, new Date());
    if (!isValid(parsedDate)) return '';

    const localDate = new Date(
      parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60 * 1000
    );

    return formatFn(localDate, outputFormat);
  } catch (error) {
    logger.error('convertUTCToLocal error', date, error);
    return '';
  }
};

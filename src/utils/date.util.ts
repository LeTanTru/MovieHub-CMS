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

export const timeAgo = (dateStr: string) => {
  const [day, month, yearAndTime] = dateStr.split('/');
  const [year, time] = yearAndTime.split(' ');

  const iso = `${year}-${month}-${day}T${time}+00:00`;
  const date = new Date(iso);

  if (isNaN(date.getTime())) return 'Invalid date';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return 'Vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(months / 12);
  return `${years} năm trước`;
};

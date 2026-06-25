import {
  SUBTITLE_TIME_PLACEHOLDER,
  HOURS_TO_SECOND,
  MILLISECOND,
  MINUTES_TO_SECOND,
  DEFAULT_TIME
} from '@/constants';

const CLOCK_TIME_PATTERN = /^(?:\d{2,}:)?[0-5]\d:[0-5]\d(?:\.\d{1,3})?$/;

/**
 * @param time The time string to parse
 */
function parseClockTime(time: string) {
  const normalizedTime = time.trim();
  if (!normalizedTime) return null;

  const parts = normalizedTime.split(':');
  if (parts.length !== 2 && parts.length !== 3) return null;
  if (parts.some((part) => part.trim() === '')) return null;

  const values = parts.map(Number);
  if (values.some((part) => !Number.isFinite(part))) return null;

  const [hours, minutes, seconds] =
    values.length === 3 ? values : [0, values[0], values[1]];

  if (
    hours < 0 ||
    minutes < 0 ||
    minutes >= 60 ||
    seconds < 0 ||
    seconds >= 60
  ) {
    return null;
  }

  return {
    hours,
    minutes,
    seconds
  };
}

/**
 * @param time The time string to convert
 */
export const timeToSeconds = (
  time: string | number | null | undefined
): number => {
  if (time === null || time === undefined) return 0;
  if (typeof time === 'number') {
    return Number.isFinite(time) && time > 0 ? time : 0;
  }

  const parsedTime = parseClockTime(time);

  if (!parsedTime) return 0;

  return (
    parsedTime.hours * HOURS_TO_SECOND +
    parsedTime.minutes * MINUTES_TO_SECOND +
    parsedTime.seconds
  );
};

/**
 * @param time The time string to validate
 */
export const isValidClockTime = (time: string): boolean =>
  CLOCK_TIME_PATTERN.test(time.trim()) && parseClockTime(time) !== null;

/**
 * @param totalSeconds The total number of seconds
 */
export const secondsToTime = (totalSeconds: number): string => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return DEFAULT_TIME;

  const safeSeconds = Math.floor(totalSeconds);
  const hours = Math.floor(safeSeconds / HOURS_TO_SECOND);
  const minutes = Math.floor(
    (safeSeconds % HOURS_TO_SECOND) / MINUTES_TO_SECOND
  );
  const seconds = safeSeconds % MINUTES_TO_SECOND;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * @param totalSeconds The total number of seconds
 */
export const secondsToVttTime = (totalSeconds: number): string => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return SUBTITLE_TIME_PLACEHOLDER;
  }

  const safeMilliseconds = Math.round(totalSeconds * MILLISECOND);
  const hours = Math.floor(safeMilliseconds / (HOURS_TO_SECOND * MILLISECOND));
  const minutes = Math.floor(
    (safeMilliseconds % (HOURS_TO_SECOND * MILLISECOND)) /
      (MINUTES_TO_SECOND * MILLISECOND)
  );
  const seconds = Math.floor(
    (safeMilliseconds % (MINUTES_TO_SECOND * MILLISECOND)) / MILLISECOND
  );
  const milliseconds = safeMilliseconds % MILLISECOND;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(
    milliseconds
  ).padStart(3, '0')}`;
};

/**
 * @param n The number to pad
 */
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

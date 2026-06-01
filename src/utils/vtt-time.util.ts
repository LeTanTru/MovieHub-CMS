import {
  HOURS_TO_SECOND,
  MILLISECOND,
  MINUTES_TO_SECOND,
  SECONDS_TO_SECOND
} from '@/constants';

export const vttTimeToSecond = (vttTime: string): number => {
  const [time = '0:0', milliseconds = '0'] = vttTime.trim().split('.');
  const parts = time.split(':').map(Number);
  const [hours, minutes, seconds] =
    parts.length === 3 ? parts : [0, parts[0] || 0, parts[1] || 0];

  return (
    hours * HOURS_TO_SECOND +
    minutes * MINUTES_TO_SECOND +
    seconds * SECONDS_TO_SECOND +
    Number(milliseconds.padEnd(3, '0').slice(0, 3)) / MILLISECOND
  );
};

export const secondToVttTime = (second: number): string => {
  const safeMillisecond = Math.max(0, Math.round(second * MILLISECOND));
  const hours = Math.floor(safeMillisecond / (HOURS_TO_SECOND * MILLISECOND));
  const minutes = Math.floor(
    (safeMillisecond % (HOURS_TO_SECOND * MILLISECOND)) /
      (MINUTES_TO_SECOND * MILLISECOND)
  );
  const seconds = Math.floor(
    (safeMillisecond % (MINUTES_TO_SECOND * MILLISECOND)) / MILLISECOND
  );
  const milliseconds = safeMillisecond % MILLISECOND;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

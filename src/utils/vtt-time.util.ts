const HOURS_TO_MS = 60 * 60 * 1000;
const MINUTES_TO_MS = 60 * 1000;
const SECONDS_TO_MS = 1000;

export const vttTimeToMs = (vttTime: string): number => {
  const [time = '0:0', milliseconds = '0'] = vttTime.trim().split('.');
  const parts = time.split(':').map(Number);
  const [hours, minutes, seconds] =
    parts.length === 3 ? parts : [0, parts[0] || 0, parts[1] || 0];

  return (
    ((hours * 60 + minutes) * 60 + seconds) * 1000 +
    Number(milliseconds.padEnd(3, '0').slice(0, 3))
  );
};

export const msToVttTime = (ms: number): string => {
  const safeMs = Math.max(0, Math.round(ms));
  const hours = Math.floor(safeMs / HOURS_TO_MS);
  const minutes = Math.floor((safeMs % HOURS_TO_MS) / MINUTES_TO_MS);
  const seconds = Math.floor((safeMs % MINUTES_TO_MS) / SECONDS_TO_MS);
  const milliseconds = safeMs % SECONDS_TO_MS;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

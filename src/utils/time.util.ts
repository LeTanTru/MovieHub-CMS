export function timeToSeconds(time: string): number {
  if (typeof time === 'number') return time;

  const parts = time.split(':');

  if (parts.length !== 3) {
    throw new Error('Định dạng thời gian phải là HH:mm:ss');
  }

  const [hours, minutes, seconds] = parts.map((p) => parseInt(p, 10));

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    hours < 0 ||
    minutes < 0 ||
    minutes >= 60 ||
    seconds < 0 ||
    seconds >= 60
  ) {
    throw new Error('Giá trị giờ, phút, giây không hợp lệ');
  }

  return hours * 3600 + minutes * 60 + seconds;
}

export function formatSecondsToHMS(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

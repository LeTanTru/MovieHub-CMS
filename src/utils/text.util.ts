import { SUBTITLE_DELIMITER } from '@/constants';
import { logger } from '@/logger';
import type { OptionType, SubtitleType } from '@/types';
import {
  isValidClockTime,
  secondsToVttTime,
  timeToSeconds
} from '@/utils/time.util';

const VTT_HEADER_PATTERN = /^\uFEFF?WEBVTT(?:\s.*)?$/i;
const VTT_METADATA_BLOCK_PATTERN = /^(NOTE(?:\s.*)?|STYLE|REGION)$/i;

export const getLastWord = (text: string): string => {
  const words = text.trim().split(/\s+/);
  return words[words.length - 1] || '';
};

export const parseSelectOptions = (options?: null | string): OptionType[] => {
  if (!options) return [];

  try {
    const parsed = JSON.parse(options);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object' || typeof item.value !== 'string') {
        return [];
      }

      return [
        {
          label: typeof item.label === 'string' ? item.label : item.value,
          value: item.value
        }
      ];
    });
  } catch (_e) {
    return options
      .split(',')
      .reduce((acc: { label: string; value: string }[], option) => {
        const trimmed = option.trim();
        if (trimmed) {
          acc.push({ label: trimmed, value: trimmed });
        }
        return acc;
      }, []);
  }
};

export const parseJSON = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.error('[PARSE_JSON_ERROR]', error);
    return null;
  }
};

export const createSubtitleId = (
  index: number,
  startTime: number,
  endTime: number
): string => `subtitle-${index}-${startTime}-${endTime}`;

export const parseVttContent = (content: string): SubtitleType[] => {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  const subtitles: SubtitleType[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line || VTT_HEADER_PATTERN.test(line)) {
      i++;
      continue;
    }

    if (VTT_METADATA_BLOCK_PATTERN.test(line)) {
      i++;
      while (i < lines.length && lines[i].trim() !== '') i++;
      continue;
    }

    let timeline = line;

    if (
      !timeline.includes(SUBTITLE_DELIMITER) &&
      i + 1 < lines.length &&
      lines[i + 1].includes(SUBTITLE_DELIMITER)
    ) {
      i++;
      timeline = lines[i].trim();
    }

    if (!timeline.includes(SUBTITLE_DELIMITER)) {
      i++;
      continue;
    }

    const [startTimeStr = '', endTimeStr = ''] =
      timeline.split(SUBTITLE_DELIMITER);
    const start = startTimeStr.trim();
    const end = endTimeStr.trim().split(/\s+/)[0] || '';

    if (!isValidClockTime(start) || !isValidClockTime(end)) {
      i++;
      continue;
    }

    const startTime = timeToSeconds(start);
    const endTime = timeToSeconds(end);

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      i++;
      continue;
    }

    i++;

    const textLines: string[] = [];

    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].includes(SUBTITLE_DELIMITER)
    ) {
      textLines.push(lines[i]);
      i++;
    }

    const subtitleIndex = subtitles.length;

    subtitles.push({
      id: createSubtitleId(subtitleIndex, startTime, endTime),
      start,
      end,
      startTime,
      endTime,
      text: textLines.join('\n')
    });
  }

  return subtitles;
};

export const serializeVttContent = (subtitles: SubtitleType[]): string => {
  const lines = ['WEBVTT', ''];

  [...subtitles]
    .filter(
      (subtitle) =>
        Number.isFinite(subtitle.startTime) &&
        Number.isFinite(subtitle.endTime) &&
        subtitle.endTime > subtitle.startTime
    )
    .toSorted((a, b) => a.startTime - b.startTime)
    .forEach((subtitle, index) => {
      lines.push(`${index + 1}`);
      lines.push(
        `${secondsToVttTime(subtitle.startTime)} ${SUBTITLE_DELIMITER} ${secondsToVttTime(subtitle.endTime)}`
      );
      lines.push(subtitle.text);
      lines.push('');
    });

  return `${lines.join('\n')}\n`;
};

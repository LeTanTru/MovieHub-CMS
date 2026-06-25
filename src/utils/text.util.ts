import { SUBTITLE_DELIMITER } from '@/constants';
import { logger } from '@/logger';
import type {
  OptionType,
  SubtitleType,
  ToxicSpan,
  ToxicSpanPreview,
  ToxicSpanSegment
} from '@/types';
import {
  isValidClockTime,
  secondsToVttTime,
  timeToSeconds
} from '@/utils/time.util';

const VTT_HEADER_PATTERN = /^\uFEFF?WEBVTT(?:\s.*)?$/i;
const VTT_METADATA_BLOCK_PATTERN = /^(NOTE(?:\s.*)?|STYLE|REGION)$/i;

/**
 * @param text The input string
 */
export const getLastWord = (text: string): string => {
  const words = text.trim().split(/\s+/);
  return words[words.length - 1] || '';
};

/**
 * @param options The stringified select options
 */
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

/**
 * @param json The JSON string to parse
 */
export const parseJSON = <T>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.error('[PARSE_JSON_ERROR]', error);
    return null;
  }
};

/**
 * @param index The index of the subtitle
 * @param startTime The start time of the subtitle
 * @param endTime The end time of the subtitle
 */
export const createSubtitleId = (
  index: number,
  startTime: number,
  endTime: number
): string => `subtitle-${index}-${startTime}-${endTime}`;

/**
 * @param content The VTT file content string
 */
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

    const startTime = Number(timeToSeconds(start).toFixed(2));
    const endTime = Number(timeToSeconds(end).toFixed(2));

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

/**
 * @param subtitles The array of subtitles to serialize
 */
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

/**
 * @param value The value to parse into a boolean
 */
export const parseBooleanValue = (
  value: boolean | number | string | undefined
) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  return value?.toLowerCase() === 'true';
};

/**
 * @param value The boolean-like value to stringify
 */
export const stringifyBooleanValue = (value: boolean | number | string) => {
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return value === 1 ? 'true' : 'false';

  return value.toLowerCase() === 'true' ? 'true' : 'false';
};

/**
 * @param value The stringified toxic spans
 */
export const parseToxicSpans = (
  value: string | null | undefined
): ToxicSpan[] | null => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) return null;

    return parsed.map((span) => {
      if (!span || typeof span !== 'object') {
        throw new Error('Invalid toxic span');
      }

      const { start, end } = span as Partial<ToxicSpan>;

      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new Error('Invalid toxic span range');
      }

      return { start: start as number, end: end as number };
    });
  } catch {
    return null;
  }
};

/**
 * @param spans The array of toxic spans to normalize
 * @param contentLength The length of the content
 */
export const normalizeToxicSpans = (
  spans: ToxicSpan[],
  contentLength: number
): ToxicSpan[] => {
  if (contentLength <= 0) return [];

  const normalized = spans
    .flatMap((span) => {
      if (!Number.isFinite(span.start) || !Number.isFinite(span.end)) {
        return [];
      }

      const start = Math.min(
        Math.max(Math.floor(span.start), 0),
        contentLength
      );
      const end = Math.min(Math.max(Math.floor(span.end), 0), contentLength);

      if (end <= start) return [];

      return [{ start, end }];
    })
    .toSorted((a, b) => a.start - b.start || a.end - b.end);

  return normalized.reduce<ToxicSpan[]>((result, span) => {
    const previous = result.at(-1);

    if (!previous || span.start > previous.end) {
      result.push(span);
      return result;
    }

    previous.end = Math.max(previous.end, span.end);
    return result;
  }, []);
};

/**
 * @param content The text content
 * @param spans The toxic spans
 */
export const createToxicSpanPreviews = (
  content: string,
  spans: ToxicSpan[]
): ToxicSpanPreview[] =>
  spans.map((span) => ({
    ...span,
    text: content.slice(span.start, span.end)
  }));

/**
 * @param content The text content
 * @param spans The toxic spans
 */
export const createToxicSpanSegments = (
  content: string,
  spans: ToxicSpan[]
): ToxicSpanSegment[] => {
  const segments: ToxicSpanSegment[] = [];
  let lastIndex = 0;

  spans.forEach((span) => {
    if (span.start > lastIndex) {
      segments.push({
        start: lastIndex,
        end: span.start,
        text: content.slice(lastIndex, span.start),
        toxic: false
      });
    }

    segments.push({
      start: span.start,
      end: span.end,
      text: content.slice(span.start, span.end),
      toxic: true
    });

    lastIndex = span.end;
  });

  if (lastIndex < content.length) {
    segments.push({
      start: lastIndex,
      end: content.length,
      text: content.slice(lastIndex),
      toxic: false
    });
  }

  return segments;
};

/**
 * @param node The DOM node
 * @param container The container HTMLElement
 */
export const getSegmentFromNode = (
  node: Node,
  container: HTMLElement
): HTMLElement | null => {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  const segment = element?.closest<HTMLElement>('[data-toxic-span-segment]');

  if (!segment || !container.contains(segment)) return null;

  return segment;
};

/**
 * @param container The container HTMLElement
 * @param boundaryContainer The boundary node from a selection
 * @param boundaryOffset The offset within the boundary node
 */
export const getBoundaryOffset = (
  container: HTMLElement,
  boundaryContainer: Node,
  boundaryOffset: number
): number | null => {
  const segment = getSegmentFromNode(boundaryContainer, container);

  if (!segment) return null;

  const segmentStart = Number(segment.dataset.start);

  if (!Number.isFinite(segmentStart)) return null;

  if (boundaryContainer.nodeType === Node.TEXT_NODE) {
    return segmentStart + boundaryOffset;
  }

  if (boundaryContainer !== segment) return null;

  if (boundaryOffset <= 0) return segmentStart;

  if (boundaryOffset >= segment.childNodes.length) {
    return segmentStart + (segment.textContent?.length ?? 0);
  }

  let localOffset = 0;

  for (let index = 0; index < boundaryOffset; index++) {
    localOffset += segment.childNodes[index]?.textContent?.length ?? 0;
  }

  return segmentStart + localOffset;
};

/**
 * @param container The container HTMLElement containing the text
 */
export const getSelectedToxicSpan = (
  container: HTMLElement
): ToxicSpan | null => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);

  if (
    range.collapsed ||
    !container.contains(range.startContainer) ||
    !container.contains(range.endContainer)
  ) {
    return null;
  }

  const start = getBoundaryOffset(
    container,
    range.startContainer,
    range.startOffset
  );
  const end = getBoundaryOffset(container, range.endContainer, range.endOffset);

  if (start === null || end === null || start === end) return null;

  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  };
};

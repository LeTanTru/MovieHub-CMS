import { OptionType } from '@/types';

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
  } catch (_e) {
    return null;
  }
};

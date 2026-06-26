import { languageNameMap } from '@/constants';

/**
 * @param label The language code or label to lookup
 */
export const getLanguageLabel = (label: string): string => {
  if (label in languageNameMap) {
    return languageNameMap[label as keyof typeof languageNameMap];
  }
  return label;
};

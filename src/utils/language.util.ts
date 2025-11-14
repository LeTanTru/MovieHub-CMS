import { languageNameMap } from '@/constants';

export function getLanguageLabel(label: string): string {
  if (label in languageNameMap) {
    return languageNameMap[label as keyof typeof languageNameMap];
  }
  return label;
}

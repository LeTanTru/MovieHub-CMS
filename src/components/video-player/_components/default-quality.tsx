'use client';

import { useEffect } from 'react';
import { useVideoQualityOptions } from '@vidstack/react';
import { VIDEO_QUALITY_MAX } from '@/constants';

type DefaultQualityProps = {
  defaultQuality: number;
};

const QUALITY_MAP: Record<number, number> = {
  0: 0,
  1: 720,
  2: 1080,
  3: 1440,
  4: 9999
};

export function DefaultQuality({ defaultQuality }: DefaultQualityProps) {
  const options = useVideoQualityOptions({ auto: true });

  useEffect(() => {
    if (defaultQuality === 0) return;

    const targetHeight =
      QUALITY_MAP[
        defaultQuality === VIDEO_QUALITY_MAX
          ? VIDEO_QUALITY_MAX - 1
          : defaultQuality
      ];
    if (!targetHeight) return;

    for (const opt of options) {
      const height = opt.quality?.height ?? 0;
      if (height === targetHeight) {
        opt.select();
        break;
      }
    }
  }, [options, defaultQuality]);

  return null;
}

'use client';

import { cn } from '@/lib';
import { TimeSliderMarkerType } from '@/types';

type TimeSliderMarkerProps = {
  markers?: TimeSliderMarkerType[];
  duration: number;
  activeMarkerId?: string | null;
};

const clampTime = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const buildMarkers = ({
  markers,
  duration
}: {
  markers: TimeSliderMarkerType[];
  duration: number;
}) => {
  if (duration <= 0 || !Number.isFinite(duration)) return [];

  return markers.flatMap((marker) => {
    if (!Number.isFinite(marker.start) || !Number.isFinite(marker.end))
      return [];

    if (marker.end <= marker.start) return [];

    if (marker.end <= 0 || marker.start >= duration) {
      return [];
    }

    const start = clampTime(marker.start, 0, duration);
    const end = clampTime(marker.end, 0, duration);
    const width = Number((((end - start) / duration) * 100).toFixed(2));

    if (width <= 0) {
      return [];
    }

    return [
      {
        id: marker.id,
        left: Number(((start / duration) * 100).toFixed(2)),
        width
      }
    ];
  });
};

export function TimeSliderMarker({
  markers = [],
  duration,
  activeMarkerId
}: TimeSliderMarkerProps) {
  const timeMarkers = buildMarkers({
    markers,
    duration
  });

  if (!timeMarkers.length) return null;

  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-12'
    >
      {timeMarkers.map((marker) => (
        <span
          key={marker.id}
          className={cn('absolute top-0 h-full min-w-px rounded-sm', {
            'bg-red-600/60': marker.id === activeMarkerId
          })}
          style={{
            left: `${marker.left}%`,
            width: `${marker.width}%`
          }}
        />
      ))}
    </div>
  );
}

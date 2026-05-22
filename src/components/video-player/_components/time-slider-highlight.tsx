import { cn } from '@/lib';

type IntroRangeHighlightProps = {
  start: number;
  end: number;
  duration: number;
};

export const TimeSliderHighlight = ({
  start,
  end,
  duration
}: IntroRangeHighlightProps) => {
  const left = (start / duration) * 100;
  const width = ((end - start) / duration) * 100;
  const styles = {
    left: `${left}%`,
    width: `${width}%`
  };
  const isAtStart = start === 0;

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-0 h-full bg-gray-200/50 transition-all duration-200',
        {
          'rounded-tl rounded-bl': isAtStart
        }
      )}
      style={styles}
    />
  );
};

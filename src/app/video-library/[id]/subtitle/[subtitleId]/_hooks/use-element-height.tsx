import { useCallback, useRef, useState } from 'react';

export const useElementHeight = () => {
  const [height, setHeight] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const elementRef = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (!node) {
      setHeight(0);
      return;
    }

    const updateHeight = () => {
      const nextHeight = node.getBoundingClientRect().height;

      setHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight
      );
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(node);
    resizeObserverRef.current = resizeObserver;
  }, []);

  return [height, elementRef] as const;
};

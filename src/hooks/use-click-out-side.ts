import { useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  onClickOutside: () => void
) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsidePortal = (target as Element).closest?.(
        '[data-radix-popper-content-wrapper], [data-radix-portal], [role="alertdialog"], [role="dialog"]'
      );

      const clickedOnOverlay = (target as Element).matches?.(
        '[data-state="open"].fixed, [data-aria-hidden="true"]'
      );

      if (
        ref.current &&
        !ref.current.contains(target) &&
        !clickedInsidePortal &&
        !clickedOnOverlay
      ) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClickOutside]);

  return ref;
};

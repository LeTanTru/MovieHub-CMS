import { useState } from 'react';

/**
 * Hook to manage a simple boolean disclosure state (e.g. open/close dialogs).
 *
 * @param initial - The initial open state (defaults to false).
 */
export const useDisclosure = (initial: boolean = false) => {
  const [opened, setOpened] = useState<boolean>(initial);

  const open = () => setOpened(true);
  const close = () => setOpened(false);
  const toggle = () => setOpened((op) => !op);

  return { opened, open, close, toggle };
};

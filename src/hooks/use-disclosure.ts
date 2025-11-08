'use client';

import { useState } from 'react';

const useDisclosure = (initial: boolean = false) => {
  const [opened, setOpened] = useState<boolean>(initial);

  const open = () => setOpened(true);
  const close = () => setOpened(false);
  const toggle = () => setOpened((op) => !op);

  return { opened, open, close, toggle };
};

export default useDisclosure;

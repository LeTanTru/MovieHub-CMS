'use client';

import { useFirstActiveRoute, useNavigate } from '@/hooks';
import { useEffect } from 'react';
import { route } from '@/routes';

export default function HomePage() {
  const firstActiveRoute = useFirstActiveRoute();
  const navigate = useNavigate();

  useEffect(() => {
    navigate.replace(firstActiveRoute || route.profile.savePage.path);
  }, [firstActiveRoute, navigate]);

  return <></>;
}

'use client';

import Link from 'next/link';
import {
  Breadcrumb as OriginBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';
import type { BreadcrumbProps } from '@/types';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { Skeleton } from '@/components/ui/skeleton';

export function Breadcrumb({
  items,
  separator = <BreadcrumbSeparator />
}: BreadcrumbProps) {
  const isMounted = useIsMounted();

  const length = items.length;

  if (!isMounted) {
    return (
      <OriginBreadcrumb>
        <BreadcrumbList className='gap-1.5!'>
          {Array.from({ length }).map((_, i) => {
            const isLast = i === length - 1;
            return (
              <Fragment key={i}>
                <BreadcrumbItem>
                  {!isLast ? (
                    <Skeleton className='h-4 w-16 rounded bg-gray-200' />
                  ) : (
                    <Skeleton className='h-4 w-20 rounded bg-gray-200' />
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </OriginBreadcrumb>
    );
  }

  return (
    <OriginBreadcrumb>
      <BreadcrumbList className='gap-1.5!'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link className='text-breadcrumb' href={item.href}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className='text-foreground'>
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && separator}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </OriginBreadcrumb>
  );
}

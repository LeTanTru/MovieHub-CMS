'use client';

import './sidebar.css';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { logo, logoWithText } from '@/assets';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib';
import { AvatarField } from '@/components/form';
import type { MenuItem } from '@/types';
import { useSidebarStore } from '@/store';
import { useAuth, useIsMounted, useValidatePermission } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { getLastWord, renderImageUrl } from '@/utils';
import { menuConfig } from '@/constants';
import CollapsibleMenuItem from './collapsible-menu-item';
import { route } from '@/routes';

const AppSidebar = () => {
  const isMounted = useIsMounted();
  const { profile } = useAuth();
  const { state } = useSidebar();
  const hasPermission = useValidatePermission();
  const openLastMenu = useSidebarStore((s) => s.openLastMenu);
  const setSidebarScrollY = useSidebarStore((s) => s.setSidebarScrollY);
  const sidebarContentRef = useRef<HTMLDivElement>(null);

  // Restore the scroll position after the client has mounted
  useEffect(() => {
    if (!isMounted || !sidebarContentRef.current) return;
    sidebarContentRef.current.scrollTop =
      useSidebarStore.getState().sidebarScrollY;
  }, [isMounted]);

  const handleSidebarScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setSidebarScrollY((e.currentTarget as HTMLDivElement).scrollTop);
    },
    [setSidebarScrollY]
  );

  // handle open last opened menu when sidebar changed state from collapsed -> expanded
  useEffect(() => {
    if (state === 'expanded') {
      openLastMenu();
    }
  }, [state, openLastMenu]);

  const filterMenuByPermission = (menu: MenuItem[]): MenuItem[] => {
    return menu.flatMap((item) => {
      const children = item.children
        ? filterMenuByPermission(item.children)
        : undefined;

      const allowed =
        !item.permissionCode ||
        hasPermission({ requiredPermissions: item.permissionCode });

      if (!allowed && (!children || children.length === 0)) {
        return [];
      }

      return [{ ...item, children }];
    });
  };

  const clientMenu = filterMenuByPermission(menuConfig);

  if (!isMounted || !clientMenu) {
    return (
      <Sidebar
        className='**:data-[sidebar="sidebar"]:bg-sidebar group-data-[side=left]:border-none'
        collapsible='icon'
      >
        <SidebarHeader className='min-h-25 px-0 py-4'>
          <Skeleton className='mx-auto h-12 w-4/5' />
        </SidebarHeader>
        <SidebarContent className='sidebar-content'>
          <SidebarGroup className='p-0'>
            <SidebarGroupContent>
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} className='my-1 h-10 w-full rounded-md' />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      className='**:data-[sidebar="sidebar"]:bg-sidebar group-data-[side=left]:border-none'
      collapsible='icon'
      suppressHydrationWarning
    >
      <SidebarHeader
        className={cn('px-0 py-0', {
          'min-h-25 py-4': state === 'expanded'
        })}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className='h-full focus-visible:ring-0!' asChild>
              <Link
                href={route.home.path}
                className='block! w-full! transition-all duration-200 ease-linear group-data-[collapsible=icon]:size-full! group-data-[collapsible=icon]:p-0! hover:bg-transparent!'
              >
                {state === 'expanded' ? (
                  <Image
                    src={logoWithText}
                    alt='logo'
                    width={250}
                    height={50}
                    loading='eager'
                    className='mx-auto w-4/5 object-cover'
                    unoptimized
                  />
                ) : (
                  <Image
                    src={logo}
                    alt='logo'
                    width={50}
                    height={50}
                    className='mx-auto w-4/5 object-cover'
                  />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent
        ref={sidebarContentRef}
        className='sidebar-content'
        onScroll={handleSidebarScroll}
      >
        <SidebarGroup className='p-0'>
          <SidebarGroupContent>
            <SidebarMenu>
              {clientMenu.map((item) =>
                item.children && item.children.length > 0 ? (
                  <CollapsibleMenuItem key={item.key} item={item} />
                ) : // <SidebarMenuItem key={item.key}>
                //   <SidebarMenuButton
                //     className='rounded-none focus-visible:ring-0!'
                //     asChild
                //   >
                //     {item.path ? (
                //       <Link href={item.path}>
                //         {item.icon && <item.icon />}
                //         <span>{item.label}</span>
                //       </Link>
                //     ) : (
                //       <Button
                //         variant='ghost'
                //         className='bg-background hover:bg-background! justify-start pl-12'
                //       >
                //         {item.icon && <item.icon />}
                //         <span>{item.label}</span>
                //       </Button>
                //     )}
                //   </SidebarMenuButton>
                // </SidebarMenuItem>
                null
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className={cn('mb-4 flex flex-row items-center justify-center', {
          'pl-8': state === 'expanded'
        })}
      >
        <SidebarMenu className='size-10'>
          <SidebarMenuItem>
            <AvatarField
              src={renderImageUrl(profile?.avatarPath)}
              disablePreview
              size={40}
              alt={getLastWord(profile?.fullName || '')}
            />
          </SidebarMenuItem>
        </SidebarMenu>
        {state === 'expanded' && (
          <SidebarMenu className='flex-1'>
            <SidebarMenuItem className='mx-auto line-clamp-1 block w-full justify-start truncate rounded-lg font-normal text-white transition-all duration-200 ease-linear'>
              {profile?.fullName}
            </SidebarMenuItem>
            <SidebarMenuItem className='mx-auto line-clamp-1 block w-full justify-start truncate rounded-lg text-xs font-normal text-gray-400 transition-all duration-200 ease-linear'>
              {profile?.email}
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

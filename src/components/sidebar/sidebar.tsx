'use client';

import { ChevronDown, CircleUserRound } from 'lucide-react';
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { logo, logoWithText } from '@/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib';
import { AvatarField, Button } from '@/components/form';
import './sidebar.css';
import { MenuItem } from '@/types';
import { useSidebarStore } from '@/store';
import {
  useAuth,
  useNavigate,
  useQueryParams,
  useValidatePermission
} from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import menuConfig from '@/constants/menu-config';
import { createPortal } from 'react-dom';
import { renderImageUrl } from '@/utils';

function CollapsibleMenuItem({ item }: { item: MenuItem }) {
  const navigate = useNavigate();
  const pathname = usePathname();
  const { state } = useSidebar();
  const { serializeParams } = useQueryParams();

  const storeOpen = useSidebarStore((s) => s.openMenus[item.key]);
  const { toggleMenu, setMenu, setSidebarState } = useSidebarStore();

  const [hovered, setHovered] = useState(false);
  const [flyoutHovered, setFlyoutHovered] = useState(false);
  const showFlyout = hovered || flyoutHovered;
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initial open when reload
  const isInitiallyOpen = useMemo(
    () =>
      item.children?.some(
        (child) => child.path && pathname.includes(child.path)
      ) ?? false,
    [item.children, pathname]
  );
  const open = storeOpen ?? isInitiallyOpen;
  useEffect(() => {
    if (isInitiallyOpen) {
      setMenu(item.key, true);
    }
  }, [isInitiallyOpen, item.key, setMenu]);

  // state is collapsed -> close all
  useEffect(() => {
    if (state === 'collapsed') {
      setMenu(item.key, false);
    }
  }, [state, item.key, setMenu]);

  // open parent menu if child path match pathname
  useEffect(() => {
    if (
      item.children?.find(
        (child) => child.path && pathname.includes(child.path)
      )
    ) {
      setMenu(item.key, true);
    }
  }, [item.children, pathname, item.key, setMenu]);

  // handle click on sub menu item
  const handleSubItemClick = (sub: MenuItem) => {
    let path = sub.path;
    let query = '';
    if (!path || pathname.includes(path)) return;
    if (sub.query) query = serializeParams(sub.query);
    setSidebarState('expanded');
    if (query) path = `${path}?${query}`;
    navigate(path);
  };

  // handle show float sub menu when sidebar state is collapsed
  const handleMouseEnter = (e: MouseEvent<HTMLLIElement>) => {
    if (state === 'expanded') return;
    const target = e.currentTarget as HTMLLIElement;
    const coords = target.getBoundingClientRect();
    const x = coords.right;
    const y = coords.top;
    setPos({ x, y });
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleFlyoutMouseEnter = () => {
    setFlyoutHovered(true);
  };

  const handleFlyoutMouseLeave = () => {
    setFlyoutHovered(false);
  };

  return (
    <>
      <SidebarMenuItem
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        key={item.key}
        className='relative'
      >
        <SidebarMenuButton
          onClick={() => {
            if (state === 'collapsed') return;
            toggleMenu(item.key);
          }}
          className={cn(
            'hover:bg-sidebar! active:bg-sidebar! mx-auto my-1 min-h-10 cursor-pointer rounded-none pl-8 font-normal whitespace-nowrap text-white transition-all! duration-200! ease-linear! hover:text-white focus-visible:ring-0! active:text-white',
            {
              'opacity-80 hover:opacity-100': !item.children?.find(
                (child) => child.path === pathname
              )
            }
          )}
        >
          {item.icon && <item.icon />}
          {item.label}
          <ChevronDown
            className={cn('ml-auto transition-transform', {
              'rotate-180': open
            })}
          />
        </SidebarMenuButton>
        <AnimatePresence initial={false}>
          {open && state === 'expanded' && !showFlyout && item.children && (
            <motion.div
              key='content'
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className='overflow-hidden'
            >
              <SidebarMenu className={cn({ 'bg-sidebar-active-menu': open })}>
                {item.children.map((sub) =>
                  sub.children ? (
                    <CollapsibleMenuItem key={sub.key} item={sub} />
                  ) : (
                    <SidebarMenuItem key={sub.key}>
                      <SidebarMenuButton
                        className='m-1 min-h-10 rounded-none focus-visible:ring-0!'
                        asChild
                      >
                        <Button
                          variant='ghost'
                          onClick={() => handleSubItemClick(sub)}
                          className={cn(
                            'mx-auto w-[calc(100%-8px)] justify-start rounded-lg pl-12 font-normal text-white transition-all duration-200 ease-linear hover:text-white active:text-white',
                            {
                              'bg-sidebar-item-active hover:bg-sidebar-item-active active:bg-sidebar-item-active':
                                sub.path && pathname.includes(sub.path),
                              'active:bg-sidebar-active-menu hover:bg-sidebar-active-menu opacity-65 hover:opacity-100':
                                sub.path && !pathname.includes(sub.path)
                            }
                          )}
                        >
                          {sub.icon && <sub.icon />}
                          <span>{sub.label}</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </motion.div>
          )}
        </AnimatePresence>

        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
      </SidebarMenuItem>
      {createPortal(
        <AnimatePresence>
          {showFlyout && state === 'collapsed' && item.children && (
            <>
              <motion.div
                key='fly-layout'
                onMouseEnter={handleFlyoutMouseEnter}
                onMouseLeave={handleFlyoutMouseLeave}
                initial={{
                  scale: 0.85,
                  opacity: 0,
                  transformOrigin: 'center left'
                }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.1, ease: 'linear' }}
                style={{ top: pos.y, left: pos.x }}
                className='fixed z-10 w-40 overflow-hidden pl-1'
              >
                <div className='bg-sidebar rounded-lg px-1 py-1'>
                  <SidebarMenu
                    className={cn({ 'bg-sidebar-active-menu': open })}
                  >
                    {item.children.map((sub) =>
                      sub.children ? (
                        <CollapsibleMenuItem key={sub.key} item={sub} />
                      ) : (
                        <SidebarMenuItem key={sub.key}>
                          <SidebarMenuButton
                            className='min-h-10 rounded-none focus-visible:ring-0!'
                            asChild
                          >
                            <Button
                              variant='ghost'
                              onClick={() => {
                                handleSubItemClick(sub);
                                setHovered(false);
                                setFlyoutHovered(false);
                                setSidebarState('collapsed');
                              }}
                              className={cn(
                                'mx-auto w-full justify-start rounded-lg pl-4 font-normal text-white transition-all duration-200 ease-linear hover:text-white active:text-white',
                                {
                                  'bg-sidebar-item-active hover:bg-sidebar-item-active active:bg-sidebar-item-active':
                                    sub.path && pathname.includes(sub.path),
                                  'active:bg-sidebar-active-menu hover:bg-sidebar-active-menu opacity-65 hover:opacity-100':
                                    sub.path && !pathname.includes(sub.path)
                                }
                              )}
                            >
                              {sub.icon && <sub.icon />}
                              <span>{sub.label}</span>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

const renderMenu = (items: MenuItem[]) => {
  return (
    <SidebarMenu>
      {items.map((item) =>
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
  );
};

const AppSidebar = () => {
  const { profile } = useAuth();
  const { hasPermission } = useValidatePermission();
  const [clientMenu, setClientMenu] = useState<MenuItem[]>([]);
  const openLastMenu = useSidebarStore((s) => s.openLastMenu);
  const { state } = useSidebar();

  // handle open last opened menu when sidebar changed state from collapsed -> expanded
  useEffect(() => {
    if (state === 'expanded') {
      openLastMenu();
    }
  }, [state, openLastMenu]);

  const filterMenuByPermission = useCallback(
    (menu: MenuItem[]): MenuItem[] => {
      return menu
        .map((item) => {
          let children: MenuItem[] | undefined;
          if (item.children) {
            children = filterMenuByPermission(item.children);
          }

          const allowed =
            !item.permissionCode ||
            hasPermission({ requiredPermissions: item.permissionCode });

          if (!allowed && (!children || children.length === 0)) return null;

          return { ...item, children };
        })
        .filter(Boolean) as MenuItem[];
    },
    [hasPermission]
  );

  useEffect(() => {
    setClientMenu(filterMenuByPermission(menuConfig));
  }, []);

  if (!clientMenu)
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
  return (
    <Sidebar
      className='**:data-[sidebar="sidebar"]:bg-sidebar group-data-[side=left]:border-none'
      collapsible='icon'
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
                href='/'
                className='block! w-full! transition-all duration-200 ease-linear group-data-[collapsible=icon]:size-full! group-data-[collapsible=icon]:p-0! hover:bg-transparent!'
              >
                {state === 'expanded' ? (
                  <Image
                    src={logoWithText}
                    alt='logo'
                    width={250}
                    height={50}
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

      <SidebarContent className='sidebar-content'>
        <SidebarGroup className='p-0'>
          <SidebarGroupContent>{renderMenu(clientMenu)}</SidebarGroupContent>
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
              icon={
                <CircleUserRound className='size-8 fill-transparent stroke-gray-600 stroke-2' />
              }
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

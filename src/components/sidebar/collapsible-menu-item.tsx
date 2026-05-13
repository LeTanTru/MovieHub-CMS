'use client';

import './sidebar.css';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { m, AnimatePresence } from 'framer-motion';
import { type MouseEvent, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib';
import type { MenuItem } from '@/types';
import { useSidebarStore } from '@/store';
import { useQueryParams } from '@/hooks';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';

type CollapsibleMenuItemProps = { item: MenuItem };

export default function CollapsibleMenuItem({
  item
}: CollapsibleMenuItemProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { serializeParams } = useQueryParams();

  const { storeOpen, toggleMenu, setMenu, setSidebarState } = useSidebarStore(
    useShallow((s) => ({
      storeOpen: s.openMenus[item.key],
      toggleMenu: s.toggleMenu,
      setMenu: s.setMenu,
      setSidebarState: s.setSidebarState
    }))
  );

  const [hovered, setHovered] = useState(false);
  const [flyoutHovered, setFlyoutHovered] = useState(false);
  const showFlyout = hovered || flyoutHovered;
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initial open when reload
  const isInitiallyOpen =
    item.children?.some(
      (child) => child.path && pathname.startsWith(child.path)
    ) ?? false;

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
        (child) => child.path && pathname.startsWith(child.path)
      )
    ) {
      setMenu(item.key, true);
    }
  }, [item.children, pathname, item.key, setMenu]);

  const getSubItemHref = (sub: MenuItem) => {
    if (!sub.path) return null;
    if (!sub.query) return sub.path;
    const query = serializeParams(sub.query);
    return query ? `${sub.path}?${query}` : sub.path;
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
            <m.div
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
                    (() => {
                      const subHref = getSubItemHref(sub);
                      return (
                        <SidebarMenuItem key={sub.key}>
                          <SidebarMenuButton
                            className={cn(
                              'm-1 mx-auto min-h-10 w-[calc(100%-8px)] justify-start rounded-lg pl-12 font-normal text-white transition-all duration-200 ease-linear hover:text-white focus-visible:ring-0! active:text-white',
                              {
                                'bg-sidebar-item-active hover:bg-sidebar-item-active active:bg-sidebar-item-active':
                                  sub.path && pathname.startsWith(sub.path),
                                'active:bg-sidebar-active-menu hover:bg-sidebar-active-menu opacity-65 hover:opacity-100':
                                  sub.path && !pathname.startsWith(sub.path)
                              }
                            )}
                            asChild
                          >
                            <Link
                              href={subHref || '#'}
                              onClick={(e) => {
                                if (!subHref || pathname === sub.path) {
                                  e.preventDefault();
                                  return;
                                }
                                setSidebarState('expanded');
                              }}
                            >
                              {sub.icon && <sub.icon />}
                              <span>{sub.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })()
                  )
                )}
              </SidebarMenu>
            </m.div>
          )}
        </AnimatePresence>

        {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
      </SidebarMenuItem>
      {createPortal(
        <AnimatePresence>
          {showFlyout && state === 'collapsed' && item.children && (
            <>
              <m.div
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
                <div className='bg-sidebar rounded-lg p-1'>
                  <SidebarMenu
                    className={cn({ 'bg-sidebar-active-menu': open })}
                  >
                    {item.children.map((sub) =>
                      sub.children ? (
                        <CollapsibleMenuItem key={sub.key} item={sub} />
                      ) : (
                        (() => {
                          const subHref = getSubItemHref(sub);
                          return (
                            <SidebarMenuItem key={sub.key}>
                              <SidebarMenuButton
                                className={cn(
                                  'mx-auto min-h-10 w-full justify-start rounded-lg pl-4 font-normal text-white transition-all duration-200 ease-linear hover:text-white focus-visible:ring-0! active:text-white',
                                  {
                                    'bg-sidebar-item-active hover:bg-sidebar-item-active active:bg-sidebar-item-active':
                                      sub.path && pathname.startsWith(sub.path),
                                    'active:bg-sidebar-active-menu hover:bg-sidebar-active-menu opacity-65 hover:opacity-100':
                                      sub.path && !pathname.startsWith(sub.path)
                                  }
                                )}
                                asChild
                              >
                                <Link
                                  href={subHref || '#'}
                                  onClick={(e) => {
                                    if (!subHref || pathname === sub.path) {
                                      e.preventDefault();
                                    }
                                    setHovered(false);
                                    setFlyoutHovered(false);
                                    setSidebarState('collapsed');
                                  }}
                                >
                                  {sub.icon && <sub.icon />}
                                  <span>{sub.label}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })()
                      )
                    )}
                  </SidebarMenu>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

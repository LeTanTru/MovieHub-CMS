'use client';

import { AvatarField } from '@/components/form';
import { List, ListItem } from '@/components/list';
import { CircleLoading } from '@/components/loading';
import { queryKeys, storageKeys } from '@/constants';
import {
  useDisclosure,
  useNavigate,
  useQueryParams,
  useClickOutside
} from '@/hooks';
import { logger } from '@/logger';
import { useLogoutMutation } from '@/queries';
import { route } from '@/routes';
import { useAuthStore } from '@/store';
import {
  buildLoginRedirectPath,
  getLastWord,
  notify,
  removeData,
  removeQueries,
  renderImageUrl
} from '@/utils';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function DropdownAvatar() {
  const navigate = useNavigate();
  const pathname = usePathname();

  const {
    opened: openedDropdown,
    toggle: toggleDropDown,
    close: closeDropDown
  } = useDisclosure();

  const dropdownRef = useClickOutside<HTMLDivElement>(() => closeDropDown());

  const { profile, clearState } = useAuthStore(
    useShallow((s) => ({
      profile: s.profile,
      clearState: s.clearState
    }))
  );
  const { queryString } = useQueryParams();
  const { mutate: logout, isPending } = useLogoutMutation();

  const handleAvatarClick = () => {
    toggleDropDown();
  };

  const handleLogout = () => {
    closeDropDown();
    logout(undefined, {
      onSuccess: (res) => {
        if (res.result) {
          notify.success('Đăng xuất thành công');

          removeData(storageKeys.PREVIOUS_PATH);

          removeQueries([queryKeys.PROFILE, queryKeys.EMPLOYEE_PROFILE]);

          clearState();
          navigate.push(buildLoginRedirectPath(pathname, queryString));
        } else {
          notify.error('Đăng xuất thất bại');
        }
      },
      onError: (error) => {
        logger.error('[LOGOUT_ERROR]', error);
        notify.error('Đăng xuất thất bại');
      }
    });
  };

  const handleProfileClick = () => {
    closeDropDown();
  };

  useEffect(() => {
    if (pathname !== route.profile.savePage.path)
      removeData(storageKeys.PREVIOUS_PATH);
  }, [pathname]);

  return (
    <div
      ref={dropdownRef}
      role='button'
      tabIndex={0}
      className='relative z-1 flex items-center gap-4'
      onClick={handleAvatarClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAvatarClick();
        }
      }}
    >
      <div className='flex cursor-pointer items-center gap-2'>
        <AvatarField
          src={renderImageUrl(profile?.avatarPath)}
          disablePreview
          size={40}
          alt={getLastWord(profile?.fullName ?? '')}
        />
        <ChevronDown className='size-5' />
      </div>
      <AnimatePresence>
        {openedDropdown && (
          <m.div
            initial={{ scale: 0.8, opacity: 0, transformOrigin: '75% -20%' }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className='absolute top-full right-0 z-50 mt-4 w-45 rounded bg-white shadow-[0px_0px_10px_8px] shadow-gray-200'
          >
            <div className='z-2 before:absolute before:-top-4 before:left-0 before:h-4 before:w-full before:bg-transparent'></div>
            <div className='absolute -top-2 right-10 border-r-8 border-b-8 border-l-8 border-r-transparent border-b-white border-l-transparent'></div>
            <List className='flex flex-col gap-y-2 p-1'>
              <ListItem>
                <Link
                  onClick={handleProfileClick}
                  data-previous-path={
                    queryString ? `${pathname}?${queryString}` : pathname
                  }
                  href={route.profile.savePage.path}
                  className='flex w-full cursor-pointer items-center gap-2 rounded bg-transparent p-2 text-sm font-normal text-black transition-all duration-200 ease-linear hover:bg-gray-100'
                >
                  <User className='size-5' /> Hồ sơ
                </Link>
              </ListItem>
              <ListItem
                className='flex w-full cursor-pointer items-center gap-2 rounded bg-transparent p-2 text-sm font-normal text-black transition-all duration-200 ease-linear hover:bg-gray-100'
                onClick={handleLogout}
              >
                {isPending ? (
                  <CircleLoading className='stroke-sporty-blue mx-auto size-5' />
                ) : (
                  <>
                    <LogOut className='size-5' /> Đăng xuất
                  </>
                )}
              </ListItem>
            </List>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

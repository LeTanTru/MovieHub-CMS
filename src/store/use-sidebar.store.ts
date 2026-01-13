import type { SidebarStateType } from '@/types';
import { create } from 'zustand';

const useSidebarStore = create<SidebarStateType>((set) => ({
  state: 'expanded',
  openMenus: {},
  lastOpenedMenu: null,

  toggleMenu: (key) =>
    set((state) => {
      const newOpenState = !state.openMenus[key];
      return {
        openMenus: {
          ...state.openMenus,
          [key]: newOpenState
        },
        lastOpenedMenu: newOpenState ? key : state.lastOpenedMenu
      };
    }),

  setMenu: (key, open) =>
    set((state) => ({
      openMenus: {
        ...state.openMenus,
        [key]: open
      },
      lastOpenedMenu: open ? key : state.lastOpenedMenu
    })),

  openLastMenu: () =>
    set((state) => ({
      openMenus: {
        ...state.openMenus,
        ...(state.lastOpenedMenu ? { [state.lastOpenedMenu]: true } : {})
      }
    })),

  setSidebarState: (state: 'expanded' | 'collapsed') => set({ state })
}));

export default useSidebarStore;

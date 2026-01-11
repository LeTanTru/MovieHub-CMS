type SidebarStoreState = {
  state: 'expanded' | 'collapsed';
  openMenus: Record<string, boolean>;
  lastOpenedMenu: string | null;
};

type SidebarStoreActions = {
  toggleMenu: (key: string) => void;
  setMenu: (key: string, open: boolean) => void;
  openLastMenu: () => void;
  setSidebarState: (state: 'expanded' | 'collapsed') => void;
};

export type SidebarStateType = SidebarStoreState & SidebarStoreActions;

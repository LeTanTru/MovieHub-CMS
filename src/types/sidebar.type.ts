type SidebarStoreState = {
  state: 'expanded' | 'collapsed';
  openMenus: Record<string, boolean>;
  lastOpenedMenu: string | null;
  sidebarScrollY: number;
};

type SidebarStoreActions = {
  toggleMenu: (key: string) => void;
  setMenu: (key: string, open: boolean) => void;
  openLastMenu: () => void;
  setSidebarState: (state: 'expanded' | 'collapsed') => void;
  setSidebarScrollY: (y: number) => void;
};

export type SidebarStateType = SidebarStoreState & SidebarStoreActions;

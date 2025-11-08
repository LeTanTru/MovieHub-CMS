export type SidebarStateType = {
  state: 'expanded' | 'collapsed';
  openMenus: Record<string, boolean>;
  lastOpenedMenu: string | null;
  toggleMenu: (key: string) => void;
  setMenu: (key: string, open: boolean) => void;
  openLastMenu: () => void;
  setSidebarState: (state: 'expanded' | 'collapsed') => void;
};

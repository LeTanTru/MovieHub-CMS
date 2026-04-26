import type { AuthStoreType, ProfileResType } from '@/types';
import { create } from 'zustand';

const useAuthStore = create<AuthStoreType>((set) => ({
  profile: null,
  isLoggedOut: false,
  accessToken: null,
  userKind: null,

  setProfile: (profile: ProfileResType | null) => set({ profile }),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  setUserKind: (userKind: string | null) => set({ userKind }),

  clearState: () =>
    set({
      profile: null,
      isLoggedOut: false,
      accessToken: null,
      userKind: null
    })
}));

export default useAuthStore;

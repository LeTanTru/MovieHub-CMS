import type { AuthStoreType, ProfileResType } from '@/types';
import { create } from 'zustand';

export const useAuthStore = create<AuthStoreType>((set) => ({
  accessToken: null,
  csrfToken: null,
  profile: null,
  userKind: null,

  setAccessToken: (accessToken) => set({ accessToken }),
  setCsrfToken: (csrfToken) => set({ csrfToken }),
  setProfile: (profile: ProfileResType | null) => set({ profile }),
  setUserKind: (userKind: string | null) => set({ userKind }),

  clearState: () =>
    set({
      accessToken: null,
      csrfToken: null,
      profile: null,
      userKind: null
    })
}));

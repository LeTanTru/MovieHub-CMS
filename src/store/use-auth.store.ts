import { AuthStoreType, CustomerResType } from '@/types';
import { create } from 'zustand';

const useAuthStore = create<AuthStoreType>((set) => ({
  profile: null,
  isAuthenticated: false,
  loading: true,
  socket: null,

  setProfile: (profile: CustomerResType | null) => set({ profile }),
  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setLoading: (loading: boolean) => set({ loading })
}));

export default useAuthStore;

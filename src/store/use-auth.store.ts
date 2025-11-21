import { AuthStoreType, ProfileResType } from '@/types';
import { Socket } from 'socket.io-client';
import { create } from 'zustand';

const useAuthStore = create<AuthStoreType>((set) => ({
  profile: null,
  isAuthenticated: false,
  loading: true,
  socket: null,
  isLoggedOut: false,

  setProfile: (profile: ProfileResType | null) => set({ profile }),
  setAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setLoading: (loading: boolean) => set({ loading }),
  setIsLoggedOut: (isLoggedOut: boolean) => set({ isLoggedOut }),
  setSocket: (socket: Socket) => set({ socket })
}));

export default useAuthStore;

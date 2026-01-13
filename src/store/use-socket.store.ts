import type { SocketStoreType } from '@/types';
import { create } from 'zustand';

const useSocketStore = create<SocketStoreType>((set) => ({
  socket: null,

  setSocket: (socket) => set({ socket: socket })
}));

export default useSocketStore;

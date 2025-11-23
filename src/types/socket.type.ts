export type SocketStoreType = {
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
};

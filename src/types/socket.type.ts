type SocketStoreState = {
  socket: WebSocket | null;
};

type SocketStoreActions = {
  setSocket: (socket: WebSocket | null) => void;
};

export type SocketStoreType = SocketStoreState & SocketStoreActions;

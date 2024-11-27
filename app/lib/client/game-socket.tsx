import { createContext, useContext } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";

type GameSocket = {
  socket: WebSocketHook;
  send: (data: Record<string, unknown>) => void;
};

const GameSocketContext = createContext<GameSocket | null>(null);

export const useGameSocket = () => {
  const context = useContext(GameSocketContext);
  if (!context) {
    throw new Error("useGameSocket must be used within a GameSocketProvider");
  }
  return context;
};

export const GameSocketProvider = (
  { children }: { children: React.ReactNode },
) => {
  const socket = useWebSocket("/api/ws");

  const send = (data: Record<string, unknown>) => {
    socket.sendJsonMessage(data);
  };

  return (
    <GameSocketContext.Provider value={{ socket, send }}>
      {children}
    </GameSocketContext.Provider>
  );
};

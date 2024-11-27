import { createContext, useContext, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";
import { z } from "zod";

import { type GameData, gameDataSchema } from "~/game/data";

type GameSocket = {
  socket: WebSocketHook;
  gameData: GameData | null;
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

export const GameSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gameData, setGameData] = useState<GameData | null>(null);

  const socket = useWebSocket("/api/ws", {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      const message = z
        .object({
          gameData: gameDataSchema,
        })
        .safeParse(data);
      if (message.success) {
        setGameData(message.data.gameData);
      }
    },
  });

  const send = (data: Record<string, unknown>) => {
    socket.sendJsonMessage(data);
  };

  return (
    <GameSocketContext.Provider value={{ socket, send, gameData }}>
      {children}
    </GameSocketContext.Provider>
  );
};

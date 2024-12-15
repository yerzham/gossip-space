import { createContext, useContext, useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";
import { z } from "zod";

import {
  ChatMessageChunk,
  chatMessageChunkSchema,
  type GameData,
  gameDataSchema,
} from "~/game/data";

type GameSocket = {
  socket: WebSocketHook;
  gameData: GameData | null;
  send: (data: Record<string, unknown>) => void;
  chatMessageEmitter: ChatMessageEmitter;
};

type EventMap = Record<string, any>; // Generic event map

class TypedEventEmitter<Events extends EventMap> {
  private target = new EventTarget();
  private listenerMap = new Map<
    keyof Events,
    Map<(payload: any) => void, EventListener>
  >();

  on<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    let eventListeners = this.listenerMap.get(event);
    if (!eventListeners) {
      eventListeners = new Map();
      this.listenerMap.set(event, eventListeners);
    }

    const wrappedListener: EventListener = (e) => {
      listener((e as CustomEvent<Events[K]>).detail);
    };

    eventListeners.set(listener, wrappedListener);
    this.target.addEventListener(event as string, wrappedListener);
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void
  ): void {
    const eventListeners = this.listenerMap.get(event);
    if (!eventListeners) return;

    const wrappedListener = eventListeners.get(listener);
    if (!wrappedListener) return;

    this.target.removeEventListener(event as string, wrappedListener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const customEvent = new CustomEvent(event as string, { detail: payload });
    this.target.dispatchEvent(customEvent);
  }
}

class ChatMessageEmitter extends TypedEventEmitter<{
  chatMessageChunk: ChatMessageChunk;
}> {
  emitChatMessageChunk(data: ChatMessageChunk) {
    this.emit("chatMessageChunk", data);
  }
}

const GameSocketContext = createContext<GameSocket | null>(null);

export const useGameSocket = ({
  onChatMessageChunk,
}: {
  onChatMessageChunk?: (data: ChatMessageChunk) => void;
} = {}) => {
  const context = useContext(GameSocketContext);
  if (!context) {
    throw new Error("useGameSocket must be used within a GameSocketProvider");
  }

  useEffect(() => {
    if (!onChatMessageChunk) return;
    context.chatMessageEmitter.on("chatMessageChunk", onChatMessageChunk);
    return () => {
      context.chatMessageEmitter.off("chatMessageChunk", onChatMessageChunk);
    };
  }, [context.chatMessageEmitter, onChatMessageChunk]);

  return context;
};

const messageSchema = z
  .object({
    type: z.string(),
    data: z.unknown(),
  })
  .passthrough();

const gameStateUpdateSchema = z.object({
  type: z.literal("gameStateUpdate"),
  data: gameDataSchema,
});

export const GameSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [chatMessageEmitter] = useState(() => new ChatMessageEmitter());

  const socket = useWebSocket("/api/ws", {
    onMessage: (event) => {
      const data = JSON.parse(event.data);

      const message = messageSchema.safeParse(data);
      if (message.success) {
        const { type, data } = message.data;
        if (type === "gameStateUpdate") {
          const gameStateUpdate = gameStateUpdateSchema.safeParse(message.data);
          if (gameStateUpdate.success) {
            setGameData(gameStateUpdate.data.data);
          } else {
            console.error("Invalid game state update", message.data);
          }
        } else if (type === "chatMessageChunk") {
          const chatMessage = chatMessageChunkSchema.safeParse(message.data);
          if (chatMessage.success) {
            chatMessageEmitter.emitChatMessageChunk(chatMessage.data.data);
          } else {
            console.error("Invalid chat message", message.data);
          }
        }
      }
    },
  });

  const send = (data: Record<string, unknown>) => {
    socket.sendJsonMessage(data);
  };

  return (
    <GameSocketContext.Provider
      value={{ socket, send, gameData, chatMessageEmitter }}
    >
      {children}
    </GameSocketContext.Provider>
  );
};

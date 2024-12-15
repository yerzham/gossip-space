import { z } from "zod";
import { world } from "./game/world.ts";
import { chatHistoryStore, ChatMessageChunk, gameData } from "./game/data.ts";
import { chatWithAgent } from "./lib/server/chat.ts";

const MIN_CONVERSATION_DISTANCE = 3;

const isInActiveConversation = (agentId: string) => {
  const convs = gameData.activeConversations.filter((conversation) =>
    conversation.parties.includes(agentId)
  );
  if (convs.length > 0) {
    return convs;
  }
  return false;
};

const exitFromAllConversations = (agentId: string) => {
  gameData.activeConversations = gameData.activeConversations.filter(
    (conversation) => !conversation.parties.includes(agentId)
  );
};

const distanceToPlayer = (agent: (typeof gameData.agnets)[0]) => {
  return Math.sqrt(
    (agent.position.x - gameData.player.position.x) ** 2 +
      (agent.position.y - gameData.player.position.y) ** 2
  );
};

setInterval(() => {
  const { xDim, yDim } = world;
  gameData.agnets = gameData.agnets.map((agent) => {
    const convs = isInActiveConversation(agent.id);
    if (convs) {
      for (const conv of convs) {
        if (conv.parties.includes("player")) {
          const distance = distanceToPlayer(agent);
          if (distance > MIN_CONVERSATION_DISTANCE) {
            exitFromAllConversations(agent.id);
          }
        }
      }
      return agent;
    }
    const x = agent.position.x + Math.random() - 0.5;
    const y = agent.position.y + Math.random() - 0.5;
    return {
      ...agent,
      position: {
        x: Math.min(Math.max(x, -xDim / 2), xDim / 2),
        y: Math.min(Math.max(y, -yDim / 2), yDim / 2),
      },
    };
  });
}, 1000);

const messageSchema = z
  .object({
    type: z.string(),
    data: z.unknown(),
  })
  .passthrough();

const playerPositionUpdateSchema = z.object({
  type: z.literal("playerPosition"),
  data: z.object({
    x: z.number(),
    y: z.number(),
  }),
});
const updatePlayerPosition = (
  data: z.infer<typeof playerPositionUpdateSchema>
) => {
  const { xDim, yDim } = world;
  const {
    data: { x, y },
  } = data;
  gameData.player.position.x = Math.min(Math.max(x, -xDim / 2), xDim / 2);
  gameData.player.position.y = Math.min(Math.max(y, -yDim / 2), yDim / 2);
};

const callForChatSchema = z.object({
  type: z.literal("callForChat"),
  data: z.object({}),
});
const callForChat = (_: z.infer<typeof callForChatSchema>) => {
  isInActiveConversation("player") && exitFromAllConversations("player");
  const closestAgent = gameData.agnets.reduce(
    (
      closest: {
        agent: null | (typeof gameData.agnets)[number];
        distance: number;
      },
      agent
    ) => {
      const distance = distanceToPlayer(agent);
      if (distance < closest.distance) {
        return { agent, distance };
      }
      return closest;
    },
    { agent: null, distance: Infinity }
  );

  if (closestAgent.agent && closestAgent.distance < MIN_CONVERSATION_DISTANCE) {
    if (isInActiveConversation(closestAgent.agent.id)) {
      exitFromAllConversations(closestAgent.agent.id);
    }
    gameData.activeConversations.push({
      parties: [closestAgent.agent.id, "player"],
    });
  }
};

const chatMessageSchema = z.object({
  type: z.literal("chatMessage"),
  data: z.object({
    to: z.string(),
    message: z.string(),
  }),
});
const chunkSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  choices: z.array(
    z.union([
      z.object({
        index: z.number(),
        delta: z.object({ content: z.string() }),
        finish_reason: z.null(),
      }),
      z.object({
        index: z.number(),
        delta: z.object({}),
        finish_reason: z.string(),
      }),
    ])
  ),
});
const chatMessage = async (
  data: z.infer<typeof chatMessageSchema>,
  socket: WebSocket
) => {
  const {
    data: { to, message },
  } = data;
  const chatHistory = chatHistoryStore.chats.get(
    ["player", to].sort().join("-")
  );

  const stream = await chatWithAgent({
    message,
    to,
    chatHistory: chatHistory ?? [],
  });

  updateChatHistoryWithChunk({
    streamId: crypto.randomUUID(),
    from: "player",
    to,
    message: message,
    ended: true,
  });
  for await (const chunk of stream) {
    const res = chunkSchema.safeParse(chunk);
    if (!res.success) {
      console.error(res.error);
      stream.controller.abort();
      return;
    }
    const message = res.data.choices[0];
    const messageChunk = {
      streamId: res.data.id,
      from: to,
      to: "player",
      message: "content" in message.delta ? message.delta.content : "",
      ended: message.finish_reason !== null,
    };
    updateChatHistoryWithChunk(messageChunk);
    socket.send(
      JSON.stringify({
        type: "chatMessageChunk",
        data: messageChunk,
      })
    );
  }
};

const updateChatHistoryWithChunk = (chatMessageChunk: ChatMessageChunk) => {
  const chatId = [chatMessageChunk.to, chatMessageChunk.from].sort().join("-");
  const chatHistory = chatHistoryStore.chats.get(chatId);
  if (chatHistory) {
    const messageIndex = chatHistory.findIndex(
      (message) => message.id === chatMessageChunk.streamId
    );
    const newChatHistory = chatHistory.slice();
    if (messageIndex !== -1) {
      newChatHistory[messageIndex] = {
        ...newChatHistory[messageIndex],
        message: newChatHistory[messageIndex].message + chatMessageChunk.message,
      };
    } else {
      newChatHistory.push({
        id: chatMessageChunk.streamId,
        from: chatMessageChunk.from,
        to: chatMessageChunk.to,
        message: chatMessageChunk.message,
      });
    }
    chatHistoryStore.chats.set(chatId, newChatHistory);
  } else {
    chatHistoryStore.chats.set(chatId, [
      {
        id: chatMessageChunk.streamId,
        from: chatMessageChunk.from,
        to: chatMessageChunk.to,
        message: chatMessageChunk.message,
      },
    ]);
  }
};

const messageHandler = (
  message: z.infer<typeof messageSchema>,
  socket: WebSocket
) => {
  switch (message.type) {
    case "playerPosition":
      updatePlayerPosition(playerPositionUpdateSchema.parse(message));
      break;
    case "callForChat":
      callForChat(callForChatSchema.parse(message));
      break;
    case "chatMessage":
      chatMessage(chatMessageSchema.parse(message), socket);
      break;
    default:
      break;
  }
};

export const wssHandler = (req: Request) => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    let sendInterval: NodeJS.Timeout | number;

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ message: "Hello from the server!" }));

      sendInterval = setInterval(() => {
        socket.send(
          JSON.stringify({ type: "gameStateUpdate", data: gameData })
        );
      }, 100);
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      try {
        const message = messageSchema.parse(data);
        messageHandler(message, socket);
      } catch (error) {
        console.error(error);
      }
    });

    socket.addEventListener("close", () => {
      // @ts-ignore Deno expects a number only
      clearInterval(sendInterval);
    });

    return response;
  }

  return null;
};

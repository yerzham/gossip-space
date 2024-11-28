import { z } from "zod";
import { world } from "./game/world.ts";
import { gameData } from "./game/data.ts";

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

const messageHandler = (message: z.infer<typeof messageSchema>) => {
  switch (message.type) {
    case "playerPosition":
      updatePlayerPosition(playerPositionUpdateSchema.parse(message));
      break;
    case "callForChat":
      callForChat(callForChatSchema.parse(message));
      break;
    default:
      break;
  }
};

export const wssHandler = (req: Request) => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    let sendInterval: NodeJS.Timeout;

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ message: "Hello from the server!" }));

      sendInterval = setInterval(() => {
        socket.send(JSON.stringify({ gameData }));
      }, 100);
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      try {
        const message = messageSchema.parse(data);
        messageHandler(message);
      } catch (error) {
        console.error(error);
      }
    });

    socket.addEventListener("close", () => {
      clearInterval(sendInterval);
    });

    return response;
  }

  return null;
};

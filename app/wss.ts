import { z } from "zod";
import { world } from "./game/world.ts";
import { gameData } from "./game/data.ts";

setInterval(() => {
  const { xDim, yDim } = world;
  gameData.agnets = gameData.agnets.map((agent) => {
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
  data: z.infer<typeof playerPositionUpdateSchema>,
) => {
  const { xDim, yDim } = world;
  const {
    data: { x, y },
  } = data;
  gameData.player.position.x = Math.min(Math.max(x, -xDim / 2), xDim / 2);
  gameData.player.position.y = Math.min(Math.max(y, -yDim / 2), yDim / 2);
};

const messageHandler = (message: z.infer<typeof messageSchema>) => {
  switch (message.type) {
    case "playerPosition":
      updatePlayerPosition(playerPositionUpdateSchema.parse(message));
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

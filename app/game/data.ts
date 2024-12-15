import { z } from "zod";
import { world } from "./world.ts";

export const gameDataSchema = z.object({
  player: z.object({
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
  }),
  agnets: z.array(
    z.object({
      id: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    })
  ),
  activeConversations: z.array(
    z.object({
      parties: z.array(z.string()),
    })
  ),
});

export type GameData = z.infer<typeof gameDataSchema>;

export const gameData: GameData = {
  player: {
    position: { x: 0, y: 0 },
  },
  agnets: [],
  activeConversations: [],
};

function generateRandomAgents() {
  const agents = [];
  for (let i = 0; i < 10; i++) {
    agents.push({
      id: i.toString(),
      position: {
        x: Math.random() * world.xDim - world.xDim / 2,
        y: Math.random() * world.yDim - world.yDim / 2,
      },
    });
  }
  return agents;
}

gameData.agnets = generateRandomAgents();

const chatHistorySchema = z.array(
  z.object({ id: z.string(), from: z.string(), to: z.string(), message: z.string() })
);

const chatHistoryStoreSchema = z.object({
  chats: z.map(
    z.string(),
    chatHistorySchema
  ),
});

export type ChatHistoryStore = z.infer<typeof chatHistoryStoreSchema>;
export type ChatHistory = z.infer<typeof chatHistorySchema>;

export const chatHistoryStore: ChatHistoryStore = {
  chats: new Map(),
};

export const chatMessageChunkSchema = z.object({
  type: z.literal("chatMessageChunk"),
  data: z.object({
    streamId: z.string(),
    from: z.string(),
    to: z.string(),
    message: z.string(),
    ended: z.boolean(),
  }),
});
export type ChatMessageChunk = z.infer<typeof chatMessageChunkSchema>["data"];

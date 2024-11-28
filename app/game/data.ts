import { z } from "zod";

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
  agnets: [
    {
      id: "1",
      position: { x: 1, y: 1 },
    },
    {
      id: "2",
      position: { x: -1, y: -1 },
    },
  ],
  activeConversations: [],
};

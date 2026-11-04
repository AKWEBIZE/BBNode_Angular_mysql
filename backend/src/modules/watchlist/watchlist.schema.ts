import { z } from 'zod';

export const watchListRequestSchema = z.object({
  buyerId: z.string().uuid().nullish(),
  productId: z.string().uuid().nullish(),
  productName: z.string().nullish(),
});

export type WatchListRequest = z.infer<typeof watchListRequestSchema>;

import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { parsePageable } from '../../common/pagination';
import { watchListRequestSchema } from './watchlist.schema';
import {
  addProductWatchList,
  filterWatchList,
  getSavedProductIds,
  removeFromWatchList,
} from './watchlist.service';

export const watchListRouter = Router();

watchListRouter.post(
  '/add',
  asyncHandler(async (req, res) => {
    res.json(await addProductWatchList(watchListRequestSchema.parse(req.body)));
  }),
);

watchListRouter.post(
  '/filter',
  asyncHandler(async (req, res) => {
    res.json(await filterWatchList(watchListRequestSchema.parse(req.body), parsePageable(req)));
  }),
);

// The two routes below are additions; the Angular app calls them but the Java
// backend never implemented them.
const removeQuery = z.object({
  buyerId: z.string().uuid(),
  productId: z.string().uuid(),
});

watchListRouter.delete(
  '/remove',
  asyncHandler(async (req, res) => {
    const { buyerId, productId } = removeQuery.parse(req.query);
    res.json(await removeFromWatchList(buyerId, productId));
  }),
);

watchListRouter.get(
  '/ids',
  asyncHandler(async (req, res) => {
    const buyerId = z.string().uuid().parse(req.query.buyerId);
    res.json(await getSavedProductIds(buyerId));
  }),
);

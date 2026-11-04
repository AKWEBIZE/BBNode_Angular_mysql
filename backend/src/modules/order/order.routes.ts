import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { parsePageable } from '../../common/pagination';
import { buyerOrderFilterSchema, buyerOrderRequestSchema, buyerOrderStatus } from './order.schema';
import {
  getOrder,
  getOrderBasedOnBuyer,
  getOrderStatusCount,
  saveOrder,
  updateOrderStatus,
} from './order.service';

export const buyerOrderRouter = Router();

buyerOrderRouter.post(
  '/save',
  asyncHandler(async (req, res) => {
    res.json(await saveOrder(buyerOrderRequestSchema.parse(req.body)));
  }),
);

buyerOrderRouter.post(
  '/filter',
  asyncHandler(async (req, res) => {
    res.json(await getOrderBasedOnBuyer(buyerOrderFilterSchema.parse(req.body), parsePageable(req)));
  }),
);

// Declared before /:orderId so the literal segments are not captured by it.
buyerOrderRouter.get(
  '/status/count',
  asyncHandler(async (req, res) => {
    const buyerId = z.string().uuid().optional().parse(req.query.buyerId ?? undefined);
    res.json(await getOrderStatusCount(buyerId));
  }),
);

buyerOrderRouter.put(
  '/update/status/:orderId',
  asyncHandler(async (req, res) => {
    const orderId = z.string().uuid().parse(req.params.orderId);
    // Java read the status as a request parameter; a body value is also accepted.
    const status = buyerOrderStatus.parse(req.query.status ?? req.body?.status);
    res.json(await updateOrderStatus(orderId, status));
  }),
);

buyerOrderRouter.get(
  '/:orderId',
  asyncHandler(async (req, res) => {
    res.json(await getOrder(z.string().uuid().parse(req.params.orderId)));
  }),
);

import type { BuyerOrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../common/errors';
import { escapeForLike, isBlank } from '../../common/criteria';
import { pagedModel, type Pageable, type PagedModel } from '../../common/pagination';
import {
  BUYER_ORDER_BEAN,
  toBuyerOrderResponse,
  toBuyerOrderResponseList,
  type BuyerOrderResponse,
} from './order.assembler';
import type { BuyerOrderFilterRequest, BuyerOrderRequest } from './order.schema';

const STATUS_UPDATED = 'Status updated successfully';

const withRelations = {
  buyer: true,
  products: { include: { varieties: true } },
} as const;

/** Java: BuyerOrderServiceImpl.saveOrder */
export async function saveOrder(req: BuyerOrderRequest): Promise<BuyerOrderResponse> {
  const buyer = await prisma.buyer.findUnique({ where: { id: req.buyerId } });
  if (!buyer) {
    throw new NotFoundError(`Buyer id '${req.buyerId}' not found`);
  }

  const order = await prisma.buyerOrder.create({
    data: {
      orderDate: req.orderDate ?? null,
      billingCompanyName: req.billingCompanyName ?? null,
      quantity: req.quantity ?? null,
      shippingName: req.shippingName ?? null,
      paymentMethod: req.paymentMethod ?? null,
      estimationDateOfArrival: req.estimationDateOfArrival ?? null,
      buyer: { connect: { id: req.buyerId } },
      // Java passed the ids straight to findAllByIdIsIn, silently dropping any
      // that did not exist. connect throws instead, so a bad id is reported.
      products: req.productIds.length ? { connect: req.productIds.map((id) => ({ id })) } : undefined,
    },
    include: withRelations,
  });

  return toBuyerOrderResponse(order);
}

/** Java: BuyerOrderServiceImpl.getBuyer */
export async function getOrder(orderId: string): Promise<BuyerOrderResponse> {
  const order = await prisma.buyerOrder.findUnique({
    where: { id: orderId },
    include: withRelations,
  });
  if (!order) {
    throw new NotFoundError(`Order id '${orderId}' not found`);
  }
  return toBuyerOrderResponse(order);
}

/**
 * Java: BuyerOrderServiceImpl.getOrderBasedOnBuyer.
 *
 * Two filter bugs are corrected here, both of which made the filter unusable:
 *  - shippingName built its LIKE pattern as `" % " + text + "%"`, with literal
 *    spaces around the leading wildcard, so it matched almost nothing;
 *  - buyerName ran escapeForLike over the value and then compared with equals,
 *    so any name containing _ or % gained a backslash and never matched.
 */
export async function getOrderBasedOnBuyer(
  filter: BuyerOrderFilterRequest,
  pageable: Pageable,
): Promise<PagedModel<BuyerOrderResponse>> {
  const where: Prisma.BuyerOrderWhereInput = {};

  if (!isBlank(filter.buyerName)) {
    // Java compared for equality on the buyer's name, not a partial match.
    where.buyer = { name: filter.buyerName as string };
  }

  if (filter.buyerId) {
    where.buyerId = filter.buyerId;
  }

  if (filter.orderId) {
    where.id = filter.orderId;
  }

  if (!isBlank(filter.shippingName)) {
    where.shippingName = { contains: escapeForLike(filter.shippingName as string) };
  }

  // Declared on the filter bean but never applied in the Java criteria.
  if (!isBlank(filter.billingCompanyName)) {
    where.billingCompanyName = { contains: escapeForLike(filter.billingCompanyName as string) };
  }

  const [rows, total] = await Promise.all([
    prisma.buyerOrder.findMany({
      where,
      include: withRelations,
      // Java built the PageRequest with no Sort, so order was unspecified.
      // Newest first gives the stable ordering the order list needs.
      orderBy: { createdAt: 'desc' },
      skip: pageable.page * pageable.size,
      take: pageable.size,
    }),
    prisma.buyerOrder.count({ where }),
  ]);

  return pagedModel(BUYER_ORDER_BEAN, toBuyerOrderResponseList(rows), total, pageable);
}

/** Java: BuyerOrderServiceImpl.updateOrderStatus */
export async function updateOrderStatus(
  orderId: string,
  status: BuyerOrderStatus,
): Promise<Record<string, string>> {
  const order = await prisma.buyerOrder.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new NotFoundError(`Order id '${orderId}' not found`);
  }

  await prisma.buyerOrder.update({ where: { id: orderId }, data: { status } });
  return { message: STATUS_UPDATED };
}

export interface BuyerOrdersCount {
  buyerOrderStatusCounts: Partial<Record<BuyerOrderStatus, number>>;
  TotalOrders: number;
}

/**
 * Java: BuyerOrderServiceImpl.getOrderStatusCount. The response key keeps its
 * capital T, as the Java field was named TotalOrders.
 */
export async function getOrderStatusCount(buyerId?: string): Promise<BuyerOrdersCount> {
  const grouped = await prisma.buyerOrder.groupBy({
    by: ['status'],
    where: buyerId ? { buyerId } : undefined,
    _count: { _all: true },
  });

  const counts: Partial<Record<BuyerOrderStatus, number>> = {};
  let total = 0;

  for (const row of grouped) {
    // Orders created before a status was set group under null; Java's query
    // returned those too, keyed by a null status.
    if (row.status !== null) {
      counts[row.status] = row._count._all;
    }
    total += row._count._all;
  }

  return { buyerOrderStatusCounts: counts, TotalOrders: total };
}

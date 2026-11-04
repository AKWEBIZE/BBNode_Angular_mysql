import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { BadRequestError, NotFoundError } from '../../common/errors';
import { escapeForLike } from '../../common/criteria';
import { pagedModel, type Pageable, type PagedModel } from '../../common/pagination';
import {
  WATCH_LIST_BEAN,
  toWatchListResponseList,
  type WatchListResponse,
} from './watchlist.assembler';
import type { WatchListRequest } from './watchlist.schema';

const WATCH_LIST_ADDED = 'Watch list added successfully';
const WATCH_LIST_REMOVED = 'Watch list removed successfully';

const withProduct = { product: { include: { varieties: true } } } as const;

/** Java: WatchListServiceImpl.addProductWatchList */
export async function addProductWatchList(
  req: WatchListRequest,
): Promise<Record<string, string>> {
  if (!req.productId) {
    throw new BadRequestError('productId is required');
  }

  const product = await prisma.product.findUnique({ where: { id: req.productId } });
  if (!product) {
    throw new NotFoundError(`Product id '${req.productId}' not found`);
  }

  // Java inserted unconditionally, so saving the same product twice created
  // duplicate rows. Kept idempotent instead — the frontend's heart toggle
  // relies on one row per buyer and product.
  const existing = await prisma.watchList.findFirst({
    where: { buyerId: req.buyerId ?? null, productId: req.productId },
  });

  if (!existing) {
    await prisma.watchList.create({
      data: { buyerId: req.buyerId ?? null, productId: req.productId },
    });
  }

  return { message: WATCH_LIST_ADDED };
}

/** Java: WatchListServiceImpl.filterWatchList */
export async function filterWatchList(
  req: WatchListRequest,
  pageable: Pageable,
): Promise<PagedModel<WatchListResponse>> {
  const where: Prisma.WatchListWhereInput = { buyerId: req.buyerId ?? null };

  if (req.buyerId && req.productName) {
    where.product = { productName: { contains: escapeForLike(req.productName) } };
  }

  const [rows, total] = await Promise.all([
    prisma.watchList.findMany({
      where,
      include: withProduct,
      skip: pageable.page * pageable.size,
      take: pageable.size,
    }),
    prisma.watchList.count({ where }),
  ]);

  return pagedModel(WATCH_LIST_BEAN, toWatchListResponseList(rows), total, pageable);
}

/**
 * Not present in the Java backend — the Angular WatchListService calls
 * DELETE /watch-list/remove, so the endpoint is added here.
 */
export async function removeFromWatchList(
  buyerId: string,
  productId: string,
): Promise<Record<string, string>> {
  await prisma.watchList.deleteMany({ where: { buyerId, productId } });
  return { message: WATCH_LIST_REMOVED };
}

/**
 * Not present in the Java backend — the Angular WatchListService calls
 * GET /watch-list/ids to decide which products show as saved.
 */
export async function getSavedProductIds(buyerId: string): Promise<string[]> {
  const rows = await prisma.watchList.findMany({
    where: { buyerId, productId: { not: null } },
    select: { productId: true },
  });
  return rows.map((r) => r.productId).filter((id): id is string => id !== null);
}

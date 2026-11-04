import type { WatchList } from '@prisma/client';
import {
  toProductResponse,
  type ProductResponse,
  type ProductWithVarieties,
} from '../product/product.assembler';

export type WatchListWithProduct = WatchList & { product?: ProductWithVarieties | null };

/** Java: WatchListAssembler.buildModel */
export interface WatchListResponse {
  buyerId: string | null;
  // Declared as UUID in the Java bean and never populated, so always null.
  buyerName: string | null;
  productResponseBeans: ProductResponse | null;
}

export function toWatchListResponse(entity: WatchListWithProduct): WatchListResponse {
  return {
    buyerId: entity.buyerId,
    buyerName: null,
    // Java called productAssembler.toModel unguarded, so a watch-list row whose
    // product had been deleted threw a NullPointerException.
    productResponseBeans: entity.product ? toProductResponse(entity.product) : null,
  };
}

export function toWatchListResponseList(entities: WatchListWithProduct[]): WatchListResponse[] {
  return entities.map(toWatchListResponse);
}

export const WATCH_LIST_BEAN = 'watchListResponseBean';

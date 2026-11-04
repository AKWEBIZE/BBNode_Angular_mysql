import type { Product, Variety } from '@prisma/client';
import { toVarietyResponseList, type VarietyResponse } from '../varieties/varieties.assembler';

export type ProductWithVarieties = Product & { varieties?: Variety[] };

/**
 * Java: ProductAssembler.buildModel.
 *
 * Note the bean omits `quantity` — the entity has it, but the response never
 * carried it, so it is left out here too.
 */
export interface ProductResponse {
  productId: string;
  productName: string | null;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  image_url: string | null;
  // Listing detail the buyer pages read; null until a seller supplies it.
  country: string | null;
  location: string | null;
  productTag: string | null;
  inStock: boolean | null;
  farmerInfo: string | null;
  varietiesList?: VarietyResponse[];
}

export function toProductResponse(entity: ProductWithVarieties): ProductResponse {
  const response: ProductResponse = {
    productId: entity.id,
    productName: entity.productName,
    category: entity.category,
    subcategory: entity.subcategory,
    description: entity.description,
    image_url: entity.image_url,
    country: entity.country,
    location: entity.location,
    productTag: entity.productTag,
    inStock: entity.inStock,
    farmerInfo: entity.farmerInfo,
  };

  // Java only set varietiesList when the set was non-empty, leaving it null otherwise.
  if (entity.varieties && entity.varieties.length > 0) {
    response.varietiesList = toVarietyResponseList(entity.varieties);
  }

  return response;
}

export function toProductResponseList(entities: ProductWithVarieties[]): ProductResponse[] {
  return entities.map(toProductResponse);
}

export const PRODUCT_BEAN = 'productResponseBean';

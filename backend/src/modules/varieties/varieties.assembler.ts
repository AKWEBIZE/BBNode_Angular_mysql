import type { Variety } from '@prisma/client';

/** Java: VarietiesAssembler.buildModel */
export interface VarietyResponse {
  varietyId: string;
  varietyName: string | null;
  description: string | null;
  imageUrl: string | null;
  origin: string | null;
  grower: string | null;
  growingMethod: string | null;
  harvestDate: Date | null;
  harvestSeason: string | null;
  quality: string | null;
  color: string | null;
  size: string | null;
  price_per_unit: string | null;
  availability: string | null;
  certifications: string | null;
}

export function toVarietyResponse(entity: Variety): VarietyResponse {
  return {
    varietyId: entity.id,
    varietyName: entity.varietyName,
    description: entity.description,
    imageUrl: entity.imageUrl,
    origin: entity.origin,
    grower: entity.grower,
    growingMethod: entity.growingMethod,
    harvestDate: entity.harvestDate,
    harvestSeason: entity.harvestSeason,
    quality: entity.quality,
    color: entity.color,
    size: entity.size,
    price_per_unit: entity.price_per_unit,
    availability: entity.availability,
    certifications: entity.certifications,
  };
}

export function toVarietyResponseList(entities: Variety[]): VarietyResponse[] {
  return entities.map(toVarietyResponse);
}

export const VARIETY_BEAN = 'varietiesResponseBean';

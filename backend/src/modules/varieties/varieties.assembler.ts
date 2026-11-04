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
  // Trade detail the buyer pages read; null until a seller supplies it.
  grade: string | null;
  packingType: string | null;
  packingDetail: string | null;
  moq: number | null;
  availableQuantity: number | null;
  priceMin: number | null;
  priceMax: number | null;
  paymentTerms: string | null;
  deliveryTimeDays: string | null;
  moistureContent: string | null;
  processingType: string | null;
}

/** Prisma returns Decimal for money columns; the frontend expects numbers. */
function toNumber(value: { toNumber(): number } | null): number | null {
  return value === null ? null : value.toNumber();
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
    grade: entity.grade,
    packingType: entity.packingType,
    packingDetail: entity.packingDetail,
    moq: entity.moq,
    availableQuantity: entity.availableQuantity,
    priceMin: toNumber(entity.priceMin),
    priceMax: toNumber(entity.priceMax),
    paymentTerms: entity.paymentTerms,
    deliveryTimeDays: entity.deliveryTimeDays,
    moistureContent: entity.moistureContent,
    processingType: entity.processingType,
  };
}

export function toVarietyResponseList(entities: Variety[]): VarietyResponse[] {
  return entities.map(toVarietyResponse);
}

export const VARIETY_BEAN = 'varietiesResponseBean';

import { z } from 'zod';

/** Accepts ISO strings and epoch numbers, as Jackson did for java.util.Date. */
const dateLike = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((v) => {
    if (v === null || v === undefined || v === '') return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const varietyRequestSchema = z.object({
  productId: z.string().uuid().nullish(),
  varietyName: z.string().nullish(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  origin: z.string().nullish(),
  grower: z.string().nullish(),
  growingMethod: z.string().nullish(),
  harvestDate: dateLike,
  harvestSeason: z.string().nullish(),
  quality: z.string().nullish(),
  color: z.string().nullish(),
  size: z.string().nullish(),
  price_per_unit: z.string().nullish(),
  availability: z.string().nullish(),
  certifications: z.string().nullish(),
  grade: z.string().nullish(),
  packingType: z.string().nullish(),
  packingDetail: z.string().nullish(),
  moq: z.coerce.number().int().nullish(),
  availableQuantity: z.coerce.number().int().nullish(),
  priceMin: z.coerce.number().nullish(),
  priceMax: z.coerce.number().nullish(),
  paymentTerms: z.string().nullish(),
  deliveryTimeDays: z.string().nullish(),
  moistureContent: z.string().nullish(),
  processingType: z.string().nullish(),
});

export const addVarietiesSchema = z.array(varietyRequestSchema);

export const varietiesFilterSchema = z.object({
  productId: z.string().uuid().nullish(),
  varietyName: z.string().nullish(),
});

export type VarietyRequest = z.infer<typeof varietyRequestSchema>;
export type VarietiesFilterRequest = z.infer<typeof varietiesFilterSchema>;

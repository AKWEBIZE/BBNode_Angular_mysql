import { z } from 'zod';
import { varietyRequestSchema } from '../varieties/varieties.schema';

/** JPA used BigInteger, so accept digit strings as well as safe integers. */
const bigIntegerLike = z
  .union([z.string().regex(/^-?\d+$/), z.number().int()])
  .nullish()
  .transform((v) => (v === null || v === undefined ? null : String(v)));

export const productRequestSchema = z.object({
  productName: z.string().nullish(),
  category: z.string().nullish(),
  subcategory: z.string().nullish(),
  description: z.string().nullish(),
  image_url: z.string().nullish(),
  quantity: bigIntegerLike,
  varietiesRequestBeanList: z.array(varietyRequestSchema).nullish(),
});

export const addProductSchema = z.array(productRequestSchema);

export const productFilterSchema = z.object({
  productName: z.string().nullish(),
  category: z.string().nullish(),
  varieties: z.string().nullish(),
  authenticationType: z.string().nullish(),
});

export type ProductRequest = z.infer<typeof productRequestSchema>;
export type ProductFilterRequest = z.infer<typeof productFilterSchema>;

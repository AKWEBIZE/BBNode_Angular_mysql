import { z } from 'zod';

export const buyerOrderStatus = z.enum(['IN_TRANSIT', 'CANCELLED', 'RETURNED', 'DELIVERED']);

const dateLike = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((v) => {
    if (v === null || v === undefined || v === '') return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const buyerOrderRequestSchema = z.object({
  orderDate: dateLike,
  paymentMethod: z.string().nullish(),
  billingCompanyName: z.string().nullish(),
  quantity: z.string().nullish(),
  shippingName: z.string().nullish(),
  // Declared @Temporal in JPA but typed String, so it stays a string.
  estimationDateOfArrival: z.string().nullish(),
  buyerName: z.string().nullish(),
  buyerId: z.string().uuid(),
  productIds: z.array(z.string().uuid()).default([]),
});

export const buyerOrderFilterSchema = z.object({
  billingCompanyName: z.string().nullish(),
  shippingName: z.string().nullish(),
  buyerName: z.string().nullish(),
  buyerId: z.string().uuid().nullish(),
  orderId: z.string().uuid().nullish(),
});

export type BuyerOrderRequest = z.infer<typeof buyerOrderRequestSchema>;
export type BuyerOrderFilterRequest = z.infer<typeof buyerOrderFilterSchema>;
export type BuyerOrderStatus = z.infer<typeof buyerOrderStatus>;

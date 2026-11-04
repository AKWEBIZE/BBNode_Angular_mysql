import type { Buyer, BuyerOrder, BuyerOrderStatus } from '@prisma/client';
import {
  toProductResponse,
  type ProductResponse,
  type ProductWithVarieties,
} from '../product/product.assembler';

export type BuyerOrderWithRelations = BuyerOrder & {
  buyer?: Buyer | null;
  products?: ProductWithVarieties[];
};

/** Java: BuyerInfoBean, as embedded in the order response (no message field). */
export interface OrderBuyerInfo {
  buyerId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

/** Java: BuyerOrderAssembler.buildModel */
export interface BuyerOrderResponse {
  orderId: string;
  orderDate: Date | null;
  paymentMethod: string | null;
  billingCompanyName: string | null;
  quantity: string | null;
  shippingName: string | null;
  estimationDateOfArrival: string | null;
  buyerInfoBean: OrderBuyerInfo | null;
  productResponseBeanSet: ProductResponse[];
  orderStatus: BuyerOrderStatus | null;
}

export function toBuyerOrderResponse(entity: BuyerOrderWithRelations): BuyerOrderResponse {
  return {
    orderId: entity.id,
    orderDate: entity.orderDate,
    paymentMethod: entity.paymentMethod,
    billingCompanyName: entity.billingCompanyName,
    quantity: entity.quantity,
    shippingName: entity.shippingName,
    estimationDateOfArrival: entity.estimationDateOfArrival,
    // Java dereferenced getBuyerEntity() unguarded, so an order with no buyer
    // threw a NullPointerException.
    buyerInfoBean: entity.buyer
      ? {
          buyerId: entity.buyer.id,
          name: entity.buyer.name,
          email: entity.buyer.email,
          phone: entity.buyer.phone,
        }
      : null,
    // Java used a HashSet; serialised as a JSON array either way.
    productResponseBeanSet: (entity.products ?? []).map(toProductResponse),
    orderStatus: entity.status,
  };
}

export function toBuyerOrderResponseList(
  entities: BuyerOrderWithRelations[],
): BuyerOrderResponse[] {
  return entities.map(toBuyerOrderResponse);
}

export const BUYER_ORDER_BEAN = 'buyerOrderResponseBean';

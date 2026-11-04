// Backend BuyerOrderStatusEnum. PROCESSING/SHIPPED are the new real values (added alongside this
// page); IN_TRANSIT is kept server-side only for orders saved before that change.
export type BackendOrderStatus = 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'CANCELLED' | 'RETURNED' | 'DELIVERED';

// UI-level status shown in tabs/badges/stepper.
export type UiOrderStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';

export interface OrderVariety {
  varietyName?: string;
}

export interface OrderProduct {
  productId: string;
  productName: string;
  category?: string;
  location?: string;
  country?: string;
  varietiesList?: OrderVariety[];
}

export interface BuyerInfo {
  name?: string;
  email?: string;
}

export interface OrderDocument {
  documentName: string;
  fileSizeKb: number;
}

export interface BuyerOrder {
  orderId: string;
  orderNumber?: string;
  orderDate: string;
  paymentMethod?: string;
  billingCompanyName?: string;
  quantity?: string;
  shippingName?: string;
  estimationDateOfArrival?: string | null;
  orderStatus: BackendOrderStatus;
  grade?: string | null;
  buyerInfoBean?: BuyerInfo;
  productResponseBeanSet?: OrderProduct[];

  // Real once populated by the backend (see order-mock.util.ts for the fallback while empty).
  amount?: number | null;
  portOfLoading?: string | null;
  portOfDischarge?: string | null;
  shippingLine?: string | null;
  vessel?: string | null;
  estimatedDeparture?: string | null;
  paymentTerms?: string | null;
  paymentStatus?: PaymentStatus | null;
  paidAmount?: number | null;
  balanceAmount?: number | null;
  processingDate?: string | null;
  shippedDate?: string | null;
  deliveredDate?: string | null;
  documents?: OrderDocument[] | null;
}

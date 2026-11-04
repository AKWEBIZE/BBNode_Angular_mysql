import { BuyerOrder } from './buyer-order.model';

/**
 * The backend (BuyerOrderEntity/BuyerOrderResponseBean) now has real columns for all of this —
 * amount, shipping details, payment breakdown, documents, and status-transition dates. But
 * historical orders saved before those columns existed will have them null, and there's still no
 * order-creation flow that populates amount/shipping/payment/documents for *new* orders either.
 *
 * The mock* functions below are the fallback generator for when a field is null. The resolve*
 * functions are what components should actually call — they use the real value when present and
 * only fall back to a mock (seeded off orderId, so it stays stable across re-renders) otherwise.
 */

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h >>> 8) / 0xffffff;
  };
}

export function mockAmount(order: BuyerOrder): number {
  const rand = seededRandom(order.orderId);
  return Math.round((20000 + rand() * 60000) / 50) * 50;
}

export interface MockShippingDetails {
  portOfLoading: string;
  portOfDischarge: string;
  shippingLine: string;
  vessel: string;
  estimatedDeparture: string;
  estimatedArrival: string | null;
}

export function mockShippingDetails(order: BuyerOrder): MockShippingDetails {
  const rand = seededRandom(order.orderId + '-ship');
  const origins = ['Nhava Sheva (JNPT)', 'Chennai Port', 'Mundra Port', 'Cochin Port'];
  const destinations = ['Jebel Ali, UAE', 'Rotterdam, NL', 'Singapore', 'Hamburg, DE'];
  const lines = ['Maersk Line', 'MSC', 'CMA CGM', 'Hapag-Lloyd'];
  const vesselNames = ['Horizon', 'Voyager', 'Pacific', 'Atlantic'];

  const placed = new Date(order.orderDate);
  const departure = new Date(placed.getTime() + 3 * 24 * 60 * 60 * 1000);

  return {
    portOfLoading: origins[Math.floor(rand() * origins.length)],
    portOfDischarge: destinations[Math.floor(rand() * destinations.length)],
    shippingLine: lines[Math.floor(rand() * lines.length)],
    vessel: `MV ${vesselNames[Math.floor(rand() * vesselNames.length)]} ${100 + Math.floor(rand() * 900)}`,
    estimatedDeparture: departure.toISOString(),
    estimatedArrival: order.estimationDateOfArrival || null,
  };
}

export interface MockPaymentDetails {
  paymentTerms: string;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  paidPercentage: number;
  paidAmount: number;
  balanceAmount: number;
}

export function mockPaymentDetails(order: BuyerOrder, totalAmount: number): MockPaymentDetails {
  const rand = seededRandom(order.orderId + '-pay');
  const paidPercentage = order.orderStatus === 'DELIVERED' ? 100 : Math.round(30 + rand() * 50);
  const paidAmount = Math.round((totalAmount * paidPercentage) / 100);

  return {
    paymentTerms: order.paymentMethod || '30% Advance, 70% on Shipment',
    paymentStatus: paidPercentage >= 100 ? 'Paid' : paidPercentage > 0 ? 'Partially Paid' : 'Pending',
    paidPercentage,
    paidAmount,
    balanceAmount: totalAmount - paidAmount,
  };
}

export interface MockDocument {
  name: string;
  sizeKb: number;
}

export function mockDocuments(order: BuyerOrder): MockDocument[] {
  const rand = seededRandom(order.orderId + '-docs');
  return [
    { name: 'Commercial Invoice.pdf', sizeKb: 200 + Math.floor(rand() * 100) },
    { name: 'Packing List.pdf', sizeKb: 150 + Math.floor(rand() * 100) },
    { name: 'Phytosanitary Certificate.pdf', sizeKb: 180 + Math.floor(rand() * 100) },
    { name: 'Certificate of Origin.pdf', sizeKb: 120 + Math.floor(rand() * 100) },
  ];
}

export interface MockStepDates {
  processingDate: string | null;
  shippedDate: string | null;
  deliveredDate: string | null;
}

export function mockStepDates(order: BuyerOrder): MockStepDates {
  const placed = new Date(order.orderDate);
  const arrival = order.estimationDateOfArrival ? new Date(order.estimationDateOfArrival) : null;

  const processingDate = new Date(placed.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();
  const shippedDate = new Date(placed.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  return {
    processingDate,
    shippedDate,
    deliveredDate: order.orderStatus === 'DELIVERED' ? arrival?.toISOString() || null : null,
  };
}

export function resolveAmount(order: BuyerOrder): number {
  return order.amount != null ? Number(order.amount) : mockAmount(order);
}

export function resolveShippingDetails(order: BuyerOrder): MockShippingDetails {
  const hasRealShipping = order.portOfLoading || order.portOfDischarge || order.shippingLine || order.vessel;
  if (!hasRealShipping) {
    return mockShippingDetails(order);
  }
  const fallback = mockShippingDetails(order);
  return {
    portOfLoading: order.portOfLoading || fallback.portOfLoading,
    portOfDischarge: order.portOfDischarge || fallback.portOfDischarge,
    shippingLine: order.shippingLine || fallback.shippingLine,
    vessel: order.vessel || fallback.vessel,
    estimatedDeparture: order.estimatedDeparture || fallback.estimatedDeparture,
    estimatedArrival: order.estimationDateOfArrival || fallback.estimatedArrival,
  };
}

const PAYMENT_STATUS_LABEL: Record<NonNullable<BuyerOrder['paymentStatus']>, MockPaymentDetails['paymentStatus']> = {
  PENDING: 'Pending',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
};

export function resolvePaymentDetails(order: BuyerOrder, totalAmount: number): MockPaymentDetails {
  if (!order.paymentStatus) {
    return mockPaymentDetails(order, totalAmount);
  }
  const paidAmount = order.paidAmount != null ? Number(order.paidAmount) : 0;
  const balanceAmount = order.balanceAmount != null ? Number(order.balanceAmount) : totalAmount - paidAmount;
  return {
    paymentTerms: order.paymentTerms || order.paymentMethod || '30% Advance, 70% on Shipment',
    paymentStatus: PAYMENT_STATUS_LABEL[order.paymentStatus],
    paidPercentage: totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0,
    paidAmount,
    balanceAmount,
  };
}

export function resolveDocuments(order: BuyerOrder): MockDocument[] {
  if (order.documents && order.documents.length > 0) {
    return order.documents.map((doc) => ({ name: doc.documentName, sizeKb: doc.fileSizeKb }));
  }
  return mockDocuments(order);
}

export function resolveStepDates(order: BuyerOrder): MockStepDates {
  const fallback = mockStepDates(order);
  return {
    processingDate: order.processingDate || fallback.processingDate,
    shippedDate: order.shippedDate || fallback.shippedDate,
    deliveredDate: order.deliveredDate || fallback.deliveredDate,
  };
}

import { BuyerOrder, UiOrderStatus } from './buyer-order.model';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Backend now has real PROCESSING/SHIPPED values (BuyerOrderStatusEnum) and passes them straight
 * through. IN_TRANSIT is a legacy value from orders saved before that change — for those rows we
 * still fabricate a Processing/Shipped split client-side using how far the order is between
 * orderDate and estimationDateOfArrival (falling back to a fixed 3-day window when arrival is
 * missing/invalid). Once historical IN_TRANSIT rows are migrated or age out, this fallback can
 * be removed.
 */
export function toUiStatus(order: BuyerOrder): UiOrderStatus {
  switch (order.orderStatus) {
    case 'PROCESSING':
      return 'PROCESSING';
    case 'SHIPPED':
      return 'SHIPPED';
    case 'DELIVERED':
      return 'DELIVERED';
    case 'CANCELLED':
    case 'RETURNED':
      return 'CANCELLED';
    case 'IN_TRANSIT':
    default:
      return isPastMidpoint(order) ? 'SHIPPED' : 'PROCESSING';
  }
}

function isPastMidpoint(order: BuyerOrder): boolean {
  const placed = new Date(order.orderDate).getTime();
  const now = Date.now();
  if (Number.isNaN(placed)) return true;

  const arrival = order.estimationDateOfArrival ? new Date(order.estimationDateOfArrival).getTime() : NaN;
  if (!Number.isNaN(arrival) && arrival > placed) {
    const midpoint = placed + (arrival - placed) / 2;
    return now >= midpoint;
  }

  return now - placed >= THREE_DAYS_MS;
}

export const STATUS_LABELS: Record<UiOrderStatus, string> = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

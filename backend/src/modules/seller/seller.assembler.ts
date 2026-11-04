import type { Seller, SellerStatus } from '@prisma/client';

/** Java: SellerStatus — the enum carried a display label alongside the name. */
const STATUS_LABELS: Record<SellerStatus, string> = {
  PENDING: 'Pending',
  IN_REVIEW: 'In-Review',
  REJECTED: 'Rejected',
  APPROVED: 'Approved',
};

export function sellerStatusLabel(status: SellerStatus | null): string | null {
  return status ? STATUS_LABELS[status] : null;
}

/** Java: SellerAssembler.buildModel */
export interface SellerResponse {
  sellerId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  status: string | null;
}

export function toSellerResponse(entity: Seller): SellerResponse {
  return {
    sellerId: entity.id,
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
    city: entity.city,
    state: entity.state,
    zip: entity.zip,
    country: entity.country,
    // Java called getStatus().getSellerStateValue() unguarded, so a null status
    // threw a NullPointerException. Null is returned instead.
    status: sellerStatusLabel(entity.status),
  };
}

export const SELLER_BEAN = 'sellerResponseBean';

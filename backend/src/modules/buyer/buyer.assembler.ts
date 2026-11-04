import type { Buyer } from '@prisma/client';

/** Java: BuyerSignupAssembler.buildModel */
export interface BuyerSignupResponse {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  buyerId: string;
}

export function toBuyerSignupResponse(entity: Buyer): BuyerSignupResponse {
  return {
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
    city: entity.city,
    state: entity.state,
    zip: entity.zip,
    country: entity.country,
    buyerId: entity.id,
  };
}

/** Java: BuyerInfoBean — the sign-in response, a different shape from signup. */
export interface BuyerInfoResponse {
  name: string | null;
  email: string | null;
  phone: string | null;
  buyerId: string;
  userName: string | null;
  message: string;
}

export const BUYER_BEAN = 'buyerSignupResponseBean';

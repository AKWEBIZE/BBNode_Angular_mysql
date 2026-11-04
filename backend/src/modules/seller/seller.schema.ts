import { z } from 'zod';

export const sellerSignupSchema = z.object({
  name: z.string().nullish(),
  username: z.string().nullish(),
  email: z.string().nullish(),
  password: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  country: z.string().nullish(),
});

/**
 * The Java bean left every field optional and only validated when all were
 * present, which let an empty body through as a successful sign-in. Both are
 * required here — see README "Differences from the Java version".
 */
export const sellerSignInSchema = z.object({
  mobileNumber: z.string().min(1, 'Mobile number must not be empty'),
  countryCode: z.string().nullish(),
  otp: z.string().min(1, 'OTP must not be empty'),
});

export type SellerSignupRequest = z.infer<typeof sellerSignupSchema>;
export type SellerSignInRequest = z.infer<typeof sellerSignInSchema>;

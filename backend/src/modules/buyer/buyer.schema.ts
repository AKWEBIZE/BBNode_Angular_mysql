import { z } from 'zod';

export const buyerSignupSchema = z.object({
  name: z.string().nullish(),
  userName: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  country: z.string().nullish(),
  password: z.string().nullish(),
});

/** Java used @NotBlank on both fields of BuyerSigninRequestBean. */
export const buyerSigninSchema = z.object({
  userName: z.string().min(1, 'User name must not empty'),
  password: z.string().min(1, 'Password must not empty'),
});

export type BuyerSignupRequest = z.infer<typeof buyerSignupSchema>;
export type BuyerSigninRequest = z.infer<typeof buyerSigninSchema>;

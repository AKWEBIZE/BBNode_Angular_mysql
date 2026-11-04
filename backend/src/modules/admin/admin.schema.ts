import { z } from 'zod';

export const adminSignupSchema = z.object({
  name: z.string().nullish(),
  userName: z.string().nullish(),
  email: z.string().min(1, 'email is required'),
  password: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  zip: z.string().nullish(),
  country: z.string().nullish(),
});

export type AdminSignupRequest = z.infer<typeof adminSignupSchema>;

import { z } from 'zod';

/** Java: ContactRequestBean, with its Bean Validation constraints. */
export const contactRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .min(3, 'Name must be min 3 characters long')
    .max(30, 'Name reached maximum character'),
  email: z.string().min(1, 'email cannot be empty'),
  message: z
    .string()
    .min(1, 'Message must be min 3 characters long')
    .max(255, 'Message reached maximum character'),
  phoneNumber: z.string().nullish(),
  city: z.string().nullish(),
});

/**
 * Body of POST /api/enquiry, which the Angular enquiry dialog sends. No Java
 * equivalent — the backend never had this endpoint.
 */
export const enquiryRequestSchema = z.object({
  topic: z.string().nullish(),
  name: z.string().min(1, 'Name cannot be empty').max(30, 'Name reached maximum character'),
  email: z.string().email('A valid email is required'),
  loginType: z.string().min(1, 'Login type is required'),
  contactNumber: z.string().nullish(),
  state: z.string().nullish(),
  district: z.string().nullish(),
  companyName: z.string().nullish(),
  country: z.string().nullish(),
  comments: z.string().max(2000, 'Comments reached maximum character').nullish(),
});

export type ContactRequest = z.infer<typeof contactRequestSchema>;
export type EnquiryRequest = z.infer<typeof enquiryRequestSchema>;

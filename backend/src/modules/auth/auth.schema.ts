import { z } from 'zod';

export const authenticationType = z.enum(['BUYER', 'SELLER', 'ADMIN']);

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  authenticationType,
});

export const sendOtpSchema = z.object({
  phoneNumber: z.string().min(1),
  channel: z.string().default('sms'),
});

export const validateOtpSchema = z.object({
  phoneNumber: z.string().min(1),
  code: z.string().min(1),
  userName: z.string().min(1),
});

export const refreshSchema = z.object({
  userName: z.string().min(1),
  roles: z.array(z.string()).min(1),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type SendOtpRequest = z.infer<typeof sendOtpSchema>;
export type ValidateOtpRequest = z.infer<typeof validateOtpSchema>;

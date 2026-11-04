import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { adminSignupSchema } from '../admin/admin.schema';
import { adminSignUp } from '../admin/admin.service';
import { buyerSignupSchema } from '../buyer/buyer.schema';
import { buyerSignUp } from '../buyer/buyer.service';
import { sellerSignupSchema } from '../seller/seller.schema';
import { sellerSignUp } from '../seller/seller.service';
import { loginSchema, refreshSchema, sendOtpSchema, validateOtpSchema } from './auth.schema';
import { refreshTokens, sendOtp, userLogin, validateOtp } from './auth.service';

export const authRouter = Router();

// Mirrors Java @RequestMapping("/auth") on AuthController.

// The Angular app posts signups here, not to /buyer or /seller, matching the
// Java AuthController which hosted both sign-up routes.
authRouter.post(
  '/buyer/sign-up',
  asyncHandler(async (req, res) => {
    res.json(await buyerSignUp(buyerSignupSchema.parse(req.body)));
  }),
);

authRouter.post(
  '/seller/sign-up',
  asyncHandler(async (req, res) => {
    res.json(await sellerSignUp(sellerSignupSchema.parse(req.body)));
  }),
);

authRouter.post(
  '/admin/sign-up',
  asyncHandler(async (req, res) => {
    res.json(await adminSignUp(adminSignupSchema.parse(req.body)));
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    res.json(await userLogin(loginSchema.parse(req.body)));
  }),
);

authRouter.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    // Java read these as @RequestParam, so accept query string first, then body.
    const rawRoles = req.query.roles ?? req.body?.roles;
    const parsed = refreshSchema.parse({
      userName: req.query.userName ?? req.body?.userName,
      roles: Array.isArray(rawRoles) ? rawRoles : typeof rawRoles === 'string' ? rawRoles.split(',') : rawRoles,
    });
    res.json(refreshTokens(parsed.userName, parsed.roles));
  }),
);

authRouter.post(
  '/send-otp',
  asyncHandler(async (req, res) => {
    // The Java controller caught its own errors and returned {error: msg} with 200.
    try {
      res.json(await sendOtp(sendOtpSchema.parse(req.body)));
    } catch (err) {
      res.json({ error: err instanceof Error ? err.message : 'Failed to send OTP' });
    }
  }),
);

authRouter.post(
  '/validate-otp',
  asyncHandler(async (req, res) => {
    res.json(await validateOtp(validateOtpSchema.parse(req.body)));
  }),
);

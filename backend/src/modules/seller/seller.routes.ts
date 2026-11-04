import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { sellerSignInSchema } from './seller.schema';
import { sellerSignIn } from './seller.service';

export const sellerRouter = Router();

// Java mapped /seller/sign-in; sign-up lives on the auth router, as it did there.
sellerRouter.post(
  '/sign-in',
  asyncHandler(async (req, res) => {
    res.json(await sellerSignIn(sellerSignInSchema.parse(req.body)));
  }),
);

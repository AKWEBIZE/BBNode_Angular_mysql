import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { buyerSigninSchema } from './buyer.schema';
import { buyerLogin, existEmailOrPhone, existUsername } from './buyer.service';

export const buyerRouter = Router();

buyerRouter.post(
  '/sign-in',
  asyncHandler(async (req, res) => {
    res.json(await buyerLogin(buyerSigninSchema.parse(req.body)));
  }),
);

buyerRouter.get(
  '/exist-username',
  asyncHandler(async (req, res) => {
    const username = typeof req.query.username === 'string' ? req.query.username : undefined;
    res.json(await existUsername(username));
  }),
);

// Java read the first parameter as "email" while naming the variable username.
buyerRouter.get(
  '/email-phone-exist',
  asyncHandler(async (req, res) => {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const phone = typeof req.query.phone === 'string' ? req.query.phone : undefined;
    res.json(await existEmailOrPhone(email, phone));
  }),
);

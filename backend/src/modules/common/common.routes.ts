import { Router } from 'express';

export const commonRouter = Router();

/**
 * Java: CommonController.getSignTypeList — a map of enum name to display label,
 * built with Comparator.reverseOrder() over the enum, giving ADMIN, SELLER,
 * BUYER. Key order is preserved here to match.
 */
commonRouter.get('/sign-sign-types', (_req, res) => {
  res.json({
    ADMIN: 'Admin',
    SELLER: 'Seller',
    BUYER: 'Buyer',
  });
});

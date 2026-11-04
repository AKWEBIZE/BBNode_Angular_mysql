import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { parsePageable } from '../../common/pagination';
import { addProductSchema, productFilterSchema } from './product.schema';
import { addProduct, getProduct, getProductFilter } from './product.service';

export const productRouter = Router();

productRouter.post(
  '/add',
  asyncHandler(async (req, res) => {
    res.json(await addProduct(addProductSchema.parse(req.body)));
  }),
);

productRouter.post(
  '/filter',
  asyncHandler(async (req, res) => {
    res.json(await getProductFilter(productFilterSchema.parse(req.body), parsePageable(req)));
  }),
);

// Declared before /:productId so the literal path is not swallowed by the param route.
productRouter.get('/product_info', (_req, res) => {
  res.type('text/plain').send('Product added Successfully ');
});

productRouter.get(
  '/:productId',
  asyncHandler(async (req, res) => {
    res.json(await getProduct(z.string().uuid().parse(req.params.productId)));
  }),
);

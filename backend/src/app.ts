import cors from 'cors';
import express, { Router } from 'express';
import helmet from 'helmet';
import { corsOrigins, env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { buyerRouter } from './modules/buyer/buyer.routes';
import { commonRouter } from './modules/common/common.routes';
import { contactRouter, enquiryRouter } from './modules/contact/contact.routes';
import { buyerOrderRouter } from './modules/order/order.routes';
import { productRouter } from './modules/product/product.routes';
import { sellerRouter } from './modules/seller/seller.routes';
import { varietiesRouter } from './modules/varieties/varieties.routes';
import { watchListRouter } from './modules/watchlist/watchlist.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Mounted outside the context path so uptime checks need no prefix.
  app.get('/health', (_req, res) => {
    res.json({ status: 'UP' });
  });

  const api = Router();
  api.get('/health', (_req, res) => {
    res.json({ status: 'UP' });
  });
  api.use('/auth', authRouter);
  api.use('/product', productRouter);
  api.use('/varieties', varietiesRouter);
  api.use('/seller', sellerRouter);
  api.use('/buyer', buyerRouter);
  api.use('/buyer-order', buyerOrderRouter);
  api.use('/watch-list', watchListRouter);
  api.use('/contact', contactRouter);
  api.use('/common', commonRouter);
  api.use('/api/enquiry', enquiryRouter);

  // Everything sits under Spring's old context path; '' mounts at the root.
  app.use(env.BASE_PATH === '' ? '/' : env.BASE_PATH, api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

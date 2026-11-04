import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { contactRequestSchema, enquiryRequestSchema } from './contact.schema';
import { addContactInfo, getLoginTypes, submitEnquiry } from './contact.service';

/** Java: /contact */
export const contactRouter = Router();

contactRouter.post(
  '/save-contact-info',
  asyncHandler(async (req, res) => {
    res.json(await addContactInfo(contactRequestSchema.parse(req.body)));
  }),
);

/**
 * Mounted at /api/enquiry. Not part of the Java backend — added because the
 * Angular EnquiryService calls these two routes.
 */
export const enquiryRouter = Router();

enquiryRouter.get('/login-types', (_req, res) => {
  res.json(getLoginTypes());
});

enquiryRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await submitEnquiry(enquiryRequestSchema.parse(req.body)));
  }),
);

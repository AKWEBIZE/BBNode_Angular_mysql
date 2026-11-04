import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/asyncHandler';
import { parsePageable } from '../../common/pagination';
import { addVarietiesSchema, varietiesFilterSchema } from './varieties.schema';
import { addVarieties, getVarietiesFilter, getVariety } from './varieties.service';

export const varietiesRouter = Router();

varietiesRouter.post(
  '/add',
  asyncHandler(async (req, res) => {
    res.json(await addVarieties(addVarietiesSchema.parse(req.body)));
  }),
);

varietiesRouter.post(
  '/filter',
  asyncHandler(async (req, res) => {
    res.json(await getVarietiesFilter(varietiesFilterSchema.parse(req.body), parsePageable(req)));
  }),
);

/**
 * The Java controller mapped GET /{varietiesId} but read the value with
 * RequestParam, so it actually required ?varietiesId=... and ignored the path
 * segment. Both forms are accepted here, query string first for compatibility.
 */
varietiesRouter.get(
  '/:varietiesId',
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().parse(req.query.varietiesId ?? req.params.varietiesId);
    res.json(await getVariety(id));
  }),
);

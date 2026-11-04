import type { Prisma, Variety } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../common/errors';
import { escapeForLike, isBlank } from '../../common/criteria';
import { collectionModelOrEmpty, type CollectionModel } from '../../common/hal';
import { pagedModel, type Pageable, type PagedModel } from '../../common/pagination';
import {
  VARIETY_BEAN,
  toVarietyResponse,
  toVarietyResponseList,
  type VarietyResponse,
} from './varieties.assembler';
import type { VarietiesFilterRequest, VarietyRequest } from './varieties.schema';

/**
 * Maps a request bean onto Prisma create input.
 *
 * The Java builders in addVarieties / addVarietiesWithProduct silently dropped
 * imageUrl, color, price_per_unit and harvestDate — the request carried them but
 * they were never persisted. That looked like an oversight rather than intent,
 * so they are saved here. See README "Differences from the Java version".
 */
function toCreateData(req: VarietyRequest, productId: string | null): Prisma.VarietyCreateInput {
  return {
    varietyName: req.varietyName ?? null,
    description: req.description ?? null,
    imageUrl: req.imageUrl ?? null,
    origin: req.origin ?? null,
    grower: req.grower ?? null,
    growingMethod: req.growingMethod ?? null,
    harvestDate: req.harvestDate ?? null,
    harvestSeason: req.harvestSeason ?? null,
    quality: req.quality ?? null,
    color: req.color ?? null,
    size: req.size ?? null,
    price_per_unit: req.price_per_unit ?? null,
    availability: req.availability ?? null,
    certifications: req.certifications ?? null,
    grade: req.grade ?? null,
    packingType: req.packingType ?? null,
    packingDetail: req.packingDetail ?? null,
    moq: req.moq ?? null,
    availableQuantity: req.availableQuantity ?? null,
    priceMin: req.priceMin ?? null,
    priceMax: req.priceMax ?? null,
    paymentTerms: req.paymentTerms ?? null,
    deliveryTimeDays: req.deliveryTimeDays ?? null,
    moistureContent: req.moistureContent ?? null,
    processingType: req.processingType ?? null,
    ...(productId ? { product: { connect: { id: productId } } } : {}),
  };
}

/** Java: VarietiesServiceImpl.addVarieties */
export async function addVarieties(
  requests: VarietyRequest[],
): Promise<CollectionModel<VarietyResponse> | Record<string, never>> {
  const created: Variety[] = [];

  await prisma.$transaction(async (tx) => {
    for (const req of requests) {
      if (!req.productId) {
        throw new NotFoundError('Product id is required');
      }
      // Java called productsRepositoryService.findById, which threw when absent.
      const product = await tx.product.findUnique({ where: { id: req.productId } });
      if (!product) {
        throw new NotFoundError(`Product id '${req.productId}' not found`);
      }
      created.push(await tx.variety.create({ data: toCreateData(req, req.productId) }));
    }
  });

  return collectionModelOrEmpty(VARIETY_BEAN, toVarietyResponseList(created));
}

/**
 * Java: VarietiesServiceImpl.addVarietiesWithProduct — called from the product
 * service inside the same transaction, so the Prisma client is passed in.
 */
export async function addVarietiesWithProduct(
  tx: Prisma.TransactionClient,
  requests: VarietyRequest[],
  productId: string,
): Promise<Variety[]> {
  const created: Variety[] = [];
  for (const req of requests) {
    created.push(await tx.variety.create({ data: toCreateData(req, productId) }));
  }
  return created;
}

/**
 * Java: VarietiesServiceImpl.getVarieties — returned an empty bean rather than
 * a 404 when the id did not match, so that is preserved.
 */
export async function getVariety(
  varietyId: string,
): Promise<VarietyResponse | Record<string, never>> {
  const variety = await prisma.variety.findUnique({ where: { id: varietyId } });
  return variety ? toVarietyResponse(variety) : {};
}

/** Java: VarietiesServiceImpl.getVarietiesFilter */
export async function getVarietiesFilter(
  filter: VarietiesFilterRequest,
  pageable: Pageable,
): Promise<PagedModel<VarietyResponse>> {
  const where: Prisma.VarietyWhereInput = {};

  if (!isBlank(filter.varietyName)) {
    where.varietyName = { contains: escapeForLike(filter.varietyName as string) };
  }

  // Java always added the productId predicate, even when it was null.
  where.productId = filter.productId ?? null;

  const [rows, total] = await Promise.all([
    prisma.variety.findMany({
      where,
      orderBy: { varietyName: 'desc' },
      skip: pageable.page * pageable.size,
      take: pageable.size,
    }),
    prisma.variety.count({ where }),
  ]);

  return pagedModel(VARIETY_BEAN, toVarietyResponseList(rows), total, pageable);
}

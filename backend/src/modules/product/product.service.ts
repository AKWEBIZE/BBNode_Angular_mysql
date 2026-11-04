import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../common/errors';
import { escapeForLike, formatSearchText, isBlank } from '../../common/criteria';
import { collectionModelOrEmpty, type CollectionModel } from '../../common/hal';
import { pagedModel, type Pageable, type PagedModel } from '../../common/pagination';
import { addVarietiesWithProduct } from '../varieties/varieties.service';
import {
  PRODUCT_BEAN,
  toProductResponse,
  toProductResponseList,
  type ProductResponse,
  type ProductWithVarieties,
} from './product.assembler';
import type { ProductFilterRequest, ProductRequest } from './product.schema';

const withVarieties = { varieties: true } as const;

/**
 * Java: ProductServiceImpl.addProduct.
 *
 * The Java version saved each product, then its varieties, then saved again,
 * all outside a transaction — a failure midway left products persisted without
 * their varieties. Here the whole batch runs in one transaction, so a failure
 * rolls everything back.
 */
export async function addProduct(
  requests: ProductRequest[],
): Promise<CollectionModel<ProductResponse> | Record<string, never>> {
  const created = await prisma.$transaction(async (tx) => {
    const results: ProductWithVarieties[] = [];

    for (const req of requests) {
      if (req.productName) {
        // Java: existsByProductNameIgnoreCase. MySQL's default collation is
        // case-insensitive, so a plain equals match reproduces it.
        const existing = await tx.product.findFirst({ where: { productName: req.productName } });
        if (existing) {
          throw new ConflictError(`Product '${req.productName}' already Exist`);
        }
      }

      const product = await tx.product.create({
        data: {
          productName: req.productName ?? null,
          description: req.description ?? null,
          quantity: req.quantity ?? null,
          category: req.category ?? null,
          subcategory: req.subcategory ?? null,
          image_url: req.image_url ?? null,
          country: req.country ?? null,
          location: req.location ?? null,
          productTag: req.productTag ?? null,
          inStock: req.inStock ?? true,
          farmerInfo: req.farmerInfo ?? null,
        },
      });

      const varietyRequests = req.varietiesRequestBeanList ?? [];
      const varieties = varietyRequests.length
        ? await addVarietiesWithProduct(tx, varietyRequests, product.id)
        : [];

      results.push({ ...product, varieties });
    }

    return results;
  });

  return collectionModelOrEmpty(PRODUCT_BEAN, toProductResponseList(created));
}

/** Java: ProductServiceImpl.getProduct */
export async function getProduct(productId: string): Promise<ProductResponse> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: withVarieties,
  });

  // Java threw ProductIdNotFoundException from the repository service.
  if (!product) {
    throw new NotFoundError(`Product id '${productId}' not found`);
  }

  return toProductResponse(product);
}

/** Java: ProductServiceImpl.getProductFilter */
export async function getProductFilter(
  filter: ProductFilterRequest,
  pageable: Pageable,
): Promise<PagedModel<ProductResponse>> {
  const where: Prisma.ProductWhereInput = {};

  // Java matched root.get("authenticationType"), which on ProductEntity resolves
  // to the inherited audit column, not a product field of its own.
  if (!isBlank(filter.authenticationType)) {
    where.auditAuthType = filter.authenticationType as Prisma.ProductWhereInput['auditAuthType'];
  }

  if (!isBlank(filter.productName)) {
    where.productName = { contains: escapeForLike(filter.productName as string) };
  }

  if (!isBlank(filter.category)) {
    where.category = { contains: escapeForLike(filter.category as string) };
  }

  // Java used an IN subquery over joined varieties; `some` produces the same result.
  if (!isBlank(filter.varieties)) {
    where.varieties = {
      some: { varietyName: { contains: formatSearchText(filter.varieties as string) } },
    };
  }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: withVarieties,
      orderBy: { productName: 'desc' },
      skip: pageable.page * pageable.size,
      take: pageable.size,
    }),
    prisma.product.count({ where }),
  ]);

  return pagedModel(PRODUCT_BEAN, toProductResponseList(rows), total, pageable);
}

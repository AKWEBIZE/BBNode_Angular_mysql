import type { Request } from 'express';

/**
 * Spring's PagedResourcesAssembler produced
 *   { "_embedded": { "<bean>List": [...] }, "page": { size, totalElements, totalPages, number } }
 * The Angular app reads `_embedded`, so that shape is reproduced here.
 */
export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PagedModel<T> {
  _embedded?: Record<string, T[]>;
  page: PageMetadata;
}

export interface Pageable {
  page: number;
  size: number;
}

const DEFAULT_PAGE_SIZE = 20; // Spring Data's default
const MAX_PAGE_SIZE = 2000; // Spring's default max

/** Reads Spring's ?page= and ?size= query parameters. */
export function parsePageable(req: Request): Pageable {
  const rawPage = Number.parseInt(String(req.query.page ?? ''), 10);
  const rawSize = Number.parseInt(String(req.query.size ?? ''), 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 0;
  const size =
    Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;

  return { page, size };
}

export function pagedModel<T>(
  beanName: string,
  items: T[],
  totalElements: number,
  pageable: Pageable,
): PagedModel<T> {
  const page: PageMetadata = {
    size: pageable.size,
    totalElements,
    totalPages: pageable.size > 0 ? Math.ceil(totalElements / pageable.size) : 0,
    number: pageable.page,
  };
  // Spring omits _embedded entirely for an empty page, and emits it before `page`.
  return items.length > 0 ? { _embedded: { [`${beanName}List`]: items }, page } : { page };
}

/**
 * Spring HATEOAS wrapped collections as
 *   { "_embedded": { "<beanName>List": [...] } }
 * where the key is derived from the response bean class name.
 *
 * The Angular frontend reads these keys directly in 14 files
 * (e.g. res._embedded.productResponseBeanList), so the exact shape is part of
 * the API contract and must be reproduced.
 */
export interface CollectionModel<T> {
  _embedded: Record<string, T[]>;
}

export function collectionModel<T>(beanName: string, items: T[]): CollectionModel<T> {
  return { _embedded: { [`${beanName}List`]: items } };
}

/** Spring omits _embedded entirely when the collection is empty. */
export function collectionModelOrEmpty<T>(beanName: string, items: T[]): CollectionModel<T> | {} {
  return items.length === 0 ? {} : collectionModel(beanName, items);
}

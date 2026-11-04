import { WatchProduct } from './watch-list.model';

export function priceRangeLabel(product: WatchProduct): string {
  const varieties = product.varietiesList || [];
  const mins = varieties.map((v) => v.priceMin).filter((v): v is number => v != null);
  const maxs = varieties.map((v) => v.priceMax).filter((v): v is number => v != null);

  if (mins.length === 0 || maxs.length === 0) {
    return 'On request';
  }

  const min = Math.min(...mins);
  const max = Math.max(...maxs);
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

export function moqLabel(product: WatchProduct): string {
  const moq = product.varietiesList?.find((v) => v.moq != null)?.moq;
  return moq != null ? `MOQ: ${moq} MT` : 'MOQ: —';
}

export function minPrice(product: WatchProduct): number {
  const mins = (product.varietiesList || []).map((v) => v.priceMin).filter((v): v is number => v != null);
  return mins.length > 0 ? Math.min(...mins) : Number.POSITIVE_INFINITY;
}

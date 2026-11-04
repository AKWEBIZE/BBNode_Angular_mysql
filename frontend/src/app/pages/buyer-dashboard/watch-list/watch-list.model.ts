export interface WatchVariety {
  varietyId?: string;
  varietyName?: string;
  origin?: string;
  quality?: string;
  description?: string;
  priceMin?: number | null;
  priceMax?: number | null;
  moq?: number | null;
}

export interface WatchProduct {
  productId: string;
  productName: string;
  category?: string;
  subcategory?: string;
  description?: string;
  country?: string;
  location?: string;
  productTag?: string;
  inStock?: boolean;
  varietiesList?: WatchVariety[];
}

export interface WatchListItem {
  buyerId: string;
  buyerName?: string;
  productResponseBeans: WatchProduct;
  savedAt?: string;
}

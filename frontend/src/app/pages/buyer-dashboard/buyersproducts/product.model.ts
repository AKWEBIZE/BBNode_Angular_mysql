export interface Variety {
  varietyId: string;
  varietyName: string;
  description: string;
  origin: string;
  grower: string;
  growingMethod: string;
  quality: string;
  size: string;
  availability: string;
  certifications: string;
  harvestSeason?: string;
  grade?: string;
  packingType?: string;
  moq?: number;
  availableQuantity?: number;
  priceMin?: number;
  priceMax?: number;
  paymentTerms?: string;
  deliveryTimeDays?: string;
  moistureContent?: string;
  processingType?: string;
  packingDetail?: string;
}

export interface Product {
  productId: string;
  productName: string;
  category: string;
  subcategory?: string;
  description: string;
  /** @deprecated the backend never populates this — see product_image below */
  image_url?: string;
  /** Base64-encoded product photo (ProductResponseBean#productImage, JSON key `product_image`). */
  product_image?: string;
  country?: string;
  productTag?: string;
  inStock?: boolean;
  location?: string;
  farmerInfo?: string;
  varietiesList: Variety[];
}

export interface ProductResponse {
  _embedded: {
    productResponseBeanList: Product[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface ProductFilter {
  productName?: string;
  category?: string;
  country?: string;
  priceMin?: number;
  priceMax?: number;
  moqMin?: number;
  moqMax?: number;
  status?: string;
}

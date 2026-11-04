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
}

export interface Product {
  productId: string;
  productName: string;
  category: string;
  description: string;
  image_url: string;
  varietiesList: Variety[];
}

export interface ProductResponse {
  _embedded: {
    productResponseBeanList: Product[];
  };
}
export type ProductStatus = 'PENDING_APPROVAL' | 'PENDING_UPDATES' | 'REJECTED' | 'APPROVED' | 'DRAFT';

export interface AdminProductListDto {
  id: string;
  productCode: string;
  productName: string;
  sellerName: string;
  category: string;
  quantitySummary: string;
  qualityGrade: string | null;
  status: ProductStatus | null;
  createdAt: string;
}

export interface AdminProductDetailDto {
  id: string;
  productCode: string;
  productName: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  country: string;
  sellerId: string;
  sellerName: string;
  status: ProductStatus | null;
  adminNotes: string | null;
  harvestSummary: string | null;
  qualityGrade: string | null;
  moistureLimit: string | null;
  varietiesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

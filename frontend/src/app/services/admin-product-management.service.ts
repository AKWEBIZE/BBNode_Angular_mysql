import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminProductListDto {
  id: string;
  productCode: string;
  productName: string;
  sellerName: string;
  category: string;
  quantitySummary: string;
  qualityGrade: string | null;
  status: string;
  createdAt: string;
}

export interface AdminProductDetailDto {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  category: string;
  subcategory: string;
  country: string;
  sellerId: string;
  sellerName: string;
  status: string;
  adminNotes: string | null;
  harvestSummary: string | null;
  qualityGrade: string | null;
  moistureLimit: string | null;
  varietiesCount: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminProductManagementService {
  private apiUrl = `${environment.apiBaseUrl}/admin/products-mgmt`;

  constructor(private http: HttpClient) {}

  getProducts(status?: string, productName?: string, sellerName?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (productName) params = params.set('productName', productName);
    if (sellerName) params = params.set('sellerName', sellerName);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<AdminProductDetailDto> {
    return this.http.get<AdminProductDetailDto>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  approveProduct(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectProduct(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  requestChanges(id: string, notes: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/request-changes`, { notes });
  }

  updateNotes(id: string, notes: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/notes`, { notes });
  }

  updateStatus(id: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }
}

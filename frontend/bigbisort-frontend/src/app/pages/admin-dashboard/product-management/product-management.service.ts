import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AdminProductDetailDto, PageResponse, AdminProductListDto, ProductStatus } from './product-management.model';

@Injectable({
  providedIn: 'root'
})
export class ProductManagementService {
  private baseUrl = `${environment.apiBaseUrl}/admin/products-mgmt`;

  constructor(private http: HttpClient) {}

  getProducts(status?: ProductStatus, q?: string, page = 0, size = 10): Observable<PageResponse<AdminProductListDto>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);

    return this.http.get<PageResponse<AdminProductListDto>>(this.baseUrl, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  getProductById(id: string): Observable<AdminProductDetailDto> {
    return this.http.get<AdminProductDetailDto>(`${this.baseUrl}/${id}`);
  }

  approveProduct(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectProduct(id: string, reason: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/reject`, { reason });
  }

  requestChanges(id: string, notes: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/request-changes`, { notes });
  }

  updateNotes(id: string, notes: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/notes`, { notes });
  }
}

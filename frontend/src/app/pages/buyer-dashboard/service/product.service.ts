import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product, ProductFilter, ProductResponse } from '../buyersproducts/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/product`;

  constructor(private http: HttpClient) {}

  getProductsByCategory(category: string): Observable<ProductResponse> {
    return this.filterProducts({ category }, 0, 20);
  }

  filterProducts(filter: ProductFilter, page: number = 0, size: number = 20): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    const body = {
      productName: filter.productName || '',
      category: filter.category || '',
      country: filter.country || '',
      priceMin: filter.priceMin ?? null,
      priceMax: filter.priceMax ?? null,
      moqMin: filter.moqMin ?? null,
      moqMax: filter.moqMax ?? null,
      status: filter.status || 'APPROVED'
    };

    return this.http.post<ProductResponse>(`${this.apiUrl}/filter`, body, { params });
  }

  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }

  getRecommendedProducts(limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/recommended`, { params: { limit } });
  }

  getCategoryDropdown(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/category/drop-down`);
  }

  getCountryDropdown(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/country/drop-down`);
  }
}

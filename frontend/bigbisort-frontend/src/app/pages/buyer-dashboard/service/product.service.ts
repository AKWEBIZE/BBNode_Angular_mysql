import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductResponse } from '../buyersproducts/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8081/bigbisort-imp-exp/product/filter';

  constructor(private http: HttpClient) {}

  getProductsByCategory(category: string): Observable<ProductResponse> {
    const params = new HttpParams()
      .set('number', 0)
      .set('size', 20);

    const body = {
      productName: '',
      category: category
    };

    return this.http.post<ProductResponse>(this.apiUrl, body, { params });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/product`;

  constructor(private http: HttpClient) {}

  getProducts(sellerId: string, page: number, size: number, search?: string, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    const body: any = {
      sellerId: sellerId,
      authenticationType: 'SELLER'
    };
    
    if (search) {
      body.productName = search;
    }
    if (status && status !== 'All') {
      body.status = status;
    }

    return this.http.post(`${this.apiUrl}/filter`, body, { params });
  }

  getProductById(productId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}`);
  }

  addProduct(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, payload);
  }

  updateProduct(productId: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${productId}`, payload);
  }
}

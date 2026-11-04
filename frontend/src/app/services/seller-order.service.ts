import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellerOrderService {
  private apiUrl = `${environment.apiBaseUrl}/buyer-order`;

  constructor(private http: HttpClient) {}

  // Orders scoped to the given seller (any order containing at least one of the seller's products),
  // with optional product name / buyer name / status filters.
  getSellerOrders(sellerId: string, buyerName?: string, productName?: string, status?: string,
                  page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    const body: any = { sellerId };
    if (buyerName) body.buyerName = buyerName;
    if (productName) body.productName = productName;
    if (status) body.status = status;

    return this.http.post<any>(`${this.apiUrl}/filter`, body, { params });
  }
}

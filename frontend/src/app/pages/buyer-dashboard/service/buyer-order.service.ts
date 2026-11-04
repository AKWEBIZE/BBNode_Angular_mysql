import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuyerOrderService {
 private baseUrl = `${environment.apiBaseUrl}/buyer-order`;

  constructor(private http: HttpClient) {}

  // TODO(backend): /filter has no status query param, so tab filtering (Processing/Shipped/
  // Delivered/Cancelled) can't happen server-side yet. We fetch one bounded batch (size=200,
  // covering realistic buyer order history) and do filtering + pagination client-side over it.
  // Also note: without an explicit size, Spring Data defaults to page size 20 — the previous
  // page silently only ever showed the buyer's most recent 20 orders.
  filterBuyerOrders(payload: any, page = 0, size = 200): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post<any>(`${this.baseUrl}/filter`, payload, { params });
  }

  getOrderStatusCounts(buyerId: string): Observable<any> {
    if (!buyerId) {
      throw new Error('buyerId is required');
    }
    const url = `${this.baseUrl}/status/count?buyerId=${buyerId}`;
    return this.http.get<any>(url);
  }
}

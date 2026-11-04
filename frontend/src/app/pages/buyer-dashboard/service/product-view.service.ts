import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductViewService {
  private baseUrl = `${environment.apiBaseUrl}/product-view`;

  constructor(private http: HttpClient) {}

  // Fire-and-forget from the caller's point of view — a failure here should never block the
  // product details UI from opening.
  recordView(buyerId: string, productId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/record`, { buyerId, productId });
  }

  getRecentlyViewed(buyerId: string, page = 0, size = 200): Observable<any> {
    const params = new HttpParams().set('buyerId', buyerId).set('page', page).set('size', size);
    return this.http.get(`${this.baseUrl}/recent`, { params });
  }

  removeView(buyerId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove`, { params: { buyerId, productId } });
  }
}

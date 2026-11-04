import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WatchListService {
  private baseUrl = `${environment.apiBaseUrl}/watch-list`;

  constructor(private http: HttpClient) {}

  // Add to watchlist (already done earlier)
  addToWatchList(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, payload);
  }

  // Get watchlist by buyerId. size=200: /filter has no category/tag query param, so the page
  // does its own tab filtering client-side over one bounded batch (same tradeoff as My Orders).
  getWatchList(buyerId: string, page = 0, size = 200): Observable<any> {
    const payload = { buyerId };
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.post(`${this.baseUrl}/filter`, payload, { params });
  }

  removeFromWatchList(buyerId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove`, { params: { buyerId, productId } });
  }

  getSavedProductIds(buyerId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/ids`, { params: { buyerId } });
  }
}

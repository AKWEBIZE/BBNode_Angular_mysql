import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WatchListService {
  private baseUrl = 'http://localhost:8081/bigbisort-imp-exp/watch-list';

  constructor(private http: HttpClient) {}

  // Add to watchlist (already done earlier)
  addToWatchList(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, payload);
  }

  // ✅ New method: Get watchlist by buyerId
  getWatchList(buyerId: string): Observable<any> {
    const payload = { buyerId };
    return this.http.post(`${this.baseUrl}/filter`, payload);
  }
}

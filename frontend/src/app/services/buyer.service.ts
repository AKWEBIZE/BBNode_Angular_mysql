import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BuyerDashboardSummary {
  activeOrders: number;
  activeOrdersDelta: number;
  savedProducts: number;
  savedProductsDelta: number;
  recentActivityCount: number;
  productsAvailable: number;
}

export interface MarketHighlight {
  productId: string;
  productName: string;
  category: string;
  trendPercentage: number;
  sparklineValues: number[];
}

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private apiUrl = `${environment.apiBaseUrl}/buyer`;
  private marketHighlightUrl = `${environment.apiBaseUrl}/market-highlight`;

  constructor(private http: HttpClient) {}

  getDashboardSummary(buyerId: string): Observable<BuyerDashboardSummary> {
    return this.http.get<BuyerDashboardSummary>(`${this.apiUrl}/${buyerId}/dashboard/summary`);
  }

  getMarketHighlights(limit: number = 5): Observable<MarketHighlight[]> {
    return this.http.get<MarketHighlight[]>(`${this.marketHighlightUrl}/top`, { params: { limit } });
  }
}

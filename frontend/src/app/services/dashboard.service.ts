import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DashboardStats {
  totalSellers: number;
  totalBuyers: number;
  activeProducts: number;
  activeExportDeals: number;
}

export interface PendingApprovals {
  sellerVerifications: number;
  productListings: number;
  exportDeals: number;
}

export interface RevenueSnapshot {
  todayRevenue: number;
  monthRevenue: number;
  pendingPayment: number;
  ytdRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getPendingApprovals(): Observable<PendingApprovals> {
    return this.http.get<PendingApprovals>(`${this.apiUrl}/dashboard/pending-approvals`);
  }

  getRevenueSnapshot(): Observable<RevenueSnapshot> {
    return this.http.get<RevenueSnapshot>(`${this.apiUrl}/dashboard/revenue-snapshot`);
  }
}

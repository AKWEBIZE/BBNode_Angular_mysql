import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminBuyerListDto {
  id: string;
  buyerCode: string;
  name: string;
  businessName: string;
  country: string;
  status: string;
}

export interface AdminBuyerDetailDto extends AdminBuyerListDto {
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  adminNotes: string;
  createdAt: string;
  ordersCount: number;
}

export interface BuyerPurchaseHistoryItem {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  amount: number;
  quantity: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminBuyerManagementService {
  private apiUrl = `${environment.apiBaseUrl}/admin/buyers-mgmt`;

  constructor(private http: HttpClient) {}

  getBuyers(status?: string, query?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);
    if (query) params = params.set('q', query);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getBuyerById(id: string): Observable<AdminBuyerDetailDto> {
    return this.http.get<AdminBuyerDetailDto>(`${this.apiUrl}/${id}`);
  }

  updateBuyerStatus(id: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateBuyerNotes(id: string, notes: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/notes`, { notes });
  }

  getPurchaseHistory(id: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/${id}/purchase-history`, { params });
  }
}

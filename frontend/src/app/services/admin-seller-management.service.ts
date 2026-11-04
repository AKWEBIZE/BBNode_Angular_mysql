import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminSellerListDto {
  id: string;
  sellerCode: string;
  name: string;
  businessName: string;
  state: string;
  country: string;
  status: string;
  productsCount: number;
}

export interface AdminSellerDetailDto extends AdminSellerListDto {
  email: string;
  phone: string;
  address: string;
  aadhaarVerified: boolean;
  gs1Certificate: string;
  produceLicense: string;
  farmInspectionDone: boolean;
  adminNotes: string;
  createdAt: string;
  documentCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSellerManagementService {
  private apiUrl = `${environment.apiBaseUrl}/admin/sellers-mgmt`;

  constructor(private http: HttpClient) {}

  getSellers(status?: string, query?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (status && status !== 'All Sellers') {
      let mappedStatus = status.toUpperCase().replace(' ', '_');
      params = params.set('status', mappedStatus);
    }
    if (query) params = params.set('q', query);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getSellerById(id: string): Observable<AdminSellerDetailDto> {
    return this.http.get<AdminSellerDetailDto>(`${this.apiUrl}/${id}`);
  }

  updateSellerStatus(id: string, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateSellerNotes(id: string, notes: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/notes`, { notes });
  }

  requestUpdate(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/request-update`, {});
  }
}

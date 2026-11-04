import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = `${environment.apiBaseUrl}/seller`;

  constructor(private http: HttpClient) {}

  getDashboardSummary(sellerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sellerId}/dashboard/summary`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AuditLogDto {
  id: string;
  occurredAt: string;
  actorId: string | null;
  actorType: string;
  actorUsername: string | null;
  actorEmail: string | null;
  action: string;
  status: string;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuditLogService {
  private apiUrl = `${environment.apiBaseUrl}/admin/audit-logs`;

  constructor(private http: HttpClient) {}

  getAuditLogs(
    actorType?: string,
    status?: string,
    query?: string,
    from?: string,
    to?: string,
    page: number = 0,
    size: number = 20
  ): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (actorType) params = params.set('actorType', actorType);
    if (status) params = params.set('status', status);
    if (query) params = params.set('q', query);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<any>(this.apiUrl, { params });
  }
}

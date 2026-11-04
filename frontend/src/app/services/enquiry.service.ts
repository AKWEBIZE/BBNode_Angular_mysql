import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LoginTypeOption {
  value: 'SELLER' | 'BUYER' | string;
  label: string;
}

/** Body of POST /api/enquiry. Only the fields for the chosen loginType are sent; the rest stay null. */
export interface EnquiryRequest {
  /** What the visitor clicked to open the dialog (e.g. "Farmer Support"); shown as "Regarding" in the team mail. */
  topic?: string | null;
  name: string;
  email: string;
  loginType: string;
  contactNumber?: string | null;
  state?: string | null;
  district?: string | null;
  companyName?: string | null;
  country?: string | null;
  comments?: string | null;
}

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** "I am a" options come from the backend so the list is never hardcoded here. */
  getLoginTypes(): Observable<LoginTypeOption[]> {
    return this.http.get<LoginTypeOption[]>(`${this.apiUrl}/api/enquiry/login-types`);
  }

  submit(request: EnquiryRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/api/enquiry`, request);
  }

  /** Buyer "Country" options — same list the product catalog already uses. */
  getCountries(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/product/country/drop-down`);
  }
}

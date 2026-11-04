import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiBaseUrl;
  public tokenExpired$ = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  notifyTokenExpired() {
    this.tokenExpired$.next(true);
  }

  /**
   * Buyer Registration
   */
  registerBuyer(data: any): Observable<any> {
    const url = `${this.apiUrl}/auth/buyer/sign-up`;
    return this.http.post(url, data);
  }

  /**
   * Seller Registration
   */
  registerSeller(data: any): Observable<any> {
    const url = `${this.apiUrl}/auth/seller/sign-up`;
    return this.http.post(url, data);
  }

  /**
   * Admin Login
   */
  loginAdmin(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/api/admin/login`;
    return this.http.post(url, { username, password });
  }

  /**
   * Admin Registration
   */
  registerAdmin(data: any): Observable<any> {
    const url = `${this.apiUrl}/api/admin/register`;
    const headers = { 'ADMIN_SECRET': 'SUPER_SECRET_ADMIN_TOKEN_123' };
    return this.http.post(url, data, { headers });
  }

  /**
   * Login for Buyer / Seller / Admin
   */
  login(
    usernameOrPhone: string,
    passwordOrOtp: string,
    authenticationType: 'BUYER' | 'SELLER' | 'ADMIN'
  ): Observable<any> {

    const url = `${this.apiUrl}/auth/login`;

    return this.http.post(url, {
      username: usernameOrPhone,
      password: passwordOrOtp,
      authenticationType
    });
  }

  /**
   * Google Sign-In for Buyer / Seller / Admin. Posts the Google ID token to
   * the backend, which verifies it with Google and either logs in an
   * existing account or provisions a new one (except ADMIN — see backend
   * GoogleOAuth2Service, admin accounts are never auto-created).
   *
   * Note: on failure the backend still responds 200 with a `message`
   * describing the problem rather than an HTTP error status — callers must
   * check `res.accessToken`, not just subscribe to `error`.
   */
  googleLogin(
    idToken: string,
    authenticationType: 'BUYER' | 'SELLER' | 'ADMIN'
  ): Observable<any> {
    const url = `${this.apiUrl}/auth/google-login`;
    return this.http.post(url, { idToken, authenticationType });
  }

  /**
   * Send OTP to mobile number
   */
  sendOtp(data: { mobile: string }): Observable<any> {
    const url = `${this.apiUrl}/auth/send-otp`;
    return this.http.post(url, { phoneNumber: '+91' + data.mobile, channel: 'sms' });
  }

  /**
   * Verify OTP
   */
  verifyOtp(data: { mobile: string; otp: string }): Observable<any> {
    const url = `${this.apiUrl}/auth/validate-otp`;
    return this.http.post(url, { phoneNumber: '+91' + data.mobile, code: data.otp });
  }

  // ✅ ROLE HANDLING
  // sessionStorage (not localStorage): auth state must be isolated per browser tab, not
  // shared across the whole origin — otherwise logging in as a different role in one tab
  // silently overwrites the token/role every other open tab is using, and the next request
  // from that other tab gets rejected with 403 by the backend's role check.
  setRole(role: string) {
    sessionStorage.setItem('role', role);
  }

  getRole(): string | null {
    return sessionStorage.getItem('role');
  }

  // ✅ TOKEN HANDLING
  setToken(token: string) {
    sessionStorage.setItem('accessToken', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  // ✅ USER ID (generic account id, present for buyer/seller/admin alike)
  setUserId(userId: string) {
    sessionStorage.setItem('userId', userId);
  }

  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  // ✅ ADMIN HELPERS
  setAdminId(adminId: string) {
    sessionStorage.setItem('adminId', adminId);
  }

  getAdminId(): string | null {
    return sessionStorage.getItem('adminId');
  }

  setAdminName(name: string) {
    sessionStorage.setItem('adminName', name);
  }

  getAdminName(): string | null {
    return sessionStorage.getItem('adminName');
  }

  // ✅ SELLER HELPERS
  setSellerId(sellerId: string) {
    sessionStorage.setItem('sellerId', sellerId);
  }

  getSellerId(): string | null {
    return sessionStorage.getItem('sellerId');
  }

  setSellerName(name: string) {
    sessionStorage.setItem('sellerName', name);
  }

  getSellerName(): string | null {
    return sessionStorage.getItem('sellerName');
  }

  setSellerEmail(email: string) {
    sessionStorage.setItem('sellerEmail', email);
  }

  setSellerPhone(phone: string) {
    sessionStorage.setItem('sellerPhone', phone);
  }

  // ✅ BUYER HELPERS
  setBuyerId(buyerId: string) {
    sessionStorage.setItem('buyerId', buyerId);
  }

  getBuyerId(): string | null {
    return sessionStorage.getItem('buyerId');
  }

  setBuyerName(name: string) {
    sessionStorage.setItem('buyerName', name);
  }

  getBuyerName(): string | null {
    return sessionStorage.getItem('buyerName');
  }

  setBuyerCountry(country: string) {
    sessionStorage.setItem('buyerCountry', country);
  }

  getBuyerCountry(): string | null {
    return sessionStorage.getItem('buyerCountry');
  }

  setBuyerCompany(company: string) {
    sessionStorage.setItem('buyerCompany', company);
  }

  getBuyerCompany(): string | null {
    return sessionStorage.getItem('buyerCompany');
  }

  // LOGOUT
  logout() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('adminName');
    sessionStorage.removeItem('sellerId');
    sessionStorage.removeItem('sellerName');
    sessionStorage.removeItem('sellerEmail');
    sessionStorage.removeItem('sellerPhone');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('adminId');
    sessionStorage.removeItem('buyerId');
    sessionStorage.removeItem('buyerName');
    sessionStorage.removeItem('buyerCountry');
    sessionStorage.removeItem('buyerCompany');
  }
}

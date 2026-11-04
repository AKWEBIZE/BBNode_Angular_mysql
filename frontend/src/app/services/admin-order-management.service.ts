import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BuyerInfoBean {
  buyerId: string;
  name: string;
  email: string;
  phone: string;
}

export interface ProductResponseBean {
  id: string;
  productName: string;
  category?: string;
}

export interface AdminOrderDto {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  paymentMethod: string;
  billingCompanyName: string;
  quantity: string;
  shippingName: string;
  estimationDateOfArrival: string;
  buyerInfoBean: BuyerInfoBean;
  productResponseBeanSet: ProductResponseBean[];
  orderStatus: string;
  grade: string;
  sellerName: string;
  amount: number;
  paymentTerms: string;
  paymentStatus: string;
  paidAmount: number;
  balanceAmount: number;
}

export interface AdminOrderProductOptionDto {
  id: string;
  productName: string;
  category: string;
  sellerId: string;
  sellerName: string;
  grades: string[];
}

export interface CreateOrderPayload {
  buyerId: string;
  productIds: string[];
  quantity: string;
  grade?: string;
  paymentMethod: string;
  amount: number;
  paidAmount: number;
  estimationDateOfArrival: string;
  status: string;
  orderDate: Date;
}

export const ORDER_STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'IN_TRANSIT', label: 'In-Transit' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'DELIVERED', label: 'Delivered' }
];

export const PAYMENT_METHOD_OPTIONS = [
  'Advance Payment',
  'Letter of Credit',
  'Documents against Payment',
  'Documents against Acceptance',
  'Open Account',
  'Consignment',
  'Bank Guarantee-backed / Trade Credit'
];

@Injectable({
  providedIn: 'root'
})
export class AdminOrderManagementService {
  private apiUrl = `${environment.apiBaseUrl}/admin/orders-mgmt`;

  constructor(private http: HttpClient) {}

  getOrders(buyerName?: string, status?: string, productName?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (buyerName) params = params.set('buyerName', buyerName);
    if (status) params = params.set('status', status);
    if (productName) params = params.set('productName', productName);

    return this.http.get<any>(this.apiUrl, { params });
  }

  createOrder(payload: CreateOrderPayload): Observable<AdminOrderDto> {
    return this.http.post<AdminOrderDto>(this.apiUrl, payload);
  }

  updateOrderStatus(orderId: string, status: string): Observable<void> {
    const params = new HttpParams().set('status', status);
    return this.http.put<void>(`${this.apiUrl}/${orderId}/status`, {}, { params });
  }

  searchProducts(query?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (query) params = params.set('query', query);

    return this.http.get<any>(`${this.apiUrl}/products/search`, { params });
  }
}

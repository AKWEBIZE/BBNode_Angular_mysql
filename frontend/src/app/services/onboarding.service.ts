import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Onboarding Status
  getOnboardingStatus(sellerId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/onboarding/status?sellerId=${sellerId}`);
  }

  // Step 1 - Identity
  saveStep1(sellerId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/onboarding/step-1?sellerId=${sellerId}`, data);
  }

  // Step 2 - Upload Document
  uploadDocument(sellerId: string, documentType: string, file: File, side?: string, label?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (side) formData.append('side', side);
    if (label) formData.append('label', label);
    return this.http.post(`${this.apiUrl}/api/onboarding/step-2/upload?sellerId=${sellerId}`, formData);
  }

  deleteDocument(documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/onboarding/step-2/document/${documentId}`);
  }

  completeStep2(sellerId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/onboarding/step-2/complete?sellerId=${sellerId}`, {});
  }

  saveIdentityInfo(sellerId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/onboarding/step-2/identity?sellerId=${sellerId}`, data);
  }

  // Step 3 - Farm
  saveStep3(sellerId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/onboarding/step-3?sellerId=${sellerId}`, data);
  }

  // Step 4 - Products
  addProduct(sellerId: string, data: any): Observable<any> {
    const payload = {
      id: sellerId,
      authenticationType: 'SELLER',
      productRequestBeanList: [{
        productName: data.productName,
        category: data.category,
        description: data.description,
        product_image: data.product_image,
        varietiesRequestBeanList: [{
          varietyName: data.varietyName,
          description: data.description,
          harvestDate: data.harvestDate,
          estimatedQuantity: data.quantity,
          quantityMeasurementType: data.unit,
          grade: data.grade,
          packingType: data.packagingType
        }]
      }]
    };
    return this.http.post(`${this.apiUrl}/product/add`, payload);
  }

  updateProduct(productId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/onboarding/step-4/product/${productId}`, data);
  }

  uploadProductMedia(productId: string, mediaType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);
    return this.http.post(`${this.apiUrl}/api/onboarding/step-4/product/${productId}/media`, formData);
  }

  // Complete Onboarding
  completeOnboarding(sellerId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/onboarding/complete?sellerId=${sellerId}`, {});
  }

  // Reference Data
  getStates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/ref/states`);
  }

  getDistricts(stateId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/ref/districts/${stateId}`);
  }

  getCrops(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/ref/crops`);
  }

  getProductCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/ref/product-categories`);
  }

  getProductsByCategory(categoryId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/ref/products?categoryId=${categoryId}`);
  }

  getPincodeInfo(pincode: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/ref/pincode/${pincode}`);
  }

  getLandUnits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/ref/land-units`);
  }

  getMeasurementUnits(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/ref/measurement-units`);
  }

  getIrrigationTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/ref/irrigation-types`);
  }

  getCatalogCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/v1/catalog/categories`);
  }

  getCatalogProducts(categoryKey: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/v1/catalog/products?category=${categoryKey}`);
  }

  getCatalogVarieties(categoryKey: string, productKey: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/api/v1/catalog/varieties?category=${categoryKey}&product=${productKey}`);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService } from 'src/app/services/seller.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
    selector: 'app-seller-dashboard',
    templateUrl: './seller-dashboard.component.html',
    styleUrls: ['./seller-dashboard.component.scss'],
    standalone: false
})
export class SellerDashboardComponent implements OnInit {

  summary: any = null;
  products: any[] = [];
  sellerId = '';
  sellerName = '';

  constructor(
    private sellerService: SellerService,
    private authService: AuthService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.sellerId = this.authService.getSellerId() || '';
    this.sellerName = this.authService.getSellerName() || '';
    if (this.sellerId) {
      this.sellerService.getDashboardSummary(this.sellerId).subscribe({
        next: (data) => {
          this.summary = data;
        },
        error: (err) => {
          console.error('Failed to load seller dashboard summary', err);
        }
      });
      this.loadProducts();
    }
  }

  loadProducts() {
    this.productService.getProducts(this.sellerId, 0, 10, '', 'All')
      .subscribe({
        next: (res: any) => {
           if (res._embedded && res._embedded.productResponseBeanList) {
             this.products = res._embedded.productResponseBeanList;
           } else {
             this.products = [];
           }
        },
        error: (err) => {
          console.error('Failed to load recent products', err);
          this.products = [];
        }
      });
  }

  navigateToAddProduct() {
     this.router.navigate(['/seller/products/add-product']);
  }

  navigateToEdit(product: any) {
    this.router.navigate(['/seller/products/edit-product', product.productId || product.id]);
  }

  navigateToAllProducts() {
    this.router.navigate(['/seller/products']);
  }

  getStatus(product: any): string {
     if (!product.productStatus) return 'Pending Approval';
     if (product.productStatus === 'PENDING_APPROVAL') return 'Pending Approval';
     if (product.productStatus === 'APPROVED') return 'Approved';
     if (product.productStatus === 'REJECTED') return 'Rejected';
     if (product.productStatus === 'DRAFT') return 'Draft';
     return 'Pending Approval';
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Approved': return 'badge-approved';
      case 'Pending Approval': return 'badge-review';
      case 'Rejected': return 'badge-rejected';
      case 'Draft': return 'badge-draft';
      default: return 'badge-draft';
    }
  }

  getVarietyText(product: any): string {
     if (product.varietiesList && product.varietiesList.length > 0) {
        return product.varietiesList[0].varietyName || '-';
     }
     return '-';
  }
  
  getQuantityText(product: any): string {
    if (product.varietiesList && product.varietiesList.length > 0) {
       const v = product.varietiesList[0];
       return `${v.estimatedQuantity || 0} ${v.quantityMeasurementType || 'Kg'}`;
    }
    return '0 Kg';
  }
}

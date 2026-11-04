import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../services/product.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  
  // Pagination
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  pageSizes = [10, 20, 50, 100];
  
  // Filters
  searchTerm = '';
  statusOptions = ['All', 'Approved', 'Pending Approval', 'Rejected', 'Draft'];
  selectedStatus = 'All';
  searchSubject = new Subject<string>();

  sellerId = '';
  approvedCount = 0;

  constructor(private productService: ProductService, private router: Router) {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadProducts();
    });
  }

  ngOnInit(): void {
    this.sellerId = sessionStorage.getItem('sellerId') || '';
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts(this.sellerId, this.currentPage, this.pageSize, this.searchTerm, this.selectedStatus)
      .subscribe({
        next: (res: any) => {
           if (res._embedded && res._embedded.productResponseBeanList) {
             this.products = res._embedded.productResponseBeanList;
           } else {
             this.products = [];
           }
           this.totalElements = res.page?.totalElements || 0;
           this.totalPages = res.page?.totalPages || 0;
           this.calculateApprovedCount();
        },
        error: (err) => {
          console.error(err);
          this.products = [];
        }
      });
  }

  calculateApprovedCount() {
    this.approvedCount = this.products.filter(p => this.getStatus(p) === 'Approved').length;
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onFilterStatus(event: any) {
    this.selectedStatus = event.target.value;
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageSizeChange(event: any) {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 0;
    this.loadProducts();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  navigateToAddProduct() {
     this.router.navigate(['/seller/products/add-product']);
  }

  navigateToEdit(product: any) {
    this.router.navigate(['/seller/products/edit-product', product.productId || product.id]);
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


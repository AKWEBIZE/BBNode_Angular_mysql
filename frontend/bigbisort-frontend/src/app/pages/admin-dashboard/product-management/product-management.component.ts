import { Component, OnInit } from '@angular/core';
import { ProductManagementService } from './product-management.service';
import { AdminProductDetailDto, AdminProductListDto, ProductStatus } from './product-management.model';

type QueueTab = 'queue' | 'approved' | 'media' | 'categorization';
type DetailTab = 'submission' | 'notes' | 'history';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss'],
  standalone: false
})
export class ProductManagementComponent implements OnInit {

  activeTab: QueueTab = 'queue';
  detailTab: DetailTab = 'submission';

  products: AdminProductListDto[] = [];
  categories: string[] = [];
  categoryFilter = '';
  searchQuery = '';

  page = 0;
  size = 10;
  totalElements = 0;
  pageSizeOptions = [10, 25, 50, 100];

  selectedProduct: AdminProductDetailDto | null = null;
  notesDraft = '';

  loadingList = false;
  loadingDetail = false;
  actionError = '';
  actionInFlight = false;

  constructor(private productMgmtService: ProductManagementService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadQueue();
  }

  get displayedProducts(): AdminProductListDto[] {
    if (!this.categoryFilter) return this.products;
    return this.products.filter(p => p.category === this.categoryFilter);
  }

  get rangeStart(): number {
    return this.totalElements === 0 ? 0 : this.page * this.size + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  setTab(tab: QueueTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.page = 0;
    this.selectedProduct = null;
    if (tab === 'queue' || tab === 'approved') {
      this.loadQueue();
    }
  }

  setPageSize(size: number): void {
    this.size = size;
    this.page = 0;
    this.loadQueue();
  }

  refresh(): void {
    this.loadCategories();
    this.loadQueue();
  }

  private statusForActiveTab(): ProductStatus | undefined {
    return this.activeTab === 'approved' ? 'APPROVED' : 'PENDING_APPROVAL';
  }

  loadQueue(): void {
    if (this.activeTab !== 'queue' && this.activeTab !== 'approved') return;
    this.loadingList = true;
    this.productMgmtService
      .getProducts(this.statusForActiveTab(), this.searchQuery || undefined, this.page, this.size)
      .subscribe({
        next: (res) => {
          this.products = res.content;
          this.totalElements = res.totalElements;
          this.loadingList = false;
          if (!this.selectedProduct && this.products.length) {
            this.selectProduct(this.products[0]);
          }
        },
        error: () => {
          this.loadingList = false;
        }
      });
  }

  loadCategories(): void {
    this.productMgmtService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {}
    });
  }

  selectProduct(item: AdminProductListDto): void {
    this.loadingDetail = true;
    this.actionError = '';
    this.detailTab = 'submission';
    this.productMgmtService.getProductById(item.id).subscribe({
      next: (detail) => {
        this.selectedProduct = detail;
        this.notesDraft = detail.adminNotes || '';
        this.loadingDetail = false;
      },
      error: () => {
        this.loadingDetail = false;
      }
    });
  }

  approve(): void {
    if (!this.selectedProduct) return;
    this.actionInFlight = true;
    this.actionError = '';
    this.productMgmtService.approveProduct(this.selectedProduct.id).subscribe({
      next: () => this.afterAction(),
      error: () => this.onActionError('Failed to approve product.')
    });
  }

  requestChanges(): void {
    if (!this.selectedProduct) return;
    if (!this.notesDraft.trim()) {
      this.actionError = 'Add a note for the seller before requesting changes.';
      return;
    }
    this.actionInFlight = true;
    this.actionError = '';
    this.productMgmtService.requestChanges(this.selectedProduct.id, this.notesDraft.trim()).subscribe({
      next: () => this.afterAction(),
      error: () => this.onActionError('Failed to request changes.')
    });
  }

  reject(): void {
    if (!this.selectedProduct) return;
    if (!this.notesDraft.trim()) {
      this.actionError = 'Add a reason for the seller before rejecting.';
      return;
    }
    this.actionInFlight = true;
    this.actionError = '';
    this.productMgmtService.rejectProduct(this.selectedProduct.id, this.notesDraft.trim()).subscribe({
      next: () => this.afterAction(),
      error: () => this.onActionError('Failed to reject product.')
    });
  }

  saveNotes(): void {
    if (!this.selectedProduct) return;
    this.actionInFlight = true;
    this.actionError = '';
    this.productMgmtService.updateNotes(this.selectedProduct.id, this.notesDraft.trim()).subscribe({
      next: () => {
        if (this.selectedProduct) this.selectedProduct.adminNotes = this.notesDraft.trim();
        this.actionInFlight = false;
      },
      error: () => this.onActionError('Failed to save notes.')
    });
  }

  private afterAction(): void {
    this.actionInFlight = false;
    const id = this.selectedProduct?.id;
    this.selectedProduct = null;
    this.loadQueue();
    if (id) {
      // Re-fetch so the panel reflects the new status even if the item left this tab's list.
      this.productMgmtService.getProductById(id).subscribe({
        next: (detail) => {
          this.selectedProduct = detail;
          this.notesDraft = detail.adminNotes || '';
        }
      });
    }
  }

  private onActionError(message: string): void {
    this.actionInFlight = false;
    this.actionError = message;
  }

  statusLabel(status: ProductStatus | null | undefined): string {
    switch (status) {
      case 'PENDING_APPROVAL': return 'Pending Approval';
      case 'PENDING_UPDATES': return 'Pending Updates';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'DRAFT': return 'Draft';
      default: return 'Unknown';
    }
  }

  exportCsv(): void {
    const rows = this.displayedProducts;
    if (!rows.length) return;

    const header = ['Product', 'Listed By', 'Category', 'Quantity', 'Grade', 'Status', 'Date Added'];
    const lines = rows.map(p => [
      p.productName, p.sellerName, p.category, p.quantitySummary, p.qualityGrade || '', this.statusLabel(p.status), p.createdAt
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));

    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.activeTab === 'approved' ? 'approved-products' : 'product-review-queue'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

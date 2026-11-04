import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AdminProductDetailDto,
  AdminProductListDto,
  AdminProductManagementService,
} from 'src/app/services/admin-product-management.service';
import { OnboardingService } from 'src/app/services/onboarding.service';

interface ProductCategoryOption {
  key: string;
  label: string;
}

type ReviewTab = 'ALL' | 'REVIEW' | 'APPROVED' | 'MEDIA' | 'CATEGORIES';

@Component({
  selector: 'app-admin-product-management',
  templateUrl: './admin-product-management.component.html',
  styleUrls: ['./admin-product-management.component.scss'],
  standalone: false,
})
export class AdminProductManagementComponent implements OnInit {
  activeTab: ReviewTab = 'REVIEW';

  products: AdminProductListDto[] = [];
  totalProducts = 0;

  productNameQuery = '';
  sellerNameQuery = '';
  pageSize = 10;
  currentPage = 0;

  selectedProduct: AdminProductDetailDto | null = null;
  activeDetailTab: 'submission' | 'notes' | 'history' = 'submission';
  noteValue = '';
  saving = false;

  categories: ProductCategoryOption[] = [];
  private categoriesLoaded = false;
  categoryFilter = '';

  readonly rowStatusOptions: { value: string; label: string }[] = [
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING_UPDATES', label: 'Pending Updates' },
  ];

  constructor(
    private productService: AdminProductManagementService,
    private onboardingService: OnboardingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Arriving from another admin screen (e.g. Seller Management's "Products" link) via
    // ?sellerName= — reuse the existing seller-name search box instead of a separate filter.
    const sellerName = this.route.snapshot.queryParamMap.get('sellerName');
    if (sellerName) {
      this.sellerNameQuery = sellerName;
      this.activeTab = 'ALL';
    }
    this.loadProducts();
    this.loadCategories();
  }

  // Same catalog list the seller "Add Product" page uses, so filter options always match the
  // categories a product could actually have been saved with — instead of whatever raw, possibly
  // inconsistent category strings happen to already exist on products in the DB.
  private loadCategories(): void {
    if (this.categoriesLoaded) return;
    this.onboardingService.getCatalogCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesLoaded = true;
      },
      error: (err) => console.error('Error loading categories', err),
    });
  }

  // Backend has no category query param on the list endpoint, so this filters the current page client-side.
  get displayedProducts(): AdminProductListDto[] {
    if (!this.categoryFilter) return this.products;
    return this.products.filter((p) => (p.category || '').toUpperCase() === this.categoryFilter.toUpperCase());
  }

  refresh(): void {
    this.loadCategories();
    if (this.activeTab === 'ALL' || this.activeTab === 'REVIEW' || this.activeTab === 'APPROVED') {
      this.loadProducts();
    }
  }

  private statusForTab(): string | undefined {
    if (this.activeTab === 'REVIEW') return 'PENDING_APPROVAL';
    if (this.activeTab === 'APPROVED') return 'APPROVED';
    return undefined;
  }

  loadProducts(): void {
    this.productService
      .getProducts(this.statusForTab(), this.productNameQuery, this.sellerNameQuery, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.products = res.content;
          this.totalProducts = res.totalElements;
        },
        error: (err) => {
          console.error('Error loading products', err);
          this.products = [];
          this.totalProducts = 0;
        },
      });
  }

  setTab(tab: ReviewTab): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.categoryFilter = '';
    this.closeDetails();
    if (tab === 'ALL' || tab === 'REVIEW' || tab === 'APPROVED') {
      this.loadProducts();
    } else if (tab === 'CATEGORIES') {
      this.loadCategories();
    }
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 0 || page * this.pageSize >= this.totalProducts) return;
    this.currentPage = page;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalProducts / this.pageSize));
  }

  openProductDetails(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.selectedProduct = data;
        this.noteValue = data.adminNotes || '';
        this.activeDetailTab = 'submission';
      },
      error: (err) => console.error('Error loading product details', err),
    });
  }

  closeDetails(): void {
    this.selectedProduct = null;
  }

  onRowStatusChange(product: AdminProductListDto, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    select.value = '';
    if (!newStatus || newStatus === product.status) return;

    this.productService.updateStatus(product.id, newStatus).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Error updating status', err),
    });
  }

  setDetailTab(tab: 'submission' | 'notes' | 'history'): void {
    this.activeDetailTab = tab;
  }

  saveNotes(): void {
    if (!this.selectedProduct) return;
    this.productService.updateNotes(this.selectedProduct.id, this.noteValue).subscribe({
      next: () => (this.selectedProduct!.adminNotes = this.noteValue),
      error: (err) => console.error('Error saving notes', err),
    });
  }

  approve(): void {
    if (!this.selectedProduct) return;
    this.saving = true;
    this.productService.approveProduct(this.selectedProduct.id).subscribe({
      next: () => this.afterAction('APPROVED'),
      error: (err) => {
        console.error('Error approving product', err);
        this.saving = false;
      },
    });
  }

  requestChanges(): void {
    if (!this.selectedProduct) return;
    this.saving = true;
    this.productService.requestChanges(this.selectedProduct.id, this.noteValue).subscribe({
      next: () => this.afterAction('PENDING_UPDATES'),
      error: (err) => {
        console.error('Error requesting changes', err);
        this.saving = false;
      },
    });
  }

  reject(): void {
    if (!this.selectedProduct) return;
    this.saving = true;
    this.productService.rejectProduct(this.selectedProduct.id, this.noteValue).subscribe({
      next: () => this.afterAction('REJECTED'),
      error: (err) => {
        console.error('Error rejecting product', err);
        this.saving = false;
      },
    });
  }

  private afterAction(newStatus: string): void {
    this.saving = false;
    if (this.selectedProduct) {
      this.selectedProduct.status = newStatus;
      this.selectedProduct.adminNotes = this.noteValue;
    }
    this.loadProducts();
  }

  statusLabel(status: string): string {
    if (!status) return '';
    return status
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  }

  statusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'badge-approved';
      case 'REJECTED':
        return 'badge-rejected';
      case 'PENDING_UPDATES':
        return 'badge-updates';
      case 'PENDING_APPROVAL':
        return 'badge-pending';
      default:
        return 'badge-default';
    }
  }
}

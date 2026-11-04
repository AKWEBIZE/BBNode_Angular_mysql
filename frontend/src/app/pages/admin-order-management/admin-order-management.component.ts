import { Component, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  AdminOrderDto,
  AdminOrderManagementService,
  AdminOrderProductOptionDto,
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS
} from 'src/app/services/admin-order-management.service';
import { AdminBuyerListDto, AdminBuyerManagementService } from 'src/app/services/admin-buyer-management.service';
import { OnboardingService } from 'src/app/services/onboarding.service';

@Component({
  selector: 'app-admin-order-management',
  templateUrl: './admin-order-management.component.html',
  styleUrls: ['./admin-order-management.component.scss'],
  standalone: false
})
export class AdminOrderManagementComponent implements OnInit {

  mode: 'list' | 'create' = 'list';
  statusOptions = ORDER_STATUS_OPTIONS;
  paymentMethods = PAYMENT_METHOD_OPTIONS;

  // ─── List state ───
  orders: AdminOrderDto[] = [];
  totalOrders = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;

  filterBuyerName = '';
  filterStatus = '';
  filterProductName = '';
  private listFilterSubject = new Subject<void>();

  // Row-level status-change tracking so only the row being edited shows a busy state.
  statusUpdatingOrderId: string | null = null;

  // ─── Create-form state ───
  isSubmitting = false;
  formErrors: any = {};

  orderDate: string = this.today();
  paymentMethod = '';
  quantityValue: string = '';
  quantityUnit = 'KG';
  measurementUnits: string[] = [];
  grade = '';
  amount: number | null = null;
  paidAmount: number | null = null;
  estimationDateOfArrival = '';
  status = 'PROCESSING';

  // Buyer search (searchable, paginated/scrollable dropdown)
  buyerQuery = '';
  buyerResults: AdminBuyerListDto[] = [];
  buyerPage = 0;
  buyerHasMore = true;
  buyerLoading = false;
  buyerDropdownOpen = false;
  selectedBuyer: AdminBuyerListDto | null = null;
  // The query actually driving the currently-loaded dropdown results — distinct from buyerQuery
  // (the visible input text) because opening the dropdown browses everything regardless of
  // whatever text is already sitting in the box.
  private buyerActiveQuery = '';
  private buyerSearchSubject = new Subject<string>();

  // Product search (searchable, paginated/scrollable dropdown)
  productQuery = '';
  productResults: AdminOrderProductOptionDto[] = [];
  productPage = 0;
  productHasMore = true;
  productLoading = false;
  productDropdownOpen = false;
  selectedProduct: AdminOrderProductOptionDto | null = null;
  private productActiveQuery = '';
  private productSearchSubject = new Subject<string>();

  constructor(
    private orderService: AdminOrderManagementService,
    private buyerService: AdminBuyerManagementService,
    private onboardingService: OnboardingService
  ) {
    this.listFilterSubject.pipe(debounceTime(350)).subscribe(() => {
      this.currentPage = 0;
      this.loadOrders();
    });

    this.buyerSearchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(term => {
      this.buyerActiveQuery = term;
      this.buyerPage = 0;
      this.buyerResults = [];
      this.buyerHasMore = true;
      this.loadBuyers(term);
    });

    this.productSearchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(term => {
      this.productActiveQuery = term;
      this.productPage = 0;
      this.productResults = [];
      this.productHasMore = true;
      this.loadProducts(term);
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.onboardingService.getMeasurementUnits().subscribe({
      next: (units) => {
        this.measurementUnits = units;
        if (!units.includes(this.quantityUnit) && units.length) this.quantityUnit = units[0];
      },
      error: (err) => console.error('Failed to load measurement units', err)
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-group')) {
      this.buyerDropdownOpen = false;
      this.productDropdownOpen = false;
    }
  }

  private today(): string {
    return new Date().toISOString().substring(0, 10);
  }

  // ─── List ───

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders(this.filterBuyerName, this.filterStatus, this.filterProductName, this.currentPage, this.pageSize)
      .subscribe({
        next: (res) => {
          this.orders = res.content || [];
          this.totalOrders = res.totalElements || 0;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load orders', err);
          this.orders = [];
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.listFilterSubject.next();
  }

  clearFilters(): void {
    this.filterBuyerName = '';
    this.filterStatus = '';
    this.filterProductName = '';
    this.onFilterChange();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalOrders / this.pageSize));
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }

  productNames(order: AdminOrderDto): string {
    return (order.productResponseBeanSet || []).map(p => p.productName).join(', ') || '—';
  }

  changeStatus(order: AdminOrderDto, newStatus: string): void {
    if (!newStatus || newStatus === order.orderStatus) return;
    this.statusUpdatingOrderId = order.orderId;
    this.orderService.updateOrderStatus(order.orderId, newStatus).subscribe({
      next: () => {
        order.orderStatus = newStatus;
        this.statusUpdatingOrderId = null;
      },
      error: (err) => {
        console.error('Failed to update order status', err);
        alert('Failed to update order status');
        this.statusUpdatingOrderId = null;
      }
    });
  }

  // ─── Create form ───

  openCreateForm(): void {
    this.resetForm();
    this.mode = 'create';
  }

  cancelCreate(): void {
    this.mode = 'list';
  }

  private resetForm(): void {
    this.formErrors = {};
    this.orderDate = this.today();
    this.paymentMethod = '';
    this.quantityValue = '';
    this.quantityUnit = this.measurementUnits.includes('KG') ? 'KG' : (this.measurementUnits[0] || 'KG');
    this.grade = '';
    this.amount = null;
    this.paidAmount = null;
    this.estimationDateOfArrival = '';
    this.status = 'PROCESSING';
    this.selectedBuyer = null;
    this.buyerQuery = '';
    this.buyerResults = [];
    this.selectedProduct = null;
    this.productQuery = '';
    this.productResults = [];
  }

  get balance(): number {
    const amount = this.amount || 0;
    const paid = this.paidAmount || 0;
    return amount - paid;
  }

  // Buyer search

  // Clicking into the field browses the full, paginated buyer list (10 per page) regardless of
  // whatever text is already in the box — narrowing only happens once the user actually types.
  onBuyerFocus(): void {
    this.buyerDropdownOpen = true;
    this.buyerActiveQuery = '';
    this.buyerPage = 0;
    this.buyerResults = [];
    this.buyerHasMore = true;
    this.loadBuyers('');
  }

  onBuyerQueryInput(): void {
    this.buyerDropdownOpen = true;
    this.buyerSearchSubject.next(this.buyerQuery);
  }

  loadBuyers(query: string): void {
    this.buyerLoading = true;
    this.buyerService.getBuyers(undefined, query, this.buyerPage, 10).subscribe({
      next: (res) => {
        this.buyerResults = this.buyerPage === 0 ? (res.content || []) : [...this.buyerResults, ...(res.content || [])];
        this.buyerHasMore = !res.last;
        this.buyerLoading = false;
      },
      error: () => { this.buyerLoading = false; }
    });
  }

  onBuyerListScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.buyerHasMore && !this.buyerLoading && el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      this.buyerPage++;
      this.loadBuyers(this.buyerActiveQuery);
    }
  }

  selectBuyer(buyer: AdminBuyerListDto): void {
    this.selectedBuyer = buyer;
    this.buyerQuery = buyer.businessName || buyer.name;
    this.buyerDropdownOpen = false;
  }

  // Product search
  onProductFocus(): void {
    this.productDropdownOpen = true;
    this.productActiveQuery = '';
    this.productPage = 0;
    this.productResults = [];
    this.productHasMore = true;
    this.loadProducts('');
  }

  onProductQueryInput(): void {
    this.productDropdownOpen = true;
    this.productSearchSubject.next(this.productQuery);
  }

  loadProducts(query: string): void {
    this.productLoading = true;
    this.orderService.searchProducts(query, this.productPage, 10).subscribe({
      next: (res) => {
        this.productResults = this.productPage === 0 ? (res.content || []) : [...this.productResults, ...(res.content || [])];
        this.productHasMore = !res.last;
        this.productLoading = false;
      },
      error: () => { this.productLoading = false; }
    });
  }

  onProductListScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (this.productHasMore && !this.productLoading && el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      this.productPage++;
      this.loadProducts(this.productActiveQuery);
    }
  }

  selectProduct(product: AdminOrderProductOptionDto): void {
    this.selectedProduct = product;
    this.productQuery = product.productName;
    this.productDropdownOpen = false;
    // Reset quality to the first available grade for this product, if any.
    this.grade = product.grades && product.grades.length ? product.grades[0] : '';
  }

  gradeLabel(grade: string): string {
    return grade.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  validate(): boolean {
    this.formErrors = {};
    let valid = true;
    if (!this.selectedBuyer) { this.formErrors.buyer = 'Select a buyer'; valid = false; }
    if (!this.selectedProduct) { this.formErrors.product = 'Select a product'; valid = false; }
    if (!this.quantityValue || Number(this.quantityValue) <= 0) { this.formErrors.quantity = 'Enter a valid quantity'; valid = false; }
    if (!this.paymentMethod) { this.formErrors.paymentMethod = 'Payment method is required'; valid = false; }
    if (this.amount === null || this.amount < 0) { this.formErrors.amount = 'Enter a valid total'; valid = false; }
    if (this.paidAmount === null || this.paidAmount < 0) { this.formErrors.paidAmount = 'Enter a valid paid amount'; valid = false; }
    if (this.amount !== null && this.paidAmount !== null && this.paidAmount > this.amount) {
      this.formErrors.paidAmount = 'Paid amount cannot exceed total';
      valid = false;
    }
    if (!this.estimationDateOfArrival) { this.formErrors.estimationDateOfArrival = 'Expected delivery date is required'; valid = false; }
    return valid;
  }

  save(): void {
    if (!this.validate()) return;
    this.isSubmitting = true;

    this.orderService.createOrder({
      buyerId: this.selectedBuyer!.id,
      productIds: [this.selectedProduct!.id],
      quantity: `${this.quantityValue} ${this.quantityUnit}`.trim(),
      grade: this.grade || undefined,
      paymentMethod: this.paymentMethod,
      amount: this.amount!,
      paidAmount: this.paidAmount!,
      estimationDateOfArrival: this.estimationDateOfArrival,
      status: this.status,
      orderDate: new Date(this.orderDate)
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.mode = 'list';
        this.currentPage = 0;
        this.loadOrders();
      },
      error: (err) => {
        console.error('Failed to create order', err);
        this.isSubmitting = false;
        alert('Failed to create order');
      }
    });
  }
}

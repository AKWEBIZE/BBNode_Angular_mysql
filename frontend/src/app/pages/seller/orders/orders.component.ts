import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SellerOrderService } from 'src/app/services/seller-order.service';

interface SellerOrderRow {
  orderId: string;
  productName: string;
  buyerName: string;
  quantity: string;
  status: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'IN_TRANSIT', label: 'In-Transit' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'DELIVERED', label: 'Delivered' }
];

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: SellerOrderRow[] = [];
  loading = false;

  sellerId = '';

  productNameFilter = '';
  buyerNameFilter = '';
  selectedStatus = '';
  statusOptions = STATUS_OPTIONS;
  private filterSubject = new Subject<void>();

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 1;
  totalElements = 0;

  constructor(private sellerOrderService: SellerOrderService) {
    this.filterSubject.pipe(debounceTime(350)).subscribe(() => {
      this.currentPage = 0;
      this.loadOrders();
    });
  }

  ngOnInit() {
    this.sellerId = sessionStorage.getItem('sellerId') || '';
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.sellerOrderService.getSellerOrders(
      this.sellerId, this.buyerNameFilter, this.productNameFilter, this.selectedStatus,
      this.currentPage, this.pageSize
    ).subscribe({
      next: (res: any) => {
        const embedded = res?._embedded?.buyerOrderResponseBeanList || [];
        this.orders = embedded.map((o: any) => ({
          orderId: o.orderId,
          productName: (o.productResponseBeanSet || []).map((p: any) => p.productName).join(', ') || '—',
          buyerName: o.buyerInfoBean?.name || '—',
          quantity: o.quantity || '—',
          status: o.orderStatus
        }));
        this.totalElements = res?.page?.totalElements || 0;
        this.totalPages = res?.page?.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.orders = [];
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.filterSubject.next();
  }

  clearFilters() {
    this.productNameFilter = '';
    this.buyerNameFilter = '';
    this.selectedStatus = '';
    this.onFilterChange();
  }

  statusLabel(status: string): string {
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }

  statusClass(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'badge-delivered';
      case 'CANCELLED':
      case 'RETURNED': return 'badge-cancelled';
      case 'SHIPPED':
      case 'IN_TRANSIT': return 'badge-transit';
      default: return 'badge-processing';
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }
}

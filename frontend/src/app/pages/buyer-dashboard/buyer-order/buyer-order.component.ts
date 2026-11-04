import { Component, OnInit } from '@angular/core';
import { BuyerOrderService } from '../service/buyer-order.service';
import { AuthService } from 'src/app/services/auth.service';
import { BuyerOrder, UiOrderStatus } from './buyer-order.model';
import { toUiStatus } from './status-mapping.util';
import { resolveAmount } from './order-mock.util';

type TabValue = 'ALL' | UiOrderStatus;

interface Tab {
  label: string;
  value: TabValue;
}

const PAGE_SIZE = 8;

@Component({
  selector: 'app-buyer-order',
  templateUrl: './buyer-order.component.html',
  styleUrls: ['./buyer-order.component.scss'],
  standalone: false,
})
export class BuyerOrderComponent implements OnInit {
  tabs: Tab[] = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  activeTab: TabValue = 'ALL';
  allOrders: BuyerOrder[] = [];
  selectedOrder: BuyerOrder | null = null;
  currentPage = 1;
  loading = false;

  constructor(
    private buyerOrderService: BuyerOrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const buyerId = this.authService.getBuyerId();
    if (!buyerId) {
      console.warn('Buyer ID not found in sessionStorage.');
      return;
    }

    this.loading = true;
    this.buyerOrderService.filterBuyerOrders({ buyerId }).subscribe({
      next: (response) => {
        this.allOrders = response?._embedded?.buyerOrderResponseBeanList || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching buyer orders:', err);
        this.loading = false;
      },
    });
  }

  uiStatus(order: BuyerOrder): UiOrderStatus {
    return toUiStatus(order);
  }

  amountFor(order: BuyerOrder): number {
    return resolveAmount(order);
  }

  get filteredOrders(): BuyerOrder[] {
    if (this.activeTab === 'ALL') {
      return this.allOrders;
    }
    return this.allOrders.filter((order) => toUiStatus(order) === this.activeTab);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / PAGE_SIZE));
  }

  get pagedOrders(): BuyerOrder[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredOrders.slice(start, start + PAGE_SIZE);
  }

  get rangeStart(): number {
    return this.filteredOrders.length === 0 ? 0 : (this.currentPage - 1) * PAGE_SIZE + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * PAGE_SIZE, this.filteredOrders.length);
  }

  onTabChange(tab: TabValue): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.selectedOrder = null;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onRowClick(order: BuyerOrder): void {
    this.selectedOrder = order;
  }

  onClosePanel(): void {
    this.selectedOrder = null;
  }

  refresh(): void {
    this.loadOrders();
  }
}

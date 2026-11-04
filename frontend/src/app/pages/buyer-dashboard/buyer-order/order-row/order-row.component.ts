import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BuyerOrder, UiOrderStatus } from '../buyer-order.model';
import { getProductDisplay } from '../../shared/product-display.util';

@Component({
  selector: 'tr[app-order-row]',
  templateUrl: './order-row.component.html',
  styleUrls: ['./order-row.component.scss'],
  standalone: false,
  host: {
    '[class.selected]': 'selected',
    '(click)': 'onClick()',
  },
})
export class OrderRowComponent {
  @Input() order!: BuyerOrder;
  @Input() uiStatus: UiOrderStatus = 'PROCESSING';
  @Input() amount = 0;
  @Input() selected = false;
  @Output() rowClick = new EventEmitter<BuyerOrder>();

  get product() {
    return this.order.productResponseBeanSet?.[0];
  }

  get thumb() {
    return getProductDisplay(this.product?.productName || '', this.product?.category);
  }

  get displayOrderId(): string {
    return this.order.orderNumber ? `#${this.order.orderNumber}` : `#ORD-${this.order.orderId.slice(0, 8).toUpperCase()}`;
  }

  get variety(): string {
    return this.product?.varietiesList?.[0]?.varietyName || '—';
  }

  get qualityLabel(): string {
    if (!this.order.grade) return '—';
    return this.order.grade.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  get expectedDelivery(): string | null {
    return this.order.estimationDateOfArrival || null;
  }

  // Real paymentStatus only — no mock fallback here, since "no payment status recorded yet"
  // genuinely means the buyer hasn't paid anything, which "Not Yet" already communicates correctly.
  get paymentStatusLabel(): string {
    switch (this.order.paymentStatus) {
      case 'PAID': return 'Completed';
      case 'PARTIALLY_PAID': return 'Partial Payment';
      default: return 'Not Yet';
    }
  }

  get paymentStatusClass(): string {
    switch (this.order.paymentStatus) {
      case 'PAID': return 'pay-completed';
      case 'PARTIALLY_PAID': return 'pay-partial';
      default: return 'pay-none';
    }
  }

  onClick(): void {
    this.rowClick.emit(this.order);
  }
}

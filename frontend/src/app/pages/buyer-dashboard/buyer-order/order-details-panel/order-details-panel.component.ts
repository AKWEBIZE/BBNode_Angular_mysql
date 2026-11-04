import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { BuyerOrder, UiOrderStatus } from '../buyer-order.model';
import { toUiStatus } from '../status-mapping.util';
import {
  resolveAmount,
  resolveDocuments,
  resolvePaymentDetails,
  resolveShippingDetails,
  resolveStepDates,
  MockDocument,
  MockPaymentDetails,
  MockShippingDetails,
} from '../order-mock.util';
import { getProductDisplay } from '../../shared/product-display.util';

interface StepState {
  label: string;
  state: 'complete' | 'current' | 'pending';
  date: string | null;
}

@Component({
  selector: 'app-order-details-panel',
  templateUrl: './order-details-panel.component.html',
  styleUrls: ['./order-details-panel.component.scss'],
  standalone: false,
})
export class OrderDetailsPanelComponent implements OnChanges {
  @Input() order!: BuyerOrder;
  @Output() close = new EventEmitter<void>();

  uiStatus: UiOrderStatus = 'PROCESSING';
  amount = 0;
  shipping!: MockShippingDetails;
  payment!: MockPaymentDetails;
  documents: MockDocument[] = [];
  steps: StepState[] = [];

  ngOnChanges(): void {
    if (!this.order) return;

    this.uiStatus = toUiStatus(this.order);
    this.amount = resolveAmount(this.order);
    this.shipping = resolveShippingDetails(this.order);
    this.payment = resolvePaymentDetails(this.order, this.amount);
    this.documents = resolveDocuments(this.order);
    this.steps = this.buildSteps();
  }

  get displayOrderId(): string {
    return this.order.orderNumber ? `#${this.order.orderNumber}` : `#ORD-${this.order.orderId.slice(0, 8).toUpperCase()}`;
  }

  get products() {
    return this.order.productResponseBeanSet || [];
  }

  productThumb(product: { productName?: string; category?: string }) {
    return getProductDisplay(product?.productName || '', product?.category);
  }

  get itemAmount(): number {
    const count = this.products.length || 1;
    return Math.round(this.amount / count);
  }

  onClose(): void {
    this.close.emit();
  }

  downloadInvoice(): void {
    // TODO(backend): no invoice generation/document endpoint exists yet.
  }

  viewTracking(): void {
    // TODO(backend): no shipment tracking endpoint exists yet.
  }

  viewPaymentDetails(): void {
    // TODO(backend): no payment breakdown endpoint exists yet.
  }

  downloadDocument(_doc: MockDocument): void {
    // TODO(backend): documents are mocked; no real files exist to download yet.
  }

  private buildSteps(): StepState[] {
    if (this.uiStatus === 'CANCELLED') {
      return [];
    }

    const dates = resolveStepDates(this.order);
    const order = ['PROCESSING', 'SHIPPED', 'DELIVERED'] as const;
    const lastIndex = order.length - 1;
    const currentIndex = order.indexOf(this.uiStatus as (typeof order)[number]);

    // The terminal step (Delivered) has no "current" state of its own — reaching it means done.
    const stepState = (index: number): 'complete' | 'current' | 'pending' => {
      if (index < currentIndex) return 'complete';
      if (index === currentIndex) return index === lastIndex ? 'complete' : 'current';
      return 'pending';
    };

    return [
      { label: 'Order Placed', state: 'complete', date: this.order.orderDate },
      { label: 'Processing', state: stepState(0), date: stepState(0) !== 'pending' ? dates.processingDate : null },
      { label: 'Shipped', state: stepState(1), date: stepState(1) !== 'pending' ? dates.shippedDate : null },
      { label: 'Delivered', state: stepState(2), date: stepState(2) === 'complete' ? dates.deliveredDate : null },
    ];
  }
}

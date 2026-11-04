import { Component, Input } from '@angular/core';

export type BadgeStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const LABELS: Record<BadgeStatus, string> = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
  standalone: false,
})
export class StatusBadgeComponent {
  @Input() status: BadgeStatus = 'PROCESSING';

  get statusClass(): string {
    return this.status.toLowerCase();
  }

  get label(): string {
    return LABELS[this.status];
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  payments = [
    { orderId: '#ORD-1024', buyerName: 'Priya Exports', amount: '$480', paymentStatus: 'Paid', date: '20 June 2026', rawDate: new Date('2026-06-20') },
    { orderId: '#ORD-1021', buyerName: 'Dell Fresh', amount: '$260', paymentStatus: 'Pending', date: '18 June 2026', rawDate: new Date('2026-06-18') },
    { orderId: '#ORD-1018', buyerName: 'Farm Select', amount: '$310', paymentStatus: 'Paid', date: '15 June 2026', rawDate: new Date('2026-06-15') },
    { orderId: '#ORD-1012', buyerName: 'Agro Mart', amount: '$190', paymentStatus: 'Failed', date: '10 June 2026', rawDate: new Date('2026-06-10') }
  ];

  totalEarnings = '$1,240';
  totalPaid = '$980';
  totalPending = '$260';

  ngOnInit() {
    // Sort descending by date default
    this.payments.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }
}

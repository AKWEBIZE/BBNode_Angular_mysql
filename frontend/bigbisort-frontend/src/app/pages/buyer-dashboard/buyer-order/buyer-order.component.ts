import { Component } from '@angular/core';
import { BuyerOrderService } from '../service/buyer-order.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-buyer-order',
    templateUrl: './buyer-order.component.html',
    styleUrls: ['./buyer-order.component.scss'],
    standalone: false
})
export class BuyerOrderComponent {
 searchTerm: string = '';
 

orderStatusCounts = {
  DELIVERED: 0,
  RETURNED: 0,
  CANCELLED: 0,
  IN_TRANSIT: 0
};
totalOrders: number = 0;


  buyerOrderList: any[] = [];

  constructor(private buyerOrderService: BuyerOrderService,private authService: AuthService) {}

  ngOnInit(): void {
    this.loadBuyerOrders();
    this.loadOrderStatusCounts();
  }

loadBuyerOrders(): void {
    const buyerId = this.authService.getBuyerId(); // ✅ Get from sessionStorage

    if (!buyerId) {
      console.warn('⚠️ Buyer ID not found in sessionStorage.');
      return;
    }

    const payload = { buyerId };

    this.buyerOrderService.filterBuyerOrders(payload).subscribe({
      next: (response) => {
        this.buyerOrderList = response?._embedded?.buyerOrderResponseBeanList || [];
        console.log('✅ Orders:', this.buyerOrderList);
      },
      error: (err) => {
        console.error('❌ Error fetching buyer orders:', err);
      }
    });
  }


loadOrderStatusCounts() {
  console.log('Calling loadOrderStatusCounts()');

  const buyerId = '8abd6741-00d7-499f-90e3-8b906c08916d'; // set manually here
  console.log('buyerId from hardcoded value:', buyerId);

  if (!buyerId) {
    console.error('Buyer ID not found. Cannot fetch order status counts.');
    return;
  }

  this.buyerOrderService.getOrderStatusCounts(buyerId).subscribe({
    next: (res) => {
      console.log('API success:', res);
      this.orderStatusCounts = res.buyerOrderStatusCounts || {};
      this.totalOrders = res.totalOrders || 0;
    },
    error: (err) => {
      console.error('Error fetching order status counts:', err);
    }
  });
}



filteredOrders(): any[] {
  if (!this.searchTerm) return this.buyerOrderList;

  const term = this.searchTerm.toLowerCase();

  return this.buyerOrderList.filter(order =>
    order.orderId?.toLowerCase().includes(term) ||
    order.billingCompanyName?.toLowerCase().includes(term) ||
    order.shippingName?.toLowerCase().includes(term) ||
    order.buyerInfoBean?.name?.toLowerCase().includes(term) ||
    order.buyerInfoBean?.email?.toLowerCase().includes(term)
  );
}
  

}

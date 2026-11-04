import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';



@Component({
    selector: 'app-buyer-dashboard',
    templateUrl: './buyer-dashboard.component.html',
    styleUrls: ['./buyer-dashboard.component.scss'],
    standalone: false
})
export class BuyerDashboardComponent implements AfterViewInit, OnDestroy {


   constructor(private authService: AuthService) {} // ✅ inject AuthService
   

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;


   ngOnInit(): void {
    this.buyerName = this.authService.getBuyerName() || 'Buyer';
  }


  scrollInterval: any;
  buyerName: string = ''; 



  iconClass = 'bi bi-bag-check';

quickActions = [
  { label: 'My Orders', icon: 'bi-cart', route: '/buyer/orders' },
  { label: 'Messages', icon: 'bi-chat-left-text', route: '/buyer/messages' },
  { label: 'Categories', icon: 'bi-grid', route: '/buyer/categories' },
  { label: 'New Arrivals', icon: 'bi-person-lines-fill', route: '/buyer/newarr' },
  { label: 'Watchlist', icon: 'bi-grid', route: '/buyer/WL' },
];


featuredProducts = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/toma.jpg',
    cssClass:'color1'
  },
  {
    id: 2,
    name: 'Basmati Rice',
    description: 'Premium quality basmati rice for daily meals.',
    image: 'assets/images/rice.png',
    cssClass:'color2'
  },
  {
    id: 3,
    name: 'COFFEE',
    description: 'Free-range eggs with high protein content.',
    image: 'assets/images/cof.jpg',
    cssClass:'color3'
  },
  {
    id: 4,
    name: 'Alphonso Mangoes',
    description: 'Sweet and flavorful seasonal mangoes.',
    image: 'assets/images/mango.jpg',
    cssClass:'color4'
  },
  {
    id: 5,
    name: 'Red Chilly',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/chilly.jpg',
    cssClass:'color5'
  },
  {
    id: 6,
    name: 'Honey',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/honey.jpg',
    cssClass:'color6'
  },
  {
    id: 7,
    name: 'Apple',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/apple.jpg',
    cssClass:'color7'
  },
  {
    id: 8,
    name: 'Jaggery',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/jagg.jpeg',
    cssClass:'color8'
  },
  {
    id: 9,
    name: 'Guva',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/guva.jfif',
    cssClass:'color9'
  },
  {
    id: 10,
    name: 'Jackfruit',
    description: 'Fresh and juicy tomatoes directly from farms.',
    image: 'assets/images/jack.webp',
    cssClass:'color10'
  },
  
];




  orders = [
    {
      productId: 'P101',
      productName: 'Product A',
      orderDate: '2025-06-18',
      paymentMethod: 'Credit Card',
      quantity: 5
    },
    {
      productId: 'P102',
      productName: 'Product B',
      orderDate: '2025-06-17',
      paymentMethod: 'Net Banking',
      quantity: 3
    },
    {
      productId: 'P103',
      productName: 'Product C',
      orderDate: '2025-06-16',
      paymentMethod: 'UPI',
      quantity: 2
    }
  ];

    ngAfterViewInit(): void {
    this.scrollInterval = setInterval(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollBy({ left: 3, behavior: 'smooth' });

      // Reset when it reaches end
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollTo({ left: 0, behavior: 'auto' });
      }
    }, 30); // speed of scroll
  }

  ngOnDestroy(): void {
    clearInterval(this.scrollInterval);
  }

}


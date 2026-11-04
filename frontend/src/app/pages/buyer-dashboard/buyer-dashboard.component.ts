import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BuyerService, BuyerDashboardSummary, MarketHighlight } from 'src/app/services/buyer.service';
import { ProductService } from './service/product.service';
import { WatchListService } from './service/watch-list.service';
import { Product } from './buyersproducts/product.model';
import { getProductDisplay, getTagLabel, getTagColor } from './shared/product-display.util';

@Component({
    selector: 'app-buyer-dashboard',
    templateUrl: './buyer-dashboard.component.html',
    styleUrls: ['./buyer-dashboard.component.scss'],
    standalone: false
})
export class BuyerDashboardComponent implements OnInit {

  buyerName = '';
  buyerCompany = '';
  buyerCountry = '';
  buyerId: string | null = null;

  summary: BuyerDashboardSummary | null = null;
  recommendedProducts: Product[] = [];
  marketHighlights: MarketHighlight[] = [];
  savedProductIds = new Set<string>();

  quickActions = [
    { icon: '🛍', label: 'Browse Products', description: 'Explore a wide range of agri products from India.', colorClass: 'q1' },
    { icon: '📄', label: 'Request Quote', description: 'Get the best price for your requirements.', colorClass: 'q2' },
    { icon: '💬', label: 'Contact Support', description: "We're here to help you anytime.", colorClass: 'q3' },
    { icon: '📍', label: 'Track Shipments', description: 'Track your orders and shipments in real-time.', colorClass: 'q4' },
  ];

  constructor(
    private authService: AuthService,
    private buyerService: BuyerService,
    private productService: ProductService,
    private watchListService: WatchListService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buyerName = this.authService.getBuyerName() || 'Buyer';
    this.buyerCompany = this.authService.getBuyerCompany() || '';
    this.buyerCountry = this.authService.getBuyerCountry() || '';
    this.buyerId = this.authService.getBuyerId();

    if (this.buyerId) {
      this.buyerService.getDashboardSummary(this.buyerId).subscribe({
        next: (data) => (this.summary = data),
        error: () => (this.summary = null)
      });

      this.watchListService.getSavedProductIds(this.buyerId).subscribe({
        next: (ids) => (this.savedProductIds = new Set(ids)),
        error: () => (this.savedProductIds = new Set())
      });
    }

    this.productService.getRecommendedProducts(4).subscribe({
      next: (products) => (this.recommendedProducts = products),
      error: () => (this.recommendedProducts = [])
    });

    this.buyerService.getMarketHighlights(5).subscribe({
      next: (highlights) => (this.marketHighlights = highlights),
      error: () => (this.marketHighlights = [])
    });
  }

  display(product: Product) {
    return getProductDisplay(product.productName, product.category);
  }

  marketIcon(highlight: MarketHighlight): string {
    return getProductDisplay(highlight.productName, highlight.category).icon;
  }

  tagLabel(product: Product): string {
    return getTagLabel(product.productTag);
  }

  tagColor(product: Product): string {
    return getTagColor(product.productTag);
  }

  isSaved(product: Product): boolean {
    return this.savedProductIds.has(product.productId);
  }

  toggleSave(product: Product, event: Event): void {
    event.stopPropagation();
    if (!this.buyerId) return;

    if (this.isSaved(product)) {
      this.watchListService.removeFromWatchList(this.buyerId, product.productId).subscribe(() => {
        this.savedProductIds.delete(product.productId);
      });
    } else {
      this.watchListService.addToWatchList({
        buyerId: this.buyerId,
        productId: product.productId,
        productName: product.productName
      }).subscribe(() => {
        this.savedProductIds.add(product.productId);
      });
    }
  }

  priceRange(product: Product): string {
    const variety = product.varietiesList?.[0];
    if (!variety || (variety.priceMin == null && variety.priceMax == null)) return 'Price on request';
    return `$${variety.priceMin ?? '-'} - $${variety.priceMax ?? '-'} / MT`;
  }

  moqLabel(product: Product): string {
    const variety = product.varietiesList?.[0];
    return variety?.moq != null ? `Min. Order: ${variety.moq} MT` : '';
  }

  sparklineHeight(value: number, values: number[]): number {
    const max = Math.max(...values, 1);
    return Math.max(10, Math.round((value / max) * 100));
  }

  navigateToExplore(): void {
    this.router.navigate(['/buyer/explore']);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/buyer/explore'], { queryParams: { productId: product.productId } });
  }
}

import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { WatchListService } from 'src/app/pages/buyer-dashboard/service/watch-list.service';
import { ProductViewService } from 'src/app/pages/buyer-dashboard/service/product-view.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { AuthService } from 'src/app/services/auth.service';
import { WatchListItem, WatchProduct } from './watch-list.model';
import { moqLabel, minPrice, priceRangeLabel } from './watchlist-display.util';
import { getProductDisplay, getTagLabel, getTagColor } from '../shared/product-display.util';

type SortOption = 'RECENT' | 'PRICE_ASC' | 'PRICE_DESC';

const RECENTLY_VIEWED = 'RECENTLY_VIEWED';

interface CategoryTab {
  label: string;
  value: string;
  count: number;
}

const PAGE_SIZE = 8;

@Component({
  selector: 'app-watch-list',
  templateUrl: './watch-list.component.html',
  styleUrls: ['./watch-list.component.scss'],
  standalone: false,
})
export class WatchListComponent implements OnInit {
  allItems: WatchListItem[] = [];
  recentlyViewedItems: WatchListItem[] = [];
  loading = false;

  activeCategory = 'ALL';
  sortBy: SortOption = 'RECENT';
  viewMode: 'grid' | 'list' = 'grid';
  currentPage = 1;

  compareSelection = new Set<string>();

  private buyerId: string | null = null;

  constructor(
    private watchListService: WatchListService,
    private productViewService: ProductViewService,
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWatchList();
    this.loadRecentlyViewed();
  }

  loadWatchList(): void {
    this.buyerId = this.authService.getBuyerId();
    if (!this.buyerId) {
      console.warn('Buyer ID not found in sessionStorage.');
      return;
    }

    this.loading = true;
    this.watchListService.getWatchList(this.buyerId).subscribe({
      next: (res) => {
        this.allItems = res?._embedded?.watchListResponseBeanList || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching watchlist:', err);
        this.loading = false;
      },
    });
  }

  loadRecentlyViewed(): void {
    const buyerId = this.authService.getBuyerId();
    if (!buyerId) return;

    this.productViewService.getRecentlyViewed(buyerId).subscribe({
      next: (res) => {
        const viewed = res?._embedded?.productViewResponseBeanList || [];
        // Reuse WatchListItem's shape so the existing card template/sorting works unchanged —
        // `savedAt` here holds viewedAt for recently-viewed items specifically.
        this.recentlyViewedItems = viewed.map((v: any) => ({
          buyerId: v.buyerId,
          productResponseBeans: v.productResponseBeans,
          savedAt: v.viewedAt,
        }));
      },
      error: (err) => console.error('Error fetching recently viewed products:', err),
    });
  }

  get isRecentlyViewedTab(): boolean {
    return this.activeCategory === RECENTLY_VIEWED;
  }

  // Recently-viewed products that aren't already saved — once saved, an item belongs in
  // "All Saved" and its category tabs, not here.
  get displayableRecentlyViewed(): WatchListItem[] {
    const savedIds = new Set(this.allItems.map((i) => i.productResponseBeans.productId));
    return this.recentlyViewedItems.filter((i) => !savedIds.has(i.productResponseBeans.productId));
  }

  // --- Display helpers (used from template) ---
  thumb(product: WatchProduct) {
    return getProductDisplay(product.productName, product.category);
  }

  tagLabel(product: WatchProduct): string {
    return getTagLabel(product.productTag);
  }

  tagColor(product: WatchProduct): string {
    return getTagColor(product.productTag);
  }

  priceLabel(product: WatchProduct): string {
    return priceRangeLabel(product);
  }

  moqLabel(product: WatchProduct): string {
    return moqLabel(product);
  }

  // --- Category tabs ---
  get categoryTabs(): CategoryTab[] {
    const counts = new Map<string, number>();
    for (const item of this.allItems) {
      const category = item.productResponseBeans?.category || 'Others';
      counts.set(category, (counts.get(category) || 0) + 1);
    }

    const tabs: CategoryTab[] = [
      { label: `All Saved (${this.allItems.length})`, value: 'ALL', count: this.allItems.length },
      { label: `Recently Viewed (${this.displayableRecentlyViewed.length})`, value: RECENTLY_VIEWED, count: this.displayableRecentlyViewed.length },
    ];
    Array.from(counts.keys())
      .sort()
      .forEach((category) => {
        tabs.push({ label: `${category} (${counts.get(category)})`, value: category, count: counts.get(category)! });
      });
    return tabs;
  }

  onTabChange(value: string): void {
    this.activeCategory = value;
    this.currentPage = 1;
  }

  onSortChange(value: SortOption): void {
    this.sortBy = value;
    this.currentPage = 1;
  }

  toggleView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // --- Filtering / sorting / pagination ---
  get filteredItems(): WatchListItem[] {
    if (this.isRecentlyViewedTab) {
      return this.sortItems(this.displayableRecentlyViewed);
    }

    const base =
      this.activeCategory === 'ALL'
        ? this.allItems
        : this.allItems.filter((item) => (item.productResponseBeans?.category || 'Others') === this.activeCategory);

    return this.sortItems(base);
  }

  private sortItems(items: WatchListItem[]): WatchListItem[] {
    const sorted = [...items];
    if (this.sortBy === 'PRICE_ASC') {
      sorted.sort((a, b) => minPrice(a.productResponseBeans) - minPrice(b.productResponseBeans));
    } else if (this.sortBy === 'PRICE_DESC') {
      sorted.sort((a, b) => minPrice(b.productResponseBeans) - minPrice(a.productResponseBeans));
    } else {
      sorted.sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime());
    }
    return sorted;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / PAGE_SIZE));
  }

  get pagedItems(): WatchListItem[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredItems.slice(start, start + PAGE_SIZE);
  }

  get rangeStart(): number {
    return this.filteredItems.length === 0 ? 0 : (this.currentPage - 1) * PAGE_SIZE + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * PAGE_SIZE, this.filteredItems.length);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get emptyMessage(): string {
    if (this.isRecentlyViewedTab) {
      return "You haven't viewed any products recently.";
    }
    return this.allItems.length === 0
      ? "You haven't saved any products yet."
      : 'No saved products in this category.';
  }

  // --- Compare ---
  isCompared(productId: string): boolean {
    return this.compareSelection.has(productId);
  }

  toggleCompare(productId: string): void {
    if (this.compareSelection.has(productId)) {
      this.compareSelection.delete(productId);
    } else {
      this.compareSelection.add(productId);
    }
  }

  removeFromCompare(productId: string): void {
    this.compareSelection.delete(productId);
  }

  clearCompare(): void {
    this.compareSelection.clear();
  }

  get compareItems(): WatchListItem[] {
    return this.allItems.filter((item) => this.compareSelection.has(item.productResponseBeans.productId));
  }

  compareNow(): void {
    // TODO(backend/feature): no product-comparison page/endpoint exists yet.
  }

  // --- Save / remove ---
  removeItem(item: WatchListItem): void {
    if (!this.buyerId) return;
    this.watchListService.removeFromWatchList(this.buyerId, item.productResponseBeans.productId).subscribe({
      next: () => {
        this.allItems = this.allItems.filter((i) => i.productResponseBeans.productId !== item.productResponseBeans.productId);
        this.removeFromCompare(item.productResponseBeans.productId);
      },
      error: (err) => console.error('Error removing saved product:', err),
    });
  }

  removeAll(): void {
    if (!this.buyerId || this.allItems.length === 0) return;
    if (!confirm(`Remove all ${this.allItems.length} saved products from your watchlist?`)) return;

    const requests = this.allItems.map((item) =>
      this.watchListService.removeFromWatchList(this.buyerId!, item.productResponseBeans.productId)
    );

    forkJoin(requests.length ? requests : [of(null)]).subscribe({
      next: () => {
        this.allItems = [];
        this.compareSelection.clear();
      },
      error: (err) => console.error('Error removing all saved products:', err),
    });
  }

  saveFromRecentlyViewed(item: WatchListItem): void {
    if (!this.buyerId) return;
    const product = item.productResponseBeans;
    this.watchListService
      .addToWatchList({ buyerId: this.buyerId, productId: product.productId, productName: product.productName })
      .subscribe({
        next: () => {
          this.allItems = [...this.allItems, { ...item, savedAt: new Date().toISOString() }];
        },
        error: (err) => console.error('Error saving product:', err),
      });
  }

  removeFromRecentlyViewed(item: WatchListItem): void {
    if (!this.buyerId) return;
    const productId = item.productResponseBeans.productId;
    this.productViewService.removeView(this.buyerId, productId).subscribe({
      next: () => {
        this.recentlyViewedItems = this.recentlyViewedItems.filter((i) => i.productResponseBeans.productId !== productId);
      },
      error: (err) => console.error('Error removing from recently viewed:', err),
    });
  }

  requestQuote(item: WatchListItem): void {
    if (!this.buyerId) return;
    const product = item.productResponseBeans;
    this.messagingService
      .requestQuote(this.buyerId, [{ productId: product.productId, productName: product.productName }])
      .subscribe({
        next: () => alert(`Quote request sent for ${product.productName}. You can track replies in Messages.`),
        error: (err) => console.error('Error sending quote request:', err),
      });
  }

  requestQuoteForAll(): void {
    if (!this.buyerId || this.allItems.length === 0) return;
    const products = this.allItems.map((i) => ({
      productId: i.productResponseBeans.productId,
      productName: i.productResponseBeans.productName,
    }));
    this.messagingService.requestQuote(this.buyerId, products).subscribe({
      next: () => alert(`Quote request sent for ${products.length} product(s). You can track replies in Messages.`),
      error: (err) => console.error('Error sending bulk quote request:', err),
    });
  }

  contactSupport(): void {
    // TODO(feature): no support/contact routing wired up from this page yet.
  }
}

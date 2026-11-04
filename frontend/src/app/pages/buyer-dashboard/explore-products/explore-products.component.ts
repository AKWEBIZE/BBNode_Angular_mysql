import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from '../service/product.service';
import { WatchListService } from '../service/watch-list.service';
import { ProductViewService } from '../service/product-view.service';
import { Product, ProductFilter } from '../buyersproducts/product.model';
import { getProductDisplay, getTagLabel, getTagColor, titleCase } from '../shared/product-display.util';

@Component({
  selector: 'app-explore-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore-products.component.html',
  styleUrl: './explore-products.component.scss',
})
export class ExploreProductsComponent implements OnInit {
  buyerId: string | null = null;

  categories: string[] = [];
  countries: string[] = [];

  filter: ProductFilter = { category: '', country: '' };
  priceMin: number | null = null;
  priceMax: number | null = null;
  moqMin: number | null = null;
  moqMax: number | null = null;
  searchTerm = '';
  showMoreFilters = false;
  viewMode: 'grid' | 'list' = 'grid';

  products: Product[] = [];
  totalElements = 0;
  totalPages = 0;
  page = 0;
  pageSize = 8;

  savedProductIds = new Set<string>();

  selectedProduct: Product | null = null;
  activeTab: 'details' | 'quality' | 'export' | 'farmer' = 'details';

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private watchListService: WatchListService,
    private productViewService: ProductViewService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buyerId = this.authService.getBuyerId();

    this.productService.getCategoryDropdown().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => (this.categories = [])
    });
    this.productService.getCountryDropdown().subscribe({
      next: (countries) => (this.countries = countries),
      error: () => (this.countries = [])
    });

    if (this.buyerId) {
      this.watchListService.getSavedProductIds(this.buyerId).subscribe({
        next: (ids) => (this.savedProductIds = new Set(ids)),
        error: () => (this.savedProductIds = new Set())
      });
    }

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadProducts();
      if (params['productId']) {
        this.openProductDetails(params['productId']);
      }
    });
  }

  loadProducts(): void {
    const filter: ProductFilter = {
      productName: this.searchTerm,
      category: this.filter.category,
      country: this.filter.country,
      priceMin: this.priceMin ?? undefined,
      priceMax: this.priceMax ?? undefined,
      moqMin: this.moqMin ?? undefined,
      moqMax: this.moqMax ?? undefined,
    };
    this.productService.filterProducts(filter, this.page, this.pageSize).subscribe({
      next: (res) => {
        this.products = res._embedded?.productResponseBeanList || [];
        this.totalElements = res.page?.totalElements ?? this.products.length;
        this.totalPages = res.page?.totalPages ?? 1;
      },
      error: () => {
        this.products = [];
        this.totalElements = 0;
        this.totalPages = 0;
      }
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filter = { category: '', country: '' };
    this.priceMin = null;
    this.priceMax = null;
    this.moqMin = null;
    this.moqMax = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.page = page;
    this.loadProducts();
  }

  toggleMoreFilters(): void {
    this.showMoreFilters = !this.showMoreFilters;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  display(product: Product) {
    return getProductDisplay(product.productName, product.category);
  }

  tagLabel(product: Product): string {
    return getTagLabel(product.productTag);
  }

  tagColor(product: Product): string {
    return getTagColor(product.productTag);
  }

  isSaved(productId: string): boolean {
    return this.savedProductIds.has(productId);
  }

  toggleSave(product: Product, event: Event): void {
    event.stopPropagation();
    if (!this.buyerId) return;

    if (this.isSaved(product.productId)) {
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
    return variety?.moq != null ? `MOQ: ${variety.moq} MT` : '';
  }

  openProductDetails(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.selectedProduct = product;
        this.activeTab = 'details';
        this.recordProductView(productId);
      },
      error: () => (this.selectedProduct = null)
    });
  }

  private recordProductView(productId: string): void {
    if (!this.buyerId) return;
    // Fire-and-forget: viewing a product is tracked for the "Recently Viewed" list on the
    // Saved/Wishlist page, but a failure here must never block viewing the product itself.
    this.productViewService.recordView(this.buyerId, productId).subscribe({ error: () => {} });
  }

  closeDetails(): void {
    this.selectedProduct = null;
  }

  setTab(tab: 'details' | 'quality' | 'export' | 'farmer'): void {
    this.activeTab = tab;
  }

  label(value?: string): string {
    return titleCase(value);
  }

  galleryThumbs(product: Product) {
    return (product.varietiesList || []).map(v => this.display({ ...product, productName: v.varietyName }));
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../pages/buyer-dashboard/service/product.service';
import { Product } from '../../pages/buyer-dashboard/buyersproducts/product.model';
import { getProductDisplay, getTagLabel, getTagColor, titleCase } from '../../pages/buyer-dashboard/shared/product-display.util';
import { AuthService } from '../../services/auth.service';

interface DisplayProduct {
  id: string;
  name: string;
  category: string;
  grade: string;
  priceLabel: string;
  priceApproxUsd: string | null;
  moq: string;
  packaging: string;
  paymentTerms: string;
  deliveryTime: string;
  origin: string;
  farmerInfo: string;
  imageSrc: string | null;
  icon: string;
  iconBg: string;
  tag: string;
  tagLabel: string;
  tagColor: string;
}

interface CategoryTile {
  name: string;
  count: number;
  icon: string;
  bg: string;
}

@Component({
    selector: 'app-Products',
    templateUrl: './products.component.html',
     styleUrls: ['./products.component.scss']
,
    standalone: false
})
export class ProductsComponent implements OnInit {

  constructor(
    private productService: ProductService,
    private auth: AuthService,
    private router: Router
  ) {}

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  // Illustrative FX rate for the ≈ USD price hint shown next to ₹ prices.
  // Not a live rate — swap for a real feed before this is customer-facing.
  usdRate = 83;

  loading = true;
  loadError = false;

  // Real catalog, loaded from the PRODUCT table via ProductController#getProductFilter
  // (POST /product/filter, status=APPROVED so pending/rejected listings never show
  // to a guest). Everything below is derived from this — no local mock data.
  products: DisplayProduct[] = [];
  categories: CategoryTile[] = [];
  newArrivals: DisplayProduct[] = [];
  featuredProduct: DisplayProduct | null = null;

  filteredProducts: DisplayProduct[] = [];

  filterButtons = [
    { label: 'All', value: 'ALL' },
    { label: 'Trending', value: 'TRENDING' },
    { label: 'Popular', value: 'POPULAR' },
    { label: 'Bestseller', value: 'BESTSELLER' },
  ];

  selectedFilter = 'ALL';

  ngOnInit(): void {
    // TODO: paginate once the catalog grows past a page or two — fetching
    // 100 in one go is fine for now, matches "browse everything" UX.
    this.productService.filterProducts({ status: 'APPROVED' }, 0, 100).subscribe({
      next: (res) => {
        const raw = res._embedded?.productResponseBeanList || [];
        this.products = raw.map(p => this.toDisplayProduct(p));
        this.categories = this.buildCategoryTiles(this.products);
        this.newArrivals = this.products
          .filter(p => p.tag === 'TRENDING' || p.tag === 'BESTSELLER')
          .slice(0, 4);
        this.featuredProduct =
          this.products.find(p => p.tag === 'HIGH_DEMAND' || p.tag === 'BESTSELLER') ||
          this.products[0] ||
          null;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  private toDisplayProduct(p: Product): DisplayProduct {
    const variety = p.varietiesList?.[0];
    const display = getProductDisplay(p.productName, p.category);
    const tag = (p.productTag || 'NONE') as string;

    return {
      id: p.productId,
      name: p.productName,
      category: p.category,
      grade: variety?.grade ? titleCase(variety.grade) : 'Ungraded',
      priceLabel: this.priceLabel(variety?.priceMin, variety?.priceMax),
      priceApproxUsd: this.approxUsd(variety?.priceMin ?? variety?.priceMax),
      moq: variety?.moq ? `${variety.moq}` : 'On request',
      packaging: variety?.packingType ? titleCase(variety.packingType) : 'On request',
      paymentTerms: variety?.paymentTerms || 'On request',
      // deliveryTimeDays is stored as a ready-to-display string (e.g. "10 - 15 Days"),
      // not a bare number — show it as-is rather than appending a unit.
      deliveryTime: variety?.deliveryTimeDays || 'On request',
      origin: p.location || 'India',
      farmerInfo: p.farmerInfo || '',
      // Real product photo, stored as a base64 blob (product_image column) — no
      // per-variety image exists in the schema yet, so every card falls back
      // to a category icon rather than a mismatched stock photo.
      imageSrc: p.product_image ? `data:image/jpeg;base64,${p.product_image}` : null,
      icon: display.icon,
      iconBg: display.bg,
      tag,
      tagLabel: getTagLabel(tag),
      tagColor: getTagColor(tag)
    };
  }

  private priceLabel(min?: number, max?: number): string {
    if (min != null && max != null && min !== max) return `₹${min}–₹${max}`;
    if (min != null) return `₹${min}`;
    if (max != null) return `₹${max}`;
    return 'Contact for price';
  }

  private approxUsd(priceInr?: number): string | null {
    if (priceInr == null) return null;
    return (priceInr / this.usdRate).toFixed(2);
  }

  private buildCategoryTiles(products: DisplayProduct[]): CategoryTile[] {
    // Sellers' free-text category values aren't consistently cased in the DB
    // (e.g. "Fruits" vs "FRUITS") — group case-insensitively so those don't
    // split into separate tiles, but still show a clean display label.
    const counts = new Map<string, { label: string; count: number }>();
    products.forEach(p => {
      const raw = (p.category || 'Other').trim();
      const key = raw.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { label: this.properCase(raw), count: 1 });
      }
    });
    return Array.from(counts.values()).map(({ label, count }) => {
      const display = getProductDisplay('', label);
      return { name: label, count, icon: display.icon, bg: display.bg };
    });
  }

  private properCase(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  selectedCategory: string | null = null;

  filterByCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.applyFilters();
    document.querySelector('.product-carousel-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.applyFilters();
  }

  private applyFilters(): void {
    const category = this.selectedCategory?.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      (this.selectedFilter === 'ALL' || p.tag === this.selectedFilter) &&
      (!category || p.category.toLowerCase() === category)
    );
  }

  /**
   * "Enquire" / "Add now" on any product card. There's no RFQ backend yet
   * (see the product-page audit notes), so a logged-in buyer is routed to
   * the one real, working enquiry channel — the Contact form — pre-filled
   * with which product this is about. A guest is sent to log in first and
   * comes straight back here via returnUrl.
   */
  enquire(product: DisplayProduct): void {
    if (!this.auth.getRole()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate(['/contact'], {
      queryParams: { topic: 'Buyer Enquiry', product: product.name },
      fragment: 'contact-form'
    });
  }

  scrollLeft(): void {
    this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }
}

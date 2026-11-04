import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../../../services/onboarding.service';
import { ProductService } from '../../../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  // Form Model
  category = '';
  productName = '';
  productVariety = '';
  description = '';
  
  harvestYear = '';
  harvestMonth = '';
  harvestDay = '';
  quantity: number | null = null;
  unit = 'Kg';
  grade = '';
  packaging = 'Box';

  // Media
  productImage: File | null = null;
  productImageBase64: string | null = null;
  
  productVideo: File | null = null;
  productVideoBase64: string | null = null;

  farmImage: File | null = null;
  farmImageBase64: string | null = null;

  // Reference Data
  categories: any[] = [];
  products: any[] = [];
  varieties: string[] = [];
  measurementUnits: string[] = [];

  // Dropdown UI States
  productSearchTerm = '';
  varietySearchTerm = '';
  filteredProducts: any[] = [];
  filteredVarieties: string[] = [];
  showProductDropdown = false;
  showVarietyDropdown = false;

  // Constants
  private readonly today = new Date();
  private readonly allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years = Array.from({ length: 5 }, (_, i) => (this.today.getFullYear() + i).toString());
  grades = ['Grade A', 'Grade B', 'Grade C', 'Premium'];

  // Expected Harvest must always be today or a future date, so these narrow as the
  // seller picks year/month: the current year only offers the current month onward,
  // and the current year+month only offers today's day onward.
  get months(): string[] {
    const currentYear = this.today.getFullYear();
    if (Number(this.harvestYear) !== currentYear) return this.allMonths;
    return this.allMonths.slice(this.today.getMonth());
  }

  get days(): string[] {
    const year = Number(this.harvestYear);
    const monthIndex = this.allMonths.indexOf(this.harvestMonth);
    const daysInMonth = year && monthIndex >= 0 ? new Date(year, monthIndex + 1, 0).getDate() : 31;

    const isCurrentYearMonth =
      year === this.today.getFullYear() && monthIndex === this.today.getMonth();
    const startDay = isCurrentYearMonth ? this.today.getDate() : 1;

    return Array.from({ length: daysInMonth - startDay + 1 }, (_, i) =>
      (startDay + i).toString().padStart(2, '0')
    );
  }

  onHarvestYearChange(): void {
    if (this.harvestMonth && !this.months.includes(this.harvestMonth)) {
      this.harvestMonth = '';
      this.harvestDay = '';
    } else if (this.harvestDay && !this.days.includes(this.harvestDay)) {
      this.harvestDay = '';
    }
  }

  onHarvestMonthChange(): void {
    if (this.harvestDay && !this.days.includes(this.harvestDay)) {
      this.harvestDay = '';
    }
  }

  isSubmitting = false;
  errors: any = {};

  constructor(
    private onboardingService: OnboardingService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadMeasurementUnits();
  }

  loadCategories() {
    this.onboardingService.getCatalogCategories().subscribe({
      next: (res) => { this.categories = res; },
      error: (err) => { console.error('Failed to load categories', err); }
    });
  }

  loadMeasurementUnits() {
    this.onboardingService.getMeasurementUnits().subscribe({
      next: (res) => { 
        this.measurementUnits = res; 
        if(this.measurementUnits.includes('KG')) this.unit = 'KG'; 
      },
      error: (err) => { console.error('Failed to load measurement units', err); }
    });
  }

  onCategoryChange() {
    this.productName = '';
    this.productVariety = '';
    this.products = [];
    this.varieties = [];
    this.productSearchTerm = '';
    this.varietySearchTerm = '';

    if (this.category) {
      this.onboardingService.getCatalogProducts(this.category).subscribe({
        next: (res) => { 
          this.products = res; 
          this.filteredProducts = res;
        },
        error: (err) => { console.error('Failed to load products', err); }
      });
    }
  }

  onProductSearchInput() {
    if (!this.category) return;
    this.showProductDropdown = true;
    const term = this.productSearchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p => p.label?.toLowerCase().includes(term) || p.key?.toLowerCase().includes(term));
  }

  selectProduct(product: any) {
    this.productName = product.label || product;
    this.showProductDropdown = false;
    this.productSearchTerm = '';
    this.productVariety = '';
    this.varieties = [];
    
    // Load varieties
    this.onboardingService.getCatalogVarieties(this.category, product.key || product).subscribe({
      next: (res) => { 
        this.varieties = res; 
        this.filteredVarieties = res;
      },
      error: (err) => { console.error('Failed to load varieties', err); }
    });
  }

  clearProduct() {
    this.productName = '';
    this.productVariety = '';
    this.filteredProducts = [...this.products];
  }

  onVarietySearchInput() {
    if (!this.productName) return;
    this.showVarietyDropdown = true;
    const term = this.varietySearchTerm.toLowerCase();
    this.filteredVarieties = this.varieties.filter(v => v.toLowerCase().includes(term));
  }

  selectVariety(variety: string) {
    this.productVariety = variety;
    this.showVarietyDropdown = false;
    this.varietySearchTerm = '';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-input-container.p-container')) {
      this.showProductDropdown = false;
    }
    if (!target.closest('.searchable-input-container.v-container')) {
      this.showVarietyDropdown = false;
    }
  }

  selectPackaging(type: string) {
    this.packaging = type;
  }

  selectUnit(unit: string) {
    this.unit = unit;
  }

  // File Handlers
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
         this.errors.image = 'File too large (max 15MB)';
         return;
      }
      this.productImage = file;
      this.errors.image = null;
      this.getBase64(file).then(data => this.productImageBase64 = data as string);
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
         this.errors.video = 'File too large (max 50MB)';
         return;
      }
      this.productVideo = file;
      this.errors.video = null;
      this.getBase64(file).then(data => this.productVideoBase64 = data as string);
    }
  }

  onFarmImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
         this.errors.farmImage = 'File too large (max 15MB)';
         return;
      }
      this.farmImage = file;
      this.errors.farmImage = null;
      this.getBase64(file).then(data => this.farmImageBase64 = data as string);
    }
  }

  getBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Submission
  validate(): boolean {
    this.errors = {};
    let isValid = true;
    
    if (!this.category) { this.errors.category = 'Category is required'; isValid = false; }
    if (!this.productName) { this.errors.productName = 'Product Name is required'; isValid = false; }
    if (!this.productVariety) { this.errors.productVariety = 'Product Variety is required'; isValid = false; }
    if (!this.harvestYear) { this.errors.harvestYear = 'Required'; isValid = false; }
    if (!this.harvestMonth) { this.errors.harvestMonth = 'Required'; isValid = false; }
    if (!this.harvestDay) { this.errors.harvestDay = 'Required'; isValid = false; } // Fallback to 1 if needed
    if (!this.quantity || this.quantity <= 0) { this.errors.quantity = 'Invalid quantity'; isValid = false; }
    if (!this.grade) { this.errors.grade = 'Grade is required'; isValid = false; }
    if (!this.productImageBase64) { this.errors.image = 'At least 1 product image is required'; isValid = false; }

    return isValid;
  }

  cancel() {
    this.router.navigate(['/seller/products']);
  }

  saveAsDraft() {
    this.submit('DRAFT');
  }

  submitForReview() {
    if (this.validate()) {
      this.submit('PENDING_APPROVAL');
    }
  }

  getMonthNumber(monthName: string): string {
    const m = this.allMonths.indexOf(monthName) + 1;
    return m < 10 ? '0' + m : '' + m;
  }

  mapGrade(gradeText: string): string {
    switch (gradeText) {
      case 'Grade A': return 'GRADE_A';
      case 'Grade B': return 'GRADE_B';
      case 'Grade C': return 'GRADE_C';
      case 'Premium': return 'GRADE_EXTRA';
      default: return 'GRADE_A';
    }
  }

  submit(status: string) {
    this.isSubmitting = true;
    const sellerId = sessionStorage.getItem('sellerId') || 'temp-seller'; // fallback if null

    // Date formatting matching step4 "2026-03-29"
    let hardvestDate = null;
    if (this.harvestYear && this.harvestMonth && this.harvestDay) {
       hardvestDate = `${this.harvestYear}-${this.getMonthNumber(this.harvestMonth)}-${this.harvestDay}`;
    } else {
       hardvestDate = '2026-01-01'; // draft fallback
    }

    const payload = {
      id: sellerId,
      authenticationType: 'SELLER',
      productRequestBeanList: [{
        productName: this.productName,
        category: this.category,
        description: this.description || '',
        product_image: this.productImageBase64 ? this.productImageBase64.split(',')[1] : null,
        varietiesRequestBeanList: [{
          varietyName: this.productVariety,
          description: this.description || '',
          harvestDate: hardvestDate,
          estimatedQuantity: this.quantity ? this.quantity.toString() : '0',
          quantityMeasurementType: this.unit,
          grade: this.mapGrade(this.grade),
          packingType: this.packaging.toUpperCase(),
          productVideo: this.productVideoBase64 ? this.productVideoBase64.split(',')[1] : null,
          farmPackingImages: this.farmImageBase64 ? this.farmImageBase64.split(',')[1] : null
        }]
      }]
    };

    // The backend uses /product/add for both
    this.productService.addProduct(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        // The mock backend doesn't take status yet inside product add, wait! We added status filters but the creation API expects PENDING_APPROVAL.
        // Post product it defaults to PENDING_APPROVAL unless modified. 
        this.router.navigate(['/seller/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Failed to save product');
      }
    });

  }
}

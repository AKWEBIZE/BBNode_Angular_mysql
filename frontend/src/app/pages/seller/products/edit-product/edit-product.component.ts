import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { OnboardingService } from '../../../../services/onboarding.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
  productId = '';
  
  // Read-only Form Model
  category = '';
  productName = '';
  productVariety = '';

  // Mutable Form Model
  description = '';
  harvestYear = '';
  harvestMonth = '';
  harvestDay = '';
  quantity: number | null = null;
  unit = 'KG';
  grade = '';
  packaging = 'Box';
  productStatus = '';

  measurementUnits: string[] = [];

  // Media
  productImage: File | null = null;
  productImageBase64: string | null = null;
  productVideoBase64: string | null = null;
  farmImageBase64: string | null = null;

  // Constants
  private readonly today = new Date();
  private readonly allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  grades = ['Grade A', 'Grade B', 'Grade C', 'Premium'];

  // Expected Harvest must always be today or a future date for anything the seller newly
  // picks — but this form also loads an already-saved harvest date, which may already be in
  // the past by the time the product is edited. Each getter below narrows to current/future
  // options while still keeping the product's existing saved value selectable so it doesn't
  // silently disappear from the dropdown when the page loads.
  get years(): string[] {
    const currentYear = this.today.getFullYear();
    const base = Array.from({ length: 5 }, (_, i) => (currentYear + i).toString());
    if (this.harvestYear && !base.includes(this.harvestYear)) return [this.harvestYear, ...base];
    return base;
  }

  get months(): string[] {
    const currentYear = this.today.getFullYear();
    if (Number(this.harvestYear) !== currentYear) return this.allMonths;
    const base = this.allMonths.slice(this.today.getMonth());
    if (this.harvestMonth && !base.includes(this.harvestMonth)) return [this.harvestMonth, ...base];
    return base;
  }

  get days(): string[] {
    const year = Number(this.harvestYear);
    const monthIndex = this.allMonths.indexOf(this.harvestMonth);
    const daysInMonth = year && monthIndex >= 0 ? new Date(year, monthIndex + 1, 0).getDate() : 31;

    const isCurrentYearMonth =
      year === this.today.getFullYear() && monthIndex === this.today.getMonth();
    const startDay = isCurrentYearMonth ? this.today.getDate() : 1;

    const base = Array.from({ length: daysInMonth - startDay + 1 }, (_, i) =>
      (startDay + i).toString().padStart(2, '0')
    );
    if (this.harvestDay && !base.includes(this.harvestDay)) return [this.harvestDay, ...base];
    return base;
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
  isLoading = true;
  errors: any = {};

  constructor(
    private productService: ProductService,
    private onboardingService: OnboardingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.loadMeasurementUnits();
      this.loadProduct();
    } else {
      this.router.navigate(['/seller/products']);
    }
  }

  loadMeasurementUnits() {
    this.onboardingService.getMeasurementUnits().subscribe({
      next: (res) => { 
        this.measurementUnits = res; 
      },
      error: (err) => { console.error('Failed to load measurement units', err); }
    });
  }

  loadProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        // Map Backend properties
        this.category = res.category || '';
        this.productName = res.productName || '';
        this.description = res.description || '';
        this.productStatus = res.productStatus || 'PENDING_APPROVAL';

        if (res.product_image) {
           this.productImageBase64 = 'data:image/jpeg;base64,' + res.product_image;
        }

        if (res.varietiesList && res.varietiesList.length > 0) {
           const v = res.varietiesList[0];
           this.productVariety = v.varietyName || '';
           
           // parse harvestDate 2026-03-29
           if (v.harvestDate) {
              const parts = v.harvestDate.split('T')[0].split('-');
              if (parts.length === 3) {
                 this.harvestYear = parts[0];
                 const monthIdx = parseInt(parts[1], 10) - 1;
                 if (monthIdx >= 0 && monthIdx < 12) this.harvestMonth = this.allMonths[monthIdx];
                 this.harvestDay = parts[2];
              }
           }
           
           this.quantity = v.estimatedQuantity ? parseInt(v.estimatedQuantity, 10) : null;
           // If backend returns KILOGRAM, we might need a fallback, but the UI constraint is sending exactly as received if it's enum Name like KG or TONNE
           this.unit = v.quantityMeasurementType || 'KG';
           this.grade = this.unmapGrade(v.grade);
           
           if (v.packingType) {
              const p = v.packingType.toLowerCase();
              if (p.includes('loose')) this.packaging = 'Loose';
              else if (p.includes('custom')) this.packaging = 'Custom';
              else this.packaging = 'Box';
           }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        alert('Failed to load product details.');
        this.router.navigate(['/seller/products']);
      }
    });
  }

  unmapGrade(gradeEnum: string): string {
    if (!gradeEnum) return 'Grade A';
    switch (gradeEnum) {
      case 'GRADE_A': return 'Grade A';
      case 'GRADE_B': return 'Grade B';
      case 'GRADE_C': return 'Grade C';
      case 'GRADE_EXTRA': return 'Premium';
      default: return 'Grade A';
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
      if (file.size > 15 * 1024 * 1024) { this.errors.image = 'Max 15MB'; return; }
      this.productImage = file;
      this.errors.image = null;
      this.getBase64(file).then(data => this.productImageBase64 = data as string);
    }
  }

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { this.errors.video = 'Max 50MB'; return; }
      this.getBase64(file).then(data => this.productVideoBase64 = data as string);
    }
  }

  onFarmImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { this.errors.farmImage = 'Max 15MB'; return; }
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

  validate(): boolean {
    this.errors = {};
    let isValid = true;
    
    if (!this.harvestYear || !this.harvestMonth || !this.harvestDay) { this.errors.harvestDate = 'Required'; isValid = false; }
    if (!this.quantity || this.quantity <= 0) { this.errors.quantity = 'Invalid quantity'; isValid = false; }
    if (!this.grade) { this.errors.grade = 'Grade required'; isValid = false; }
    if (!this.productImageBase64) { this.errors.image = 'At least 1 product image required'; isValid = false; }

    return isValid;
  }

  cancel() {
    this.router.navigate(['/seller/products']);
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

  save() {
    if (!this.validate()) return;
    this.isSubmitting = true;

    const sellerId = sessionStorage.getItem('sellerId') || 'temp-seller';
    let hardvestDate = `${this.harvestYear}-${this.getMonthNumber(this.harvestMonth)}-${this.harvestDay}`;

    const payload = {
      id: sellerId,
      authenticationType: 'SELLER',
      productRequestBeanList: [{
        productName: this.productName, // Unchanged logic structurally
        category: this.category,
        description: this.description || '',
        product_image: this.productImageBase64 && this.productImageBase64.includes(',') ? this.productImageBase64.split(',')[1] : null,
        varietiesRequestBeanList: [{
          varietyName: this.productVariety,
          description: this.description || '',
          harvestDate: hardvestDate,
          estimatedQuantity: this.quantity ? this.quantity.toString() : '0',
          quantityMeasurementType: this.unit,
          grade: this.mapGrade(this.grade),
          packingType: this.packaging.toUpperCase()
        }]
      }]
    };

    // Use updateProduct from productService
    this.productService.updateProduct(this.productId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/seller/products']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Failed to update product');
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from 'src/app/services/onboarding.service';

interface ProductBlock {
  id?: string;
  category: string;
  product: string;
  variety: string;
  description: string;
  harvestYear: string;
  harvestMonth: string;
  harvestDay: string;
  quantity: string;
  unit: string;
  grade: string;
  packaging: string;
  videoFile?: File;
  videoPreview?: string;
  imageFile?: File;
  imagePreview?: string;
  collapsed: boolean;
  saved: boolean;
  productsList?: any[];
  varietiesList?: string[];
}

@Component({
  selector: 'app-step4-products',
  templateUrl: './step4-products.component.html',
  styleUrls: ['./step4-products.component.scss'],
  standalone: false
})
export class Step4ProductsComponent implements OnInit {
  sellerId = '';

  // Product blocks
  products: ProductBlock[] = [];

  // Reference data
  categories: any[] = [];

  // Available options
  years = ['2025', '2026', '2027', '2028'];
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  days = Array.from({length: 31}, (_, i) => (i + 1).toString());
  grades = ['Grade A', 'Grade B', 'Grade C', 'Premium'];

  errors: any = {};
  isSubmitting = false;

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sellerId = sessionStorage.getItem('sellerId') || '';
    
    // Check local storage for persistent form data
    const savedState = localStorage.getItem(`step4_${this.sellerId}`);
    if (savedState) {
       this.products = JSON.parse(savedState);
       // Re-populate lists for existing products
       this.products.forEach(p => {
         if (p.category) this.onCategoryChange(p);
         if (p.category && p.product) this.onProductChange(p);
       });
    } else {
       this.addProduct(); // Start with one product block
    }
    
    this.loadCategories();
  }

  loadCategories() {
    this.onboardingService.getCatalogCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => this.categories = []
    });
  }

  onCategoryChange(product: ProductBlock) {
    if (product.category) {
      this.onboardingService.getCatalogProducts(product.category).subscribe({
        next: (data) => product.productsList = data,
        error: () => product.productsList = []
      });
    } else {
      product.productsList = [];
    }
    product.product = '';
    product.variety = '';
    product.varietiesList = [];
  }

  onProductChange(product: ProductBlock) {
    if (product.category && product.product) {
      this.onboardingService.getCatalogVarieties(product.category, product.product).subscribe({
        next: (data) => product.varietiesList = data,
        error: () => product.varietiesList = []
      });
    } else {
      product.varietiesList = [];
    }
    product.variety = '';
  }

  addProduct() {
    this.products.push({
      category: '',
      product: '',
      variety: '',
      description: '',
      harvestYear: '',
      harvestMonth: '',
      harvestDay: '',
      quantity: '',
      unit: 'Kg',
      grade: '',
      packaging: 'Box',
      collapsed: false,
      saved: false,
      productsList: [],
      varietiesList: []
    });
  }

  removeProduct(index: number) {
    if (this.products.length > 1) {
      this.products.splice(index, 1);
    }
  }

  toggleCollapse(index: number) {
    this.products[index].collapsed = !this.products[index].collapsed;
  }

  selectPackaging(product: ProductBlock, type: string) {
    product.packaging = type;
  }

  selectUnit(product: ProductBlock, unit: string) {
    product.unit = unit;
  }

  // Video upload
  onVideoSelected(event: Event, product: ProductBlock) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    if (!file.type.startsWith('video/')) {
      this.errors.video = 'Please upload a valid video file (MP4).';
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.errors.video = 'Video file exceeds 50 MB.';
      return;
    }

    product.videoFile = file;
    product.videoPreview = file.name;
    this.errors.video = '';
  }

  // Image upload
  onImageSelected(event: Event, product: ProductBlock) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.errors.image = 'Unsupported format. Please upload JPG or PNG.';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      this.errors.image = 'Image file exceeds 15 MB.';
      return;
    }

    product.imageFile = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => product.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
    this.errors.image = '';
  }

  removeVideo(product: ProductBlock) {
    product.videoFile = undefined;
    product.videoPreview = undefined;
  }

  removeImage(product: ProductBlock) {
    product.imageFile = undefined;
    product.imagePreview = undefined;
  }

  validateProduct(product: ProductBlock, index: number): boolean {
    let valid = true;
    const errKey = `product_${index}`;
    this.errors[errKey] = {};

    if (!product.category) { this.errors[errKey].category = 'Product Category is required.'; valid = false; }
    if (!product.product) { this.errors[errKey].product = 'Product is required.'; valid = false; }
    if (!product.variety) { this.errors[errKey].variety = 'Product Variety is required.'; valid = false; }
    if (!product.harvestYear) { this.errors[errKey].harvestYear = 'Harvest year is required.'; valid = false; }
    if (!product.harvestMonth) { this.errors[errKey].harvestMonth = 'Harvest month is required.'; valid = false; }
    if (!product.harvestDay) { this.errors[errKey].harvestDay = 'Harvest day is required.'; valid = false; }
    if (!product.quantity) { this.errors[errKey].quantity = 'Estimated Quantity is required.'; valid = false; }
    if (!product.grade) { this.errors[errKey].grade = 'Grade is required.'; valid = false; }

    return valid;
  }

  get canContinue(): boolean {
    return this.products.length > 0 && this.products.every(p =>
      !!p.category && !!p.product && !!p.variety &&
      !!p.harvestYear && !!p.harvestMonth && !!p.harvestDay && !!p.quantity && !!p.grade
    );
  }

  getProductErrors(index: number): any {
    return this.errors[`product_${index}`] || {};
  }

  getMonthNumber(monthName: string): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const idx = months.indexOf(monthName) + 1;
    return idx.toString().padStart(2, '0');
  }

  async saveAndContinue() {
    // Validate all products
    let allValid = true;
    this.products.forEach((p, i) => {
      if (!this.validateProduct(p, i)) allValid = false;
    });

    if (!allValid) return;
    if (this.products.length === 0) {
      this.errors.general = 'Please add at least one product to complete onboarding.';
      return;
    }

    localStorage.setItem(`step4_${this.sellerId}`, JSON.stringify(this.products));

    this.isSubmitting = true;

    try {
      // Save each product
      for (const product of this.products) {
        let unitEnum = 'KG';
        if (product.unit === 'Tonnes') unitEnum = 'TONNE';
        if (product.unit === 'Quintal') unitEnum = 'QUINTAL';
        
        let gradeEnum = 'GRADE_A';
        if (product.grade === 'Grade B') gradeEnum = 'GRADE_B';
        if (product.grade === 'Grade C') gradeEnum = 'GRADE_C';
        if (product.grade === 'Premium') gradeEnum = 'GRADE_EXTRA';

        let packingEnum = 'BOX';
        if (product.packaging === 'Loose') packingEnum = 'LOOSE';
        if (product.packaging === 'Custom') packingEnum = 'CUSTOM';
        
        let base64Image = null;
        if (product.imagePreview && product.imagePreview.includes('base64,')) {
          base64Image = product.imagePreview.split('base64,')[1];
        }

        const data = {
          category: product.category,
          productName: product.product,
          varietyName: product.variety,
          description: product.description,
          product_image: base64Image,
          harvestDate: `${product.harvestYear}-${this.getMonthNumber(product.harvestMonth)}-${product.harvestDay.padStart(2, '0')}`,
          quantity: product.quantity,
          unit: unitEnum,
          grade: gradeEnum,
          packagingType: packingEnum
        };

        const res: any = await this.onboardingService.addProduct(this.sellerId, data).toPromise();

        // Upload media if present
        if (res?.productId) {
          if (product.videoFile) {
            await this.onboardingService.uploadProductMedia(res.productId, 'VIDEO', product.videoFile).toPromise();
          }
          if (product.imageFile) {
            await this.onboardingService.uploadProductMedia(res.productId, 'IMAGE', product.imageFile).toPromise();
          }
        }
      }

      // Complete onboarding
      await this.onboardingService.completeOnboarding(this.sellerId).toPromise();

      // Redirect to dashboard
      this.router.navigate(['/seller']);
    } catch (err) {
      this.isSubmitting = false;
      this.errors.general = 'Failed to save. Please try again.';
    }
  }
}

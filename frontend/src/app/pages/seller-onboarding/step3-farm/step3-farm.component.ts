import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from 'src/app/services/onboarding.service';

@Component({
  selector: 'app-step3-farm',
  templateUrl: './step3-farm.component.html',
  styleUrls: ['./step3-farm.component.scss'],
  standalone: false
})
export class Step3FarmComponent implements OnInit {
  sellerId = '';

  // Farm Profile
  farmName = '';
  landSize = '';
  landUnit = 'ACRES';
  farmingMethod = '';
  irrigationType = '';
  exportExperience = false;

  // Export sub-fields
  exportDestinations = '';
  productsExported = '';
  exportVolume = '';

  // Crop selection
  crops: any[] = [];
  selectedCrops: string[] = [];

  // Dropdown data from BE enums
  landMetricUnits: { [key: string]: string } = {};
  irrigationTypes: { [key: string]: string } = {};

  errors: any = {};

  constructor(
    private onboardingService: OnboardingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sellerId = sessionStorage.getItem('sellerId') || '';
    this.loadCrops();
    this.loadDropdownData();
    
    // Check local caching first for immediate persistence, else fallback to API
    const cached = localStorage.getItem('step3_' + this.sellerId);
    if (cached) {
      const fd = JSON.parse(cached);
      this.farmName = fd.farmName || '';
      this.landSize = fd.landSize || '';
      this.landUnit = fd.landUnit || 'ACRES';
      this.farmingMethod = fd.farmingMethod || '';
      this.irrigationType = fd.irrigationType || '';
      this.exportExperience = fd.pastExportExperience || false;
      this.exportDestinations = (fd.exportDestinations || []).join(', ');
      this.productsExported = (fd.productsExported || []).join(', ');
      this.exportVolume = fd.exportVolume || '';
      this.selectedCrops = fd.selectedCrops || [];
    } else {
      this.onboardingService.getOnboardingStatus(this.sellerId).subscribe({
        next: (status: any) => {
          if (status.formData) {
            const fd = status.formData;
            this.farmName = fd.farmName || '';
            this.landSize = fd.landSize || '';
            this.landUnit = fd.landUnit || 'ACRES';
            this.farmingMethod = fd.farmingMethod || '';
            this.irrigationType = fd.irrigationType || '';
            this.exportExperience = fd.pastExportExperience || false;
            this.exportDestinations = (fd.exportDestinations || []).join(', ');
            this.productsExported = (fd.productsExported || []).join(', ');
            this.exportVolume = fd.exportVolume || '';
            this.selectedCrops = fd.selectedCrops || [];
          }
        },
        error: () => {}
      });
    }
  }

  loadCrops() {
    this.onboardingService.getCrops().subscribe(data => this.crops = data);
  }

  loadDropdownData() {
    this.onboardingService.getLandUnits().subscribe(data => this.landMetricUnits = data);
    this.onboardingService.getIrrigationTypes().subscribe(data => this.irrigationTypes = data);
  }

  selectFarmingMethod(method: string) {
    this.farmingMethod = method;
    this.errors.farmingMethod = '';
  }

  toggleCrop(cropId: string) {
    const idx = this.selectedCrops.indexOf(cropId);
    if (idx > -1) {
      this.selectedCrops.splice(idx, 1);
    } else {
      this.selectedCrops.push(cropId);
    }
    this.errors.crops = '';
  }

  isCropSelected(cropId: string): boolean {
    return this.selectedCrops.includes(cropId);
  }

  toggleExportExperience(val: boolean) {
    this.exportExperience = val;
  }

  get canContinue(): boolean {
    return !!this.landSize && !!this.farmingMethod && !!this.irrigationType && this.selectedCrops.length > 0;
  }

  validate(): boolean {
    this.errors = {};
    if (!this.landSize) {
      this.errors.landSize = 'Please enter your total land size.';
    } else if (parseFloat(this.landSize) < 0) {
      this.errors.landSize = 'Land size cannot be negative.';
    }
    if (!this.farmingMethod) this.errors.farmingMethod = 'Please select a farming method.';
    if (!this.irrigationType) this.errors.irrigationType = 'Please select your irrigation type.';
    if (this.selectedCrops.length === 0) this.errors.crops = 'Please select at least one crop to continue.';
    if (this.exportExperience) {
      if (!this.exportDestinations) this.errors.exportDestinations = 'Export destinations are required.';
      if (!this.productsExported) this.errors.productsExported = 'Products exported are required.';
    }
    return Object.keys(this.errors).length === 0;
  }

  saveAndContinue() {
    if (!this.validate()) return;

    const data = {
      farmName: this.farmName,
      landSize: this.landSize,
      landUnit: this.landUnit,
      farmingMethod: this.farmingMethod,
      irrigationType: this.irrigationType,
      pastExportExperience: this.exportExperience,
      exportDestinations: this.exportDestinations ? this.exportDestinations.split(',').map(s => s.trim()) : [],
      productsExported: this.productsExported ? this.productsExported.split(',').map(s => s.trim()) : [],
      exportVolume: this.exportVolume,
      selectedCrops: this.selectedCrops
    };

    localStorage.setItem('step3_' + this.sellerId, JSON.stringify(data));

    this.onboardingService.saveStep3(this.sellerId, data).subscribe({
      next: () => this.router.navigate(['/onboarding/products']),
      error: () => alert('Failed to save. Please try again.')
    });
  }
}

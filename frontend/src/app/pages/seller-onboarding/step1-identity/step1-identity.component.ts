import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-step1-identity',
  templateUrl: './step1-identity.component.html',
  styleUrls: ['./step1-identity.component.scss'],
  standalone: false
})
export class Step1IdentityComponent implements OnInit {
  // Entity type selection
  entityTypes = [
    { id: 'INDIVIDUAL_FARMER', label: 'Individual Farmer', icon: '👨‍🌾' },
    { id: 'FARM_OR_RESTATE', label: 'Farm / Estate', icon: '🏠' },
    { id: 'FPO_OR_GROUP', label: 'FPO / Group', icon: '🤝' },
    { id: 'Company', label: 'Company', icon: '🏢' }
  ];
  selectedEntityType = '';

  // Form fields
  fullName = '';
  username = '';
  email = '';
  mobile = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  state = '';
  district = '';
  village = '';
  pincode = '';
  pincodeAutofillSuccess = false;
  pincodeAutofillError = false;

  // Reference data
  states: any[] = [];
  districts: any[] = [];

  // OTP state
  mobileVerified = false;
  otpSent = false;
  otpCode = '';
  otpTimer = 0;
  otpInterval: any;
  sendingOtp = false;
  otpAttempts = 0;

  // Validation errors
  errors: any = {};

  // Mode: 'new' = fresh registration, 'edit' = returning seller
  isExistingSeller = false;
  isSubmitting = false;

  constructor(
    private onboardingService: OnboardingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStates();

    // Check if seller already exists (returning user)
    const sellerId = this.authService.getSellerId();
    if (sellerId) {
      this.isExistingSeller = true;
      // Load existing data from onboarding status
      this.onboardingService.getOnboardingStatus(sellerId).subscribe({
        next: (status: any) => {
          if (status.formData) {
            this.fullName = status.formData.fullName || '';
            this.email = status.formData.email || '';
            this.mobile = status.formData.mobile || '';
            this.state = status.formData.state || '';
            this.district = status.formData.district || '';
            this.village = status.formData.village || '';
            this.pincode = status.formData.pincode || '';
            this.selectedEntityType = status.formData.entityType || '';
            this.mobileVerified = status.formData.mobileVerified || false;
            if (this.state) this.onStateChange();
          }
        },
        error: () => {}
      });
    }
  }

  loadStates() {
    this.onboardingService.getStates().subscribe(data => this.states = data);
  }

  onStateChange(event?: any, preselectDistrict?: string) {
    if (event) {
      // Extract the state NAME (not code) from the dropdown event
      this.state = typeof event === 'object' ? event.name : event;
    }
    if (this.state) {
      // Keep a district only if the caller asked for one or one was already chosen
      // (returning seller / pincode autofill); otherwise reset it on state change.
      const wantedDistrict = preselectDistrict || this.district;
      this.district = '';

      // Find the state code for the district API lookup
      const stateCode = this.getStateCode();
      if (stateCode) {
        this.onboardingService.getDistricts(stateCode).subscribe(data => {
          this.districts = data;
          // Only select the district once the list is here, so the dropdown can display it
          if (wantedDistrict && this.districts.includes(wantedDistrict)) {
            this.district = wantedDistrict;
          }
        });
      }
    } else {
      this.districts = [];
      this.district = '';
    }
    this.errors.state = '';
  }

  onDistrictChange(event: any) {
    this.district = typeof event === 'object' ? event : event;
    this.errors.district = '';
  }

  getStateName(): string {
    // this.state already holds the full name (e.g. "Tamil Nadu")
    return this.state || '';
  }

  getStateCode(): string {
    if (!this.state || !this.states) return '';
    const st = this.states.find((s: any) => s.name === this.state);
    return st ? st.code : '';
  }

  onPincodeChange() {
    this.pincodeAutofillSuccess = false;
    this.pincodeAutofillError = false;
    if (this.pincode && this.pincode.length === 6) {
      this.onboardingService.getPincodeInfo(this.pincode).subscribe({
        next: (data) => {
          // The state dropdown is bound by NAME (valueKey="name"), so use data.state;
          // fall back to resolving the name from data.stateCode if the name is missing.
          const stateName = data.state
            || (this.states.find((s: any) => s.code === data.stateCode)?.name ?? '');
          if (stateName) {
            this.state = stateName;
            // District is applied once the district list for this state has loaded
            this.onStateChange(undefined, data.district || undefined);
            this.pincodeAutofillSuccess = true;
          } else {
            this.pincodeAutofillError = true;
          }
        },
        error: () => {
          this.pincodeAutofillError = true;
        }
      });
    }
  }

  selectEntityType(id: string) {
    this.selectedEntityType = id;
    this.errors.entityType = '';
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  // --- OTP ---
  sendOtp() {
    if (!this.mobile || this.mobile.length !== 10) {
      this.errors.mobile = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    // Only show the OTP box once the backend confirms the send - flipping otpSent before the
    // call left the user waiting on a code that was never sent when delivery failed.
    this.errors.mobile = '';
    this.sendingOtp = true;
    this.authService.sendOtp({ mobile: this.mobile }).subscribe({
      next: () => {
        this.sendingOtp = false;
        this.otpSent = true;
        this.otpTimer = 270;
        this.startTimer();
      },
      error: (err: any) => {
        this.sendingOtp = false;
        this.otpSent = false;
        clearInterval(this.otpInterval);
        this.otpTimer = 0;
        this.errors.mobile = err?.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  startTimer() {
    clearInterval(this.otpInterval);
    this.otpInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) clearInterval(this.otpInterval);
    }, 1000);
  }

  get timerDisplay(): string {
    const min = Math.floor(this.otpTimer / 60);
    const sec = this.otpTimer % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  verifyOtp() {
    if (!this.otpCode || this.otpCode.length < 6) {
      this.errors.otp = 'Please enter a valid 6-digit OTP.';
      return;
    }
    this.authService.verifyOtp({ mobile: this.mobile, otp: this.otpCode }).subscribe({
      next: () => {
        this.mobileVerified = true;
        this.otpSent = false;
        clearInterval(this.otpInterval);
      },
      error: () => {
        this.otpAttempts++;
        if (this.otpAttempts >= 3) {
          this.errors.otp = 'Too many incorrect attempts. Please request a new OTP.';
          this.otpSent = false;
        } else {
          this.errors.otp = 'Invalid OTP. Please try again.';
        }
      }
    });
  }

  resendOtp() {
    if (this.otpTimer > 0) return;
    this.otpAttempts = 0;
    this.errors.otp = '';
    this.sendOtp();
  }

  onMobileChange() {
    if (this.mobileVerified) {
      this.mobileVerified = false;
      this.otpSent = false;
    }
  }

  // --- Validation ---
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isStrongPassword(password: string): boolean {
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password);
  }

  get canContinue(): boolean {
    const base = !!this.selectedEntityType &&
           !!this.fullName &&
           !!this.email && this.isValidEmail(this.email) &&
           this.mobileVerified &&
           !!this.state && !!this.district && !!this.village && !!this.pincode &&
           !this.isSubmitting;

    // New seller also needs username and password
    if (!this.isExistingSeller) {
      return base && !!this.username &&
             this.isStrongPassword(this.password) && this.password === this.confirmPassword;
    }
    return base;
  }

  validate(): boolean {
    this.errors = {};
    if (!this.selectedEntityType) this.errors.entityType = 'Please select your seller type.';
    if (!this.fullName) this.errors.fullName = 'Full Name is required.';
    if (!this.email) this.errors.email = 'Email Address is required.';
    else if (!this.isValidEmail(this.email)) this.errors.email = 'Please enter a valid email address.';
    if (!this.mobileVerified) this.errors.mobile = 'Mobile number must be verified via OTP.';
    if (!this.state) this.errors.state = 'Please select your State.';
    if (!this.district) this.errors.district = 'Please select your District.';
    if (!this.village) this.errors.village = 'Village is required.';
    if (!this.pincode) this.errors.pincode = 'Pincode is required.';
    else if (this.pincode.length !== 6) this.errors.pincode = 'Please enter a valid 6-digit pincode.';

    // Username & password validation for new sellers
    if (!this.isExistingSeller) {
      if (!this.username) this.errors.username = 'Username is required.';
      if (!this.password) this.errors.password = 'Password is required.';
      else if (!this.isStrongPassword(this.password)) this.errors.password = 'Min 8 chars with 1 uppercase, 1 number, 1 special character.';
      if (!this.confirmPassword) this.errors.confirmPassword = 'Please confirm your password.';
      else if (this.password !== this.confirmPassword) this.errors.confirmPassword = 'Passwords do not match.';
    }

    return Object.keys(this.errors).length === 0;
  }

  // --- Save ---
  saveAndContinue() {
    if (!this.validate()) return;
    this.isSubmitting = true;

    if (this.isExistingSeller) {
      // Existing seller → update identity via step-1 API
      this.updateIdentity();
    } else {
      // New seller → create account via seller sign-up API
      this.createSellerAccount();
    }
  }

  private createSellerAccount() {
    const signupData = {
      name: this.fullName.trim(),
      userName: this.username.trim(),
      email: this.email,
      phone: this.mobile,
      password: this.password,
      state: this.getStateName(),
      district: this.district,
      village: this.village,
      pin_code: this.pincode,
      sellerIdentity: this.selectedEntityType,
      mobileVerified: this.mobileVerified
    };

    this.authService.registerSeller(signupData).subscribe({
      next: (res: any) => {
        // Store seller data + the token sign-up issued. Steps 2-4 call the protected
        // /api/onboarding/** endpoints, so without this every upload is a 403.
        if (res.sellerId) {
          this.authService.setSellerId(res.sellerId);
        }
        if (res.userId) {
          this.authService.setUserId(res.userId);
        }
        if (res.accessToken) {
          this.authService.setToken(res.accessToken);
        }
        this.authService.setSellerName(this.fullName.trim());
        this.authService.setSellerEmail(this.email);
        this.authService.setSellerPhone(this.mobile);
        this.authService.setRole('SELLER');
        this.isExistingSeller = true;
        this.isSubmitting = false;

        // Navigate to step 2
        this.router.navigate(['/onboarding/verification']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err.error?.message || '';
        if (msg.toLowerCase().includes('mobile') || msg.toLowerCase().includes('phone')) {
          this.errors.mobile = 'This mobile number is already registered.';
        } else if (msg.toLowerCase().includes('email')) {
          this.errors.email = 'This email is already registered.';
        } else if (msg.toLowerCase().includes('username') || msg.toLowerCase().includes('user name')) {
          this.errors.username = 'This username is already taken.';
        } else {
          this.errors.general = msg || 'Registration failed. Please try again.';
        }
      }
    });
  }

  private updateIdentity() {
    const sellerId = this.authService.getSellerId() || '';
    const data = {
      entityType: this.selectedEntityType,
      fullName: this.fullName,
      email: this.email,
      mobile: this.mobile,
      mobileVerified: this.mobileVerified,
      state: this.getStateName(),
      district: this.district,
      village: this.village,
      pincode: this.pincode
    };

    this.onboardingService.saveStep1(sellerId, data).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/onboarding/verification']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errors.general = 'Failed to save. Please try again.';
      }
    });
  }
}

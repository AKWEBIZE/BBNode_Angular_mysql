import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EnquiryRequest, EnquiryService, LoginTypeOption } from 'src/app/services/enquiry.service';
import { OnboardingService } from 'src/app/services/onboarding.service';

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// 10 digits starting 6-9; the +91 prefix is shown as a fixed adornment, not typed.
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
export const COMMENTS_MAX = 250;

/**
 * "Send Enquiry" modal for the home contact page. Common fields are always present; the
 * SELLER / BUYER groups are added to and removed from the form as the login type changes,
 * so validation only ever applies to the fields the user can see.
 */
@Component({
  selector: 'app-enquiry-dialog',
  templateUrl: './enquiry-dialog.component.html',
  styleUrls: ['./enquiry-dialog.component.scss'],
  standalone: false
})
export class EnquiryDialogComponent implements OnInit, OnDestroy {
  /** What the visitor clicked to get here (e.g. "Farmer Support"); not shown, but sent with the enquiry. */
  @Input() topic = '';
  @Output() closed = new EventEmitter<void>();

  form: FormGroup;
  loginTypes: LoginTypeOption[] = [];
  loginTypesError = false;

  states: any[] = [];
  districts: string[] = [];
  countries: string[] = [];

  submitting = false;
  submitError = '';
  successMessage = '';

  readonly commentsMax = COMMENTS_MAX;

  private subs = new Subscription();
  private autoCloseTimer: any;

  constructor(
    private fb: FormBuilder,
    private enquiryService: EnquiryService,
    private onboardingService: OnboardingService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)]],
      loginType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.enquiryService.getLoginTypes().subscribe({
      next: (types) => (this.loginTypes = types || []),
      error: () => (this.loginTypesError = true)
    });

    this.subs.add(
      this.form.get('loginType')!.valueChanges.subscribe((type: string) => this.applyLoginType(type))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    clearTimeout(this.autoCloseTimer);
  }

  // --- Conditional groups -------------------------------------------------

  get isSeller(): boolean { return this.form.get('loginType')?.value === 'SELLER'; }
  get isBuyer(): boolean { return this.form.get('loginType')?.value === 'BUYER'; }

  private applyLoginType(type: string) {
    // Drop whichever group is no longer relevant so its validators stop blocking submit.
    ['contactNumber', 'state', 'district', 'companyName', 'country', 'comments']
      .forEach(name => { if (this.form.contains(name)) this.form.removeControl(name); });
    this.districts = [];

    if (type === 'SELLER') {
      this.form.addControl('contactNumber', new FormControl('', [Validators.required, Validators.pattern(INDIAN_MOBILE_PATTERN)]));
      this.form.addControl('state', new FormControl('', Validators.required));
      this.form.addControl('district', new FormControl({ value: '', disabled: true }, Validators.required));
      this.form.addControl('comments', new FormControl('', Validators.maxLength(COMMENTS_MAX)));
      if (!this.states.length) {
        this.onboardingService.getStates().subscribe(data => (this.states = data || []));
      }
    } else if (type === 'BUYER') {
      this.form.addControl('companyName', new FormControl('', [Validators.required, Validators.maxLength(150)]));
      this.form.addControl('country', new FormControl('', Validators.required));
      this.form.addControl('comments', new FormControl('', Validators.maxLength(COMMENTS_MAX)));
      if (!this.countries.length) {
        this.enquiryService.getCountries().subscribe(data => (this.countries = data || []));
      }
    }
  }

  // --- State → District cascade (reuses the onboarding searchable dropdown) --

  onStateChange(event: any) {
    const stateName = typeof event === 'object' && event ? event.name : event;
    this.form.get('state')?.setValue(stateName || '');
    this.form.get('state')?.markAsTouched();

    const district = this.form.get('district');
    district?.setValue('');
    this.districts = [];

    const st = this.states.find((s: any) => s.name === stateName);
    if (st?.code) {
      this.onboardingService.getDistricts(st.code).subscribe(data => {
        this.districts = data || [];
        district?.enable();
      });
    } else {
      district?.disable();
    }
  }

  onDistrictChange(event: any) {
    this.form.get('district')?.setValue(event || '');
    this.form.get('district')?.markAsTouched();
  }

  // --- Helpers used by the template ------------------------------------------

  ctrl(name: string): FormControl | null {
    return (this.form.get(name) as FormControl) || null;
  }

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  errorFor(name: string): string {
    const c = this.form.get(name);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'This field is required.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters.`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} characters.`;
    if (name === 'email' && (c.errors['email'] || c.errors['pattern'])) return 'Enter a valid email address.';
    if (name === 'contactNumber' && c.errors['pattern']) return 'Enter a valid 10-digit Indian mobile number (starts 6–9).';
    return 'Invalid value.';
  }

  get commentsLength(): number {
    return (this.form.get('comments')?.value || '').length;
  }

  get canSubmit(): boolean {
    return this.form.valid && !this.submitting && !this.successMessage;
  }

  // --- Submit / close ---------------------------------------------------------

  submit() {
    this.form.markAllAsTouched();
    if (!this.canSubmit) return;

    const v = this.form.getRawValue();
    const seller = v.loginType === 'SELLER';
    // Only the group for the chosen type goes over the wire; everything else is null.
    const payload: EnquiryRequest = {
      topic: this.topic || null,
      name: v.name.trim(),
      email: v.email.trim(),
      loginType: v.loginType,
      contactNumber: seller ? v.contactNumber : null,
      state: seller ? v.state : null,
      district: seller ? v.district : null,
      companyName: !seller ? v.companyName.trim() : null,
      country: !seller ? v.country : null,
      comments: (v.comments || '').trim() || null
    };

    this.submitting = true;
    this.submitError = '';
    this.enquiryService.submit(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.successMessage = res?.message || 'Your enquiry has been sent.';
        this.autoCloseTimer = setTimeout(() => this.close(), 3500);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || 'Could not send your enquiry. Please try again.';
      }
    });
  }

  close() {
    clearTimeout(this.autoCloseTimer);
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('enquiry-backdrop')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }
}

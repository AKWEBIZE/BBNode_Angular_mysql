import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  // Form fields
  fullName = '';
  mobile = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  // Validation errors
  errors: any = {};

  // Loading state
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in as seller, redirect
    const role = this.authService.getRole();
    if (role === 'SELLER') {
      this.router.navigate(['/onboarding/identity']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isStrongPassword(password: string): boolean {
    // Min 8 chars, 1 uppercase, 1 number, 1 special char
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(password);
  }

  validate(): boolean {
    this.errors = {};

    if (!this.fullName.trim()) {
      this.errors.fullName = 'Full Name is required.';
    }

    if (!this.mobile) {
      this.errors.mobile = 'Mobile Number is required.';
    } else if (!/^\d{10}$/.test(this.mobile)) {
      this.errors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    if (!this.email) {
      this.errors.email = 'Email Address is required.';
    } else if (!this.isValidEmail(this.email)) {
      this.errors.email = 'Please enter a valid email address.';
    }

    if (!this.password) {
      this.errors.password = 'Password is required.';
    } else if (!this.isStrongPassword(this.password)) {
      this.errors.password = 'Min 8 chars with 1 uppercase, 1 number, 1 special character.';
    }

    if (!this.confirmPassword) {
      this.errors.confirmPassword = 'Please confirm your password.';
    } else if (this.password !== this.confirmPassword) {
      this.errors.confirmPassword = 'Passwords do not match.';
    }

    return Object.keys(this.errors).length === 0;
  }

  get canSubmit(): boolean {
    return !!this.fullName.trim() &&
           /^\d{10}$/.test(this.mobile) &&
           this.isValidEmail(this.email) &&
           this.isStrongPassword(this.password) &&
           this.password === this.confirmPassword &&
           !this.isSubmitting;
  }

  register() {
    if (!this.validate()) return;
    this.isSubmitting = true;

    const request = {
      name: this.fullName.trim(),
      userName: this.email, // Use email as username
      email: this.email,
      phone: this.mobile,
      password: this.password
    };

    this.authService.registerSeller(request).subscribe({
      next: (res: any) => {
        // Store seller data for pre-population in onboarding, plus the token
        // sign-up issued so the protected onboarding endpoints are reachable.
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

        // Redirect to onboarding step 1
        this.router.navigate(['/onboarding/identity']);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err.error?.message || '';
        if (msg.toLowerCase().includes('mobile') || msg.toLowerCase().includes('phone')) {
          this.errors.mobile = 'This mobile number is already registered.';
        } else if (msg.toLowerCase().includes('email')) {
          this.errors.email = 'This email is already registered.';
        } else if (msg.toLowerCase().includes('username') || msg.toLowerCase().includes('user name')) {
          this.errors.email = 'This email is already registered.';
        } else {
          this.errors.general = msg || 'Registration failed. Please try again.';
        }
      }
    });
  }
}

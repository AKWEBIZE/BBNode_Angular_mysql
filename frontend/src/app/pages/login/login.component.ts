import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { OnboardingService } from 'src/app/services/onboarding.service';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {

  loginType: 'buyer' | 'seller' = 'buyer';

  // Buyer
  username = '';
  password = '';

  // Seller
  phone = '';
  otp = '';

  loginErrors: any = {};

  // Register
  isRegisterVisible = false;

  registerData = {
    name: '',
    userName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    password: ''
  };

  registerErrors: any = {};

  // Where to send the user after a successful login — set when a guest was
  // redirected here from a gated action (e.g. "Enquire" on a product).
  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private onboardingService: OnboardingService,
    private googleAuth: GoogleAuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // ?type=buyer|seller preselects the tab, so links like the contact-page channel cards
    // land the visitor on the right form instead of the default buyer one.
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type === 'buyer' || type === 'seller') {
      this.loginType = type;
    }
    this.renderGoogleButton();
  }

  private renderGoogleButton(): void {
    // Deferred a tick so the *ngIf-gated button container exists in the DOM.
    setTimeout(() => {
      this.googleAuth.renderButton('google-signin-btn', (idToken) => this.handleGoogleCredential(idToken));
    });
  }

  setLoginType(type: 'buyer' | 'seller') {
    this.loginType = type;
    this.clearFields();
  }

  private clearFields() {
    this.username = '';
    this.password = '';
    this.phone = '';
    this.otp = '';
    this.loginErrors = {};
  }

  showRegister(event: Event) {
    event.preventDefault();
    // If seller tab is active, redirect to onboarding step 1 (account creation happens there)
    if (this.loginType === 'seller') {
      this.router.navigate(['/onboarding/identity']);
      return;
    }
    this.isRegisterVisible = true;
  }

  cancelRegister() {
    this.isRegisterVisible = false;
    this.renderGoogleButton();
  }

  // MAIN LOGIN
  login() {
    if (this.loginType === 'buyer') this.loginBuyer();
    if (this.loginType === 'seller') this.loginSeller();
  }

  /**
   * "Sign in with Google" — the authenticationType is whichever tab
   * (buyer/seller) is active at the moment the user completes the Google
   * flow, since one button serves both.
   */
  private handleGoogleCredential(idToken: string): void {
    const authType = this.loginType === 'seller' ? 'SELLER' : 'BUYER';
    this.auth.googleLogin(idToken, authType).subscribe({
      next: (res: any) => {
        if (!res?.accessToken) {
          alert('❌ ' + (res?.message || 'Google sign-in failed'));
          return;
        }
        this.applyLoginResponse(res, authType);
        this.afterLogin();
      },
      error: () => alert('❌ Google sign-in failed')
    });
  }

  /**
   * Redirect based on the actual role stored after login.
   * This ensures admins always land on /admin even if they used the buyer/seller form.
   */
  private redirectByRole(): void {
    const role = this.auth.getRole();
    console.log('🔀 Redirecting for role:', role);

    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OPS') {
      this.router.navigateByUrl('/admin/dashboard');
    } else if (role === 'SELLER') {
      this.handleSellerRedirect();
    } else {
      // BUYER or fallback
      this.router.navigateByUrl('/buyer');
    }
  }

  /** After any successful login: honor a pending returnUrl, else fall back to the role default. */
  private afterLogin(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }
    this.redirectByRole();
  }

  private handleSellerRedirect(): void {
    const sellerId = this.auth.getSellerId();
    if (sellerId) {
      this.onboardingService.getOnboardingStatus(sellerId).subscribe({
        next: (status: any) => {
          if (status.currentStep && status.currentStep <= 4) {
            const stepMap: { [key: number]: string } = {
              1: 'identity',
              2: 'verification',
              3: 'farm',
              4: 'products'
            };
            const route = stepMap[status.currentStep] || 'identity';
            this.router.navigate([`/onboarding/${route}`]);
          } else {
            this.router.navigateByUrl('/seller/dashboard');
          }
        },
        error: () => {
          this.router.navigateByUrl('/seller/dashboard');
        }
      });
    } else {
      this.router.navigateByUrl('/seller/dashboard');
    }
  }

  /** Shared response handling for buyer/seller login, whether by password or Google. */
  private applyLoginResponse(res: any, authType: 'BUYER' | 'SELLER'): void {
    if (res.roles?.length) {
      let role = res.roles[0];
      if (role.startsWith('ROLE_')) role = role.substring(5);
      this.auth.setRole(role);
    }

    if (res.userId) {
      this.auth.setUserId(res.userId);
    }

    if (authType === 'BUYER') {
      if (res.buyerId) {
        this.auth.setBuyerId(res.buyerId);
        this.auth.setBuyerName(res.userName || '');
        this.auth.setBuyerCountry(res.buyerCountry || '');
        this.auth.setBuyerCompany(res.buyerCompany || '');
      }
    } else {
      if (res.sellerId || res.userId) {
        this.auth.setSellerId(res.sellerId || res.userId);
        this.auth.setSellerName(res.userName || '');
      }
    }

    if (res.accessToken) {
      this.auth.setToken(res.accessToken);
    }
  }

// BUYER LOGIN
private loginBuyer() {
  this.loginErrors = {};

  if (!this.username) this.loginErrors.username = 'Username required';
  if (!this.password) this.loginErrors.password = 'Password required';
  if (Object.keys(this.loginErrors).length) return;

  this.auth.login(this.username, this.password, 'BUYER').subscribe({
    next: (res: any) => {
      this.applyLoginResponse(res, 'BUYER');
      this.afterLogin();
    },
    error: () => alert('❌ Invalid buyer credentials')
  });
}


private loginSeller() {
  this.loginErrors = {};

  if (!this.username) this.loginErrors.username = 'Username required';
  if (!this.password) this.loginErrors.password = 'Password required';
  if (Object.keys(this.loginErrors).length) return;

  this.auth.login(this.username, this.password, 'SELLER').subscribe({
    next: (res: any) => {
      this.applyLoginResponse(res, 'SELLER');
      console.log('Saved role:', this.auth.getRole());
      this.afterLogin();
    },
    error: () => alert('❌ Invalid seller credentials')
  });
}


  // REGISTER BUYER (seller registration happens via the onboarding flow, see showRegister())
  register() {
    this.registerErrors = {};

    if (!this.registerData.userName) this.registerErrors.userName = 'Username required';
    if (!this.registerData.email) this.registerErrors.email = 'Email required';
    if (!this.registerData.phone) this.registerErrors.phone = 'Phone required';
    if (!this.registerData.password) this.registerErrors.password = 'Password required';

    if (Object.keys(this.registerErrors).length) return;

    this.auth.registerBuyer(this.registerData).subscribe({
      next: () => {
        alert('✅ Registration successful. Please login.');
        this.isRegisterVisible = false;

        this.username = this.registerData.userName;
        this.password = this.registerData.password;
        this.renderGoogleButton();
      },
      error: (err: any) => alert('❌ Registration failed')
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
  standalone: false
})
export class AdminLoginComponent implements OnInit {
  adminUsername = '';
  adminPassword = '';
  loginErrors: any = {};

  isRegisterVisible = false;
  registerData = {
    userName: '', email: '', phone: '', password: '', name: '', city: '', state: '', zip: '',
    country: 'India', countryCode: '+91', address: ''
  };
  registerErrors: any = {};

  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private googleAuth: GoogleAuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.renderGoogleButton();
  }

  private renderGoogleButton(): void {
    setTimeout(() => {
      this.googleAuth.renderButton('google-signin-btn-admin', (idToken) => this.handleGoogleCredential(idToken));
    });
  }

  showRegister(event: Event) { event.preventDefault(); this.isRegisterVisible = true; }
  cancelRegister() { this.isRegisterVisible = false; this.renderGoogleButton(); }

  private afterLogin(): void {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }
    this.router.navigateByUrl('/admin/dashboard');
  }

  private applyLoginResponse(res: any): void {
    if (res.roles?.length) {
      let role = res.roles[0];
      if (role.startsWith('ROLE_')) {
        role = role.substring(5);
      }
      this.auth.setRole(role); // ADMIN
    }

    if (res.userName) {
      this.auth.setAdminName(res.userName);
    }

    if (res.userId) {
      this.auth.setUserId(res.userId);
    }

    if (res.adminId) {
      this.auth.setAdminId(res.adminId);
    }

    if (res.accessToken) {
      this.auth.setToken(res.accessToken);
    }
  }

  loginAdmin() {
    this.loginErrors = {};
    if (!this.adminUsername) this.loginErrors.adminUsername = 'Username required';
    if (!this.adminPassword) this.loginErrors.adminPassword = 'Password required';
    if (Object.keys(this.loginErrors).length) return;

    this.auth.loginAdmin(this.adminUsername, this.adminPassword).subscribe({
      next: (res: any) => {
        this.applyLoginResponse(res);
        this.afterLogin();
      },
      error: () => alert('❌ Invalid admin credentials')
    });
  }

  /**
   * Sign in with Google as an admin. Only works for a Google email that's
   * already an admin account (see backend GoogleOAuth2Service) — Google
   * sign-in never auto-creates an admin.
   */
  private handleGoogleCredential(idToken: string): void {
    this.auth.googleLogin(idToken, 'ADMIN').subscribe({
      next: (res: any) => {
        if (!res?.accessToken) {
          alert('❌ ' + (res?.message || 'Google sign-in failed — this Google account is not registered as an admin.'));
          return;
        }
        this.applyLoginResponse(res);
        this.afterLogin();
      },
      error: () => alert('❌ Google sign-in failed')
    });
  }

  registerAdmin() {
    this.registerErrors = {};
    if (!this.registerData.userName) this.registerErrors.userName = 'Username required';
    if (!this.registerData.email) this.registerErrors.email = 'Email required';
    if (!this.registerData.phone) this.registerErrors.phone = 'Phone required';
    if (!this.registerData.password) this.registerErrors.password = 'Password required';

    if (Object.keys(this.registerErrors).length) return;

    this.auth.registerAdmin(this.registerData).subscribe({
      next: () => {
        alert('✅ Admin Registration successful. Please login.');
        this.isRegisterVisible = false;
        this.adminUsername = this.registerData.userName;
        this.adminPassword = this.registerData.password;
        this.renderGoogleButton();
      },
      error: () => alert('❌ Admin Registration failed')
    });
  }
}

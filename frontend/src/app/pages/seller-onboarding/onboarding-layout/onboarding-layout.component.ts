import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-onboarding-layout',
  templateUrl: './onboarding-layout.component.html',
  styleUrls: ['./onboarding-layout.component.scss'],
  standalone: false
})
export class OnboardingLayoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  private routerSub!: Subscription;

  steps = [
    { num: 1, label: 'Identity', route: '/onboarding/identity' },
    { num: 2, label: 'Verification', route: '/onboarding/verification' },
    { num: 3, label: 'Farm', route: '/onboarding/farm' },
    { num: 4, label: 'Products', route: '/onboarding/products' }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.detectStep(this.router.url);
    // Listen for route changes to update stepper
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.detectStep(event.urlAfterRedirects || event.url);
      });
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  private detectStep(url: string) {
    if (url.includes('products')) this.currentStep = 4;
    else if (url.includes('farm')) this.currentStep = 3;
    else if (url.includes('verification')) this.currentStep = 2;
    else this.currentStep = 1;
    this.requireTokenBeyondStep1(url);
  }

  /**
   * Steps 2-4 hit the protected /api/onboarding/** endpoints, which 403 without a bearer
   * token. A session can have a sellerId but no token (e.g. registered before sign-up
   * started issuing tokens, or storage cleared), so send it through login and come back.
   */
  private requireTokenBeyondStep1(url: string) {
    if (this.currentStep > 1 && !this.authService.getToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      this.router.navigate([this.steps[this.currentStep - 2].route]);
    }
  }

  /**
   * Sign-up (step 1) already logged the seller in, so cancelling any later step
   * lands on the dashboard; the wizard resumes from the saved step on next login
   * (see LoginComponent.handleSellerRedirect).
   */
  exitToDashboard() {
    this.router.navigateByUrl('/seller/dashboard');
  }

  isStepCompleted(stepNum: number): boolean {
    return stepNum < this.currentStep;
  }

  isStepActive(stepNum: number): boolean {
    return stepNum === this.currentStep;
  }
}

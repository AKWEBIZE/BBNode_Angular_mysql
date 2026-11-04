import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'bigbisort-frontend';
  showTokenExpiredModal = false;
  private tokenSub: Subscription | null = null;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.tokenSub = this.auth.tokenExpired$.subscribe(() => {
      this.showTokenExpiredModal = true;
    });
  }

  ngOnDestroy() {
    if (this.tokenSub) {
      this.tokenSub.unsubscribe();
    }
  }

  handleTokenExpiredOk() {
    this.showTokenExpiredModal = false;
    this.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.auth.getRole();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  isDashboardRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/seller') || url.startsWith('/buyer') || url.startsWith('/admin') || url.startsWith('/onboarding');
  }
}

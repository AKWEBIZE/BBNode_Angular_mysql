import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-buyer-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit {
  appTitle = 'Biggisort';
  buyerName = '';
  showUserMenu = false;

  navItems = [
    { label: 'My Orders', icon: '🛒' },
    { label: 'Messages', icon: '💬' },
    { label: 'Categories', icon: '📦' },
    { label: 'Seller Requests', icon: '🧑‍🌾' },
    { label: 'Custom', icon: '🛠️' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.buyerName = this.authService.getBuyerName() || '';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

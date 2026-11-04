import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: false
})
export class AdminLayoutComponent {

  menuItems = [
    { label: 'Dashboard', icon: 'bi-grid-1x2-fill', route: '/admin/dashboard', active: true },
    { label: 'Seller Management', icon: 'bi-shop', route: '/admin/sellers', active: false },
    { label: 'Product Management', icon: 'bi-box-seam-fill', route: '/admin/products', active: false },
    { label: 'Buyer Management', icon: 'bi-people-fill', route: '/admin/buyers', active: false },
    { label: 'Buyer Interactions', icon: 'bi-chat-dots-fill', route: '/admin/interactions', active: false },
    { label: 'Seller Interactions', icon: 'bi-chat-dots-fill', route: '/admin/seller-interactions', active: false },
    { label: 'Seller-Buyer Mapping', icon: 'bi-diagram-3-fill', route: '/admin/mappings', active: false },
    { label: 'Export & Orders', icon: 'bi-truck', route: '/admin/orders', active: false },
    { label: 'Payments & Finance', icon: 'bi-wallet2', route: '/admin/payments', active: false },
    { label: 'Reports & Analytics', icon: 'bi-bar-chart-line-fill', route: '/admin/reports', active: false },
    { label: 'Support & Tickets', icon: 'bi-headset', route: '/admin/support', active: false },
    { label: 'Audit Logs', icon: 'bi-shield-lock-fill', route: '/admin/audit-logs', active: false },
    { label: 'System Settings', icon: 'bi-gear-fill', route: '/admin/settings', active: false },
  ];

  notificationCount = 5;
  searchQuery = '';
  showUserMenu = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get adminName(): string {
    return this.auth.getAdminName() || 'Admin';
  }

  get adminRole(): string {
    return this.auth.getRole() || 'ADMIN';
  }

  getRoleLabel(): string {
    const role = this.adminRole;
    if (role === 'SUPER_ADMIN') return 'Super Admin';
    if (role === 'ADMIN') return 'Admin';
    if (role === 'OPS') return 'Operations';
    return role;
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  onSearch(): void {
    console.log('🔍 Search:', this.searchQuery);
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

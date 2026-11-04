import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {
  DashboardService,
  DashboardStats,
  PendingApprovals,
  RevenueSnapshot
} from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: false
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  // KPI Stats
  stats: DashboardStats = {
    totalSellers: 0,
    totalBuyers: 0,
    activeProducts: 0,
    activeExportDeals: 0
  };

  // Pending Approvals
  approvals: PendingApprovals = {
    sellerVerifications: 0,
    productListings: 0,
    exportDeals: 0
  };

  // Revenue Snapshot
  revenue: RevenueSnapshot = {
    todayRevenue: 0,
    monthRevenue: 0,
    pendingPayment: 0,
    ytdRevenue: 0
  };

  loading = {
    stats: true,
    approvals: true,
    revenue: true
  };

  // Tracks a failed fetch per section so the template can show an honest
  // "failed to load" state instead of silently displaying stale/fake numbers.
  loadError = {
    stats: false,
    approvals: false,
    revenue: false
  };

  private refreshInterval: any;

  // Stat card configuration
  statCards = [
    {
      key: 'totalSellers',
      label: 'Total Sellers',
      icon: 'bi-shop-window',
      colorClass: 'card-dark-green'
    },
    {
      key: 'totalBuyers',
      label: 'Total Buyers',
      icon: 'bi-briefcase-fill',
      colorClass: 'card-amber'
    },
    {
      key: 'activeProducts',
      label: 'Active Products',
      icon: 'bi-flower1',
      colorClass: 'card-cream'
    },
    {
      key: 'activeExportDeals',
      label: 'Active Export Deals',
      icon: 'bi-globe-americas',
      colorClass: 'card-cream-alt'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();

    // Auto-refresh pending approvals every 60 seconds
    this.refreshInterval = setInterval(() => {
      this.loadPendingApprovals();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAllData(): void {
    this.loadStats();
    this.loadPendingApprovals();
    this.loadRevenueSnapshot();
  }

  loadStats(): void {
    this.loading.stats = true;
    this.loadError.stats = false;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading.stats = false;
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.loading.stats = false;
        this.loadError.stats = true;
      }
    });
  }

  loadPendingApprovals(): void {
    this.loading.approvals = true;
    this.loadError.approvals = false;
    this.dashboardService.getPendingApprovals().subscribe({
      next: (data) => {
        this.approvals = data;
        this.loading.approvals = false;
      },
      error: (err) => {
        console.error('Failed to load approvals:', err);
        this.loading.approvals = false;
        this.loadError.approvals = true;
      }
    });
  }

  loadRevenueSnapshot(): void {
    this.loading.revenue = true;
    this.loadError.revenue = false;
    this.dashboardService.getRevenueSnapshot().subscribe({
      next: (data) => {
        this.revenue = data;
        this.loading.revenue = false;
      },
      error: (err) => {
        console.error('Failed to load revenue:', err);
        this.loading.revenue = false;
        this.loadError.revenue = true;
      }
    });
  }

  getStatValue(key: string): number {
    return (this.stats as any)[key] || 0;
  }

  /**
   * Format a number using India's number system: 1,24,00,000
   * Revenue is stored in paise, so divide by 100 first.
   */
  formatINR(paise: number): string {
    const rupees = Math.floor(paise / 100);
    return this.formatIndian(rupees);
  }

  formatIndian(num: number): string {
    const numStr = num.toString();
    if (numStr.length <= 3) return numStr;

    let lastThree = numStr.substring(numStr.length - 3);
    let remaining = numStr.substring(0, numStr.length - 3);

    if (remaining.length > 0) {
      lastThree = ',' + lastThree;
    }

    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return formatted + lastThree;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

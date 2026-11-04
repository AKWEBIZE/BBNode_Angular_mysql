import { Component, OnInit } from '@angular/core';
import {
  AdminBuyerListDto,
  AdminBuyerDetailDto,
  AdminBuyerManagementService,
  BuyerPurchaseHistoryItem
} from 'src/app/services/admin-buyer-management.service';

@Component({
  selector: 'app-admin-buyer-management',
  templateUrl: './admin-buyer-management.component.html',
  styleUrls: ['./admin-buyer-management.component.scss'],
  standalone: false
})
export class AdminBuyerManagementComponent implements OnInit {

  // List State
  buyers: AdminBuyerListDto[] = [];
  totalBuyers = 0;

  // Tabs & Search
  activeTab = '';
  tabs = [
    { value: '', label: 'All Buyers' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REJECTED', label: 'Rejected' }
  ];
  searchQuery = '';

  pageSize = 10;
  currentPage = 0;

  // Detail Panel State
  selectedBuyer: AdminBuyerDetailDto | null = null;
  activeDetailTab = 'Overview';
  noteValue = '';
  saving = false;

  // Purchase History
  purchaseHistory: BuyerPurchaseHistoryItem[] = [];
  loadingHistory = false;

  constructor(private buyerService: AdminBuyerManagementService) {}

  ngOnInit(): void {
    this.loadBuyers();
  }

  loadBuyers(): void {
    this.buyerService.getBuyers(this.activeTab, this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.buyers = res.content;
        this.totalBuyers = res.totalElements;
      },
      error: (err) => {
        console.error('Error loading buyers', err);
        this.buyers = [];
        this.totalBuyers = 0;
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.loadBuyers();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadBuyers();
  }

  refresh(): void {
    this.loadBuyers();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadBuyers();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalBuyers / this.pageSize));
  }

  // ==== DETAIL PANEL ====
  openBuyerDetails(buyerId: string): void {
    this.buyerService.getBuyerById(buyerId).subscribe({
      next: (data) => {
        this.selectedBuyer = data;
        this.noteValue = data.adminNotes || '';
        this.activeDetailTab = 'Overview';
      },
      error: (err) => {
        console.error('Error loading buyer details', err);
        this.closeDetails();
      }
    });
  }

  closeDetails(): void {
    this.selectedBuyer = null;
    this.purchaseHistory = [];
  }

  setDetailTab(tab: string): void {
    this.activeDetailTab = tab;
    if (tab === 'History' && this.selectedBuyer) {
      this.loadPurchaseHistory(this.selectedBuyer.id);
    }
  }

  loadPurchaseHistory(buyerId: string): void {
    this.loadingHistory = true;
    this.buyerService.getPurchaseHistory(buyerId).subscribe({
      next: (res) => {
        this.purchaseHistory = res.content;
        this.loadingHistory = false;
      },
      error: (err) => {
        console.error('Error loading purchase history', err);
        this.purchaseHistory = [];
        this.loadingHistory = false;
      }
    });
  }

  // ==== DISPLAY HELPERS ====
  displayName(buyer: AdminBuyerListDto): string {
    return buyer.businessName || buyer.name || '—';
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'VERIFIED': return 'badge-verified';
      case 'PENDING': return 'badge-pending';
      case 'REJECTED': return 'badge-rejected';
      default: return 'badge-default';
    }
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  // ==== ACTIONS ====
  saveNotes(): void {
    if (this.selectedBuyer && this.noteValue !== this.selectedBuyer.adminNotes) {
      this.buyerService.updateBuyerNotes(this.selectedBuyer.id, this.noteValue).subscribe({
        next: () => {
          this.selectedBuyer!.adminNotes = this.noteValue;
        }
      });
    }
  }

  updateStatus(status: string): void {
    if (!this.selectedBuyer) return;
    this.saving = true;
    this.buyerService.updateBuyerStatus(this.selectedBuyer.id, status).subscribe({
      next: () => {
        this.saving = false;
        this.selectedBuyer!.status = status;
        this.loadBuyers();
      },
      error: (err) => {
        console.error('Error updating buyer status', err);
        this.saving = false;
      }
    });
  }

  approve(): void {
    this.updateStatus('VERIFIED');
  }

  reject(): void {
    this.updateStatus('REJECTED');
  }
}

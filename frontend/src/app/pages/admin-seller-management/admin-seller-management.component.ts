import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AdminSellerListDto, AdminSellerDetailDto, AdminSellerManagementService } from 'src/app/services/admin-seller-management.service';

@Component({
  selector: 'app-admin-seller-management',
  templateUrl: './admin-seller-management.component.html',
  styleUrls: ['./admin-seller-management.component.scss'],
  standalone: false
})
export class AdminSellerManagementComponent implements OnInit {

  // List State
  sellers: AdminSellerListDto[] = [];
  totalSellers = 0;
  
  // Filters and Pagination
  selectedStatus = '';
  searchQuery = '';
  
  statusOptions = [
    { value: '', label: 'All Sellers' },
    { value: 'PENDING_ONBOARDING', label: 'Pending Onboarding' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_REVIEW', label: 'In-Review' },
    { value: 'ONBOARDING_COMPLETE', label: 'Onboarding Complete' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'SUSPENDED', label: 'Suspended' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'COMPLIANCE_ISSUE', label: 'Compliance Issue' }
  ];
  
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [10, 25, 50, 100];
  
  // Detail Panel State
  selectedSeller: AdminSellerDetailDto | null = null;
  isDrawerOpen = false;
  activeDetailTab = 'Overview';
  
  // Bulk Actions
  selectedSellerIds: Set<string> = new Set();
  get hasSelection(): boolean {
    return this.selectedSellerIds.size > 0;
  }
  
  // Action Menu State
  activeMenuId: string | null = null;
  
  // Editing Notes
  isEditingNotes = false;
  noteValue = '';

  constructor(
    private sellerService: AdminSellerManagementService,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-menu-container')) {
      this.activeMenuId = null;
    }
  }

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.sellerService.getSellers(this.selectedStatus, this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.sellers = res.content;
        this.totalSellers = res.totalElements;
      },
      error: (err) => {
        console.error('Error loading sellers', err);
        this.sellers = [];
        this.totalSellers = 0;
      }
    });
  }

  // ==== FILTERS ====
  onStatusChange() {
    this.currentPage = 0;
    this.loadSellers();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadSellers();
  }



  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadSellers();
  }
  
  refresh() {
    this.loadSellers();
  }

  // ==== DRAWER & DETAILS ====
  openSellerDetails(sellerId: string) {
    this.sellerService.getSellerById(sellerId).subscribe({
      next: (data) => {
        this.selectedSeller = data;
        this.noteValue = data.adminNotes || '';
        this.isDrawerOpen = true;
      },
      error: (err) => {
        console.error('Error loading seller details', err);
        // We do not show mock data anymore
        this.closeDrawer();
      }
    });
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    this.selectedSeller = null;
  }

  setDetailTab(tab: string) {
    this.activeDetailTab = tab;
  }

  // ==== STATUS BADGE MAP ====
  getStatusClass(status: string): string {
    switch(status?.toUpperCase()) {
      case 'VERIFIED': return 'badge-verified';
      case 'PENDING': return 'badge-pending';
      case 'REJECTED': return 'badge-rejected';
      case 'COMPLIANCE_ISSUE': return 'badge-compliance';
      case 'SUSPENDED': return 'badge-suspended';
      default: return 'badge-default';
    }
  }

  getStatusIcon(status: string): string {
    switch(status?.toUpperCase()) {
      case 'VERIFIED': return 'bi-check2';
      case 'PENDING': return 'bi-hourglass-split';
      case 'REJECTED': return 'bi-x';
      case 'COMPLIANCE_ISSUE': return 'bi-exclamation-triangle';
      case 'SUSPENDED': return 'bi-slash-circle';
      default: return 'bi-record-circle';
    }
  }

  formatStatus(status: string): string {
    if (!status) return '';
    if (status === 'COMPLIANCE_ISSUE') return 'Compliance Issue';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  // ==== ROW ACTION MENU ====
  toggleActionMenu(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  viewSeller(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = null;
    this.openSellerDetails(id);
  }

  editSeller(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = null;
    alert('Edit seller functionality not fully implemented yet.');
  }

  deleteSeller(id: string, event: Event) {
    event.stopPropagation();
    this.activeMenuId = null;
    if (confirm('Are you sure you want to delete this seller?')) {
      alert('Delete seller functionality not fully implemented yet.');
    }
  }

  // ==== ACTIONS ====
  saveNotes() {
    this.isEditingNotes = false;
    if (this.selectedSeller && this.noteValue !== this.selectedSeller.adminNotes) {
      this.sellerService.updateSellerNotes(this.selectedSeller.id, this.noteValue).subscribe({
        next: () => {
          this.selectedSeller!.adminNotes = this.noteValue;
        }
      });
    }
  }

  requestUpdate() {
    if (this.selectedSeller) {
      this.sellerService.requestUpdate(this.selectedSeller.id).subscribe({
        next: () => alert('Update request sent to seller via notification.')
      });
    }
  }

  approveSeller(id?: string) {
    const targetId = id || this.selectedSeller?.id;
    if (targetId) {
      this.sellerService.updateSellerStatus(targetId, 'VERIFIED').subscribe({
        next: () => {
          this.loadSellers();
          if (this.isDrawerOpen && this.selectedSeller) this.selectedSeller.status = 'VERIFIED';
        }
      });
    }
  }

  viewSellerProducts(seller: AdminSellerListDto, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/admin/products'], {
      queryParams: { sellerName: seller.businessName || seller.name }
    });
  }

  toggleSelection(id: string) {
    if (this.selectedSellerIds.has(id)) {
      this.selectedSellerIds.delete(id);
    } else {
      this.selectedSellerIds.add(id);
    }
  }
}

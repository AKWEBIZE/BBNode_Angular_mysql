import { Component, OnInit } from '@angular/core';
import { AdminAuditLogService, AuditLogDto } from 'src/app/services/admin-audit-log.service';

@Component({
  selector: 'app-admin-audit-log',
  templateUrl: './admin-audit-log.component.html',
  styleUrls: ['./admin-audit-log.component.scss'],
  standalone: false
})
export class AdminAuditLogComponent implements OnInit {

  logs: AuditLogDto[] = [];
  totalLogs = 0;

  actorTypeOptions = [
    { value: '', label: 'All Roles' },
    { value: 'BUYER', label: 'Buyer' },
    { value: 'SELLER', label: 'Seller' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ANONYMOUS', label: 'Anonymous (unresolved)' }
  ];
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'FAILURE', label: 'Failure' }
  ];

  actorTypeFilter = '';
  statusFilter = '';
  searchQuery = '';
  fromDate = '';
  toDate = '';

  pageSize = 20;
  currentPage = 0;

  constructor(private auditLogService: AdminAuditLogService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditLogService
      .getAuditLogs(
        this.actorTypeFilter,
        this.statusFilter,
        this.searchQuery,
        this.fromDate,
        this.toDate,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.logs = res.content;
          this.totalLogs = res.totalElements;
        },
        error: (err) => {
          console.error('Error loading audit logs', err);
          this.logs = [];
          this.totalLogs = 0;
        }
      });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadLogs();
  }

  refresh(): void {
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page < 0 || page * this.pageSize >= this.totalLogs) return;
    this.currentPage = page;
    this.loadLogs();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalLogs / this.pageSize));
  }

  statusClass(status: string): string {
    return status === 'SUCCESS' ? 'badge-success' : 'badge-failure';
  }

  actorTypeLabel(actorType: string): string {
    if (!actorType) return '—';
    return actorType.charAt(0) + actorType.slice(1).toLowerCase();
  }
}

import { Component, OnInit } from '@angular/core';
import { WatchListService } from 'src/app/pages/buyer-dashboard/service/watch-list.service';
import { AuthService } from 'src/app/services/auth.service'; // ✅ import AuthService

@Component({
    selector: 'app-watch-list',
    templateUrl: './watch-list.component.html',
    styleUrls: ['./watch-list.component.scss'],
    standalone: false
})
export class WatchListComponent implements OnInit {
  watchListItems: any[] = [];

  constructor(
    private watchListService: WatchListService,
    private authService: AuthService // ✅ inject AuthService
  ) {}

  ngOnInit(): void {
    this.loadWatchList();
  }

  loadWatchList(): void {
    const buyerId = this.authService.getBuyerId(); // ✅ fetch from session storage

    if (!buyerId) {
      console.warn('⚠️ Buyer ID not found in sessionStorage.');
      return;
    }

    this.watchListService.getWatchList(buyerId).subscribe({
      next: (res) => {
        this.watchListItems = res?._embedded?.watchListResponseBeanList || [];
        console.log('✅ Watchlist:', this.watchListItems);
      },
      error: (err) => {
        console.error('❌ Error fetching watchlist:', err);
      }
    });
  }
}

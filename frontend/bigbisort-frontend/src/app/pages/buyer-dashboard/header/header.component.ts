import { Component } from '@angular/core';

@Component({
    selector: 'app-buyer-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent {
  appTitle = 'Biggisort';
  buyerName = 'John Doe';

  navItems = [
    { label: 'My Orders', icon: '🛒' },
    { label: 'Messages', icon: '💬' },
    { label: 'Categories', icon: '📦' },
    { label: 'Seller Requests', icon: '🧑‍🌾' },
    { label: 'Custom', icon: '🛠️' }
  ];
}

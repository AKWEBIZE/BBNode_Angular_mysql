import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './seller-layout.component.html',
  styleUrl: './seller-layout.component.scss',
})
export class SellerLayoutComponent implements OnInit {
  showUserMenu = false;
  sellerName = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.sellerName = this.authService.getSellerName() || '';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

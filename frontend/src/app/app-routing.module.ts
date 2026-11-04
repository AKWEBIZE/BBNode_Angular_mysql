import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminSellerManagementComponent } from './pages/admin-seller-management/admin-seller-management.component';
import { AdminBuyerManagementComponent } from './pages/admin-buyer-management/admin-buyer-management.component';
import { AdminAuditLogComponent } from './pages/admin-audit-log/admin-audit-log.component';
import { AdminOrderManagementComponent } from './pages/admin-order-management/admin-order-management.component';
import { AdminBuyerInteractionsComponent } from './pages/admin-buyer-interactions/admin-buyer-interactions.component';
import { AdminSellerInteractionsComponent } from './pages/admin-seller-interactions/admin-seller-interactions.component';
import { AdminProductManagementComponent } from './pages/admin-product-management/admin-product-management.component';
import { MessagesComponent } from './pages/buyer-dashboard/messages/messages.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { BuyerLayoutComponent } from './pages/buyer-layout/buyer-layout.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { SellerLayoutComponent } from './pages/seller-layout/seller-layout.component';
import { RoleGuard } from './guards/role.guard';
import { BuyerOrderComponent } from './pages/buyer-dashboard/buyer-order/buyer-order.component';
import { HomeComponent } from './home-dashboard/home/home.component';
import { AboutUsComponent } from './home-dashboard/about-us/about-us.component';
import { ProductsComponent } from './home-dashboard/products/products.component';
import { ContactComponent } from './home-dashboard/contact/contact.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { CategoryComponent } from './home-dashboard/category/category.component';
import { NewArrivalsComponent } from './pages/buyer-dashboard/new-arrivals/new-arrivals.component';
import { WatchListComponent } from './pages/buyer-dashboard/watch-list/watch-list.component';
import { PrdlandpgComponent } from './home-dashboard/prdlandpg/prdlandpg.component';
import { AppleComponent } from './home-dashboard/30_Products/apple/apple.component';
import { AvocadoComponent } from './home-dashboard/30_Products/avocado/avocado.component';
import { CarrotComponent } from './home-dashboard/30_Products/carrot/carrot.component';
import { BananaComponent } from './home-dashboard/30_Products/banana/banana.component';
import { PineappleComponent } from './home-dashboard/30_Products/pineapple/pineapple.component';
import { CoconutComponent } from './home-dashboard/30_Products/coconut/coconut.component';
import { PepperComponent } from './home-dashboard/30_Products/pepper/pepper.component';

// Onboarding Components
import { OnboardingLayoutComponent } from './pages/seller-onboarding/onboarding-layout/onboarding-layout.component';
import { Step1IdentityComponent } from './pages/seller-onboarding/step1-identity/step1-identity.component';
import { Step2VerificationComponent } from './pages/seller-onboarding/step2-verification/step2-verification.component';
import { Step3FarmComponent } from './pages/seller-onboarding/step3-farm/step3-farm.component';
import { Step4ProductsComponent } from './pages/seller-onboarding/step4-products/step4-products.component';

const routes: Routes = [

{
    path: '',
    component: HomeDashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutUsComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'category/:type', component: CategoryComponent },
      { path: 'login', component: LoginComponent },
      { path: 'prdland', component: PrdlandpgComponent },
      { path: 'apple', component: AppleComponent },
      { path: 'avocado', component: AvocadoComponent },
      { path: 'carrot', component: CarrotComponent },
      { path: 'banana', component: BananaComponent },
      { path: 'pineapple', component: PineappleComponent },
      { path: 'coconut', component: CoconutComponent },
      { path: 'pepper', component: PepperComponent },
    ]
  },

  { path: 'login', component: LoginComponent },
  { path: 'YWRtaW4=', component: AdminLoginComponent },

  // Seller Onboarding Wizard
  {
    path: 'onboarding',
    component: OnboardingLayoutComponent,
    children: [
      { path: '', redirectTo: 'identity', pathMatch: 'full' },
      { path: 'identity', component: Step1IdentityComponent },
      { path: 'verification', component: Step2VerificationComponent },
      { path: 'farm', component: Step3FarmComponent },
      { path: 'products', component: Step4ProductsComponent },
    ]
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'sellers', component: AdminSellerManagementComponent },
      { path: 'products', component: AdminProductManagementComponent },
      { path: 'buyers', component: AdminBuyerManagementComponent },
      { path: 'interactions', component: AdminBuyerInteractionsComponent },
      { path: 'seller-interactions', component: AdminSellerInteractionsComponent },
      { path: 'orders', component: AdminOrderManagementComponent },
      { path: 'audit-logs', component: AdminAuditLogComponent },
    ]
  },
  {
    path: 'seller',
    component: SellerLayoutComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'SELLER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SellerDashboardComponent },
      {
        path: 'products',
        loadComponent: () => import('./pages/seller/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/add-product',
        loadComponent: () => import('./pages/seller/products/add-product/add-product.component').then(m => m.AddProductComponent)
      },
      {
        path: 'products/edit-product/:id',
        loadComponent: () => import('./pages/seller/products/edit-product/edit-product.component').then(m => m.EditProductComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/seller/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/seller/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/seller/messages/messages.component').then(m => m.SellerMessagesComponent)
      }
    ]
  },

 {
  path: 'buyer',
  component: BuyerLayoutComponent,
  canActivate: [RoleGuard],
  data: { expectedRole: 'BUYER' },
  children: [
    { path: '', component: BuyerDashboardComponent },
    {
      path: 'explore',
      loadComponent: () => import('./pages/buyer-dashboard/explore-products/explore-products.component').then(m => m.ExploreProductsComponent)
    },
    { path: 'orders', component: BuyerOrderComponent },
    { path: 'newarr', component: NewArrivalsComponent },
    { path: 'WL', component: WatchListComponent },
    { path: 'messages', component: MessagesComponent },
  ]
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

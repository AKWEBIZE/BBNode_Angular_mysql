import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { HeaderComponent } from './pages/buyer-dashboard/header/header.component';
import { BuyerOrderComponent } from './pages/buyer-dashboard/buyer-order/buyer-order.component';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';
import { HomeComponent } from './home-dashboard/home/home.component';
import { AboutUsComponent } from './home-dashboard/about-us/about-us.component';
import { ProductsComponent } from './home-dashboard/products/products.component';
import { ContactComponent } from './home-dashboard/contact/contact.component';
import { CategoryComponent } from './home-dashboard/category/category.component';
import { NewArrivalsComponent } from './pages/buyer-dashboard/new-arrivals/new-arrivals.component';
import { WatchListComponent } from './pages/buyer-dashboard/watch-list/watch-list.component';
import { BuyersproductsComponent } from './pages/buyer-dashboard/buyersproducts/buyersproducts.component';
import { FooterComponent } from './home-dashboard/footer/footer.component';
import { AppleComponent } from './home-dashboard/30_Products/apple/apple.component';
import { BananaComponent } from './home-dashboard/30_Products/banana/banana.component';
import { PrdlandpgComponent } from './home-dashboard/prdlandpg/prdlandpg.component';
import { AvocadoComponent } from './home-dashboard/30_Products/avocado/avocado.component';
import { CarrotComponent } from './home-dashboard/30_Products/carrot/carrot.component';
import { PineappleComponent } from './home-dashboard/30_Products/pineapple/pineapple.component';
import { CoconutComponent } from './home-dashboard/30_Products/coconut/coconut.component';
import { PepperComponent } from './home-dashboard/30_Products/pepper/pepper.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { AdminSellerManagementComponent } from './pages/admin-seller-management/admin-seller-management.component';
import { AdminBuyerManagementComponent } from './pages/admin-buyer-management/admin-buyer-management.component';
import { AdminAuditLogComponent } from './pages/admin-audit-log/admin-audit-log.component';
import { AdminOrderManagementComponent } from './pages/admin-order-management/admin-order-management.component';

// Seller Onboarding Components
import { OnboardingLayoutComponent } from './pages/seller-onboarding/onboarding-layout/onboarding-layout.component';
import { Step1IdentityComponent } from './pages/seller-onboarding/step1-identity/step1-identity.component';
import { Step2VerificationComponent } from './pages/seller-onboarding/step2-verification/step2-verification.component';
import { Step3FarmComponent } from './pages/seller-onboarding/step3-farm/step3-farm.component';
import { Step4ProductsComponent } from './pages/seller-onboarding/step4-products/step4-products.component';
import { SearchableDropdownComponent } from './shared/components/searchable-dropdown/searchable-dropdown.component';
import { EnquiryDialogComponent } from './shared/components/enquiry-dialog/enquiry-dialog.component';
import { ContactHeroComponent } from './home-dashboard/contact/contact-hero/contact-hero.component';
import { StatusBadgeComponent } from './shared/components/status-badge/status-badge.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { OrderRowComponent } from './pages/buyer-dashboard/buyer-order/order-row/order-row.component';
import { OrderDetailsPanelComponent } from './pages/buyer-dashboard/buyer-order/order-details-panel/order-details-panel.component';
import { MessagesComponent } from './pages/buyer-dashboard/messages/messages.component';
import { AdminBuyerInteractionsComponent } from './pages/admin-buyer-interactions/admin-buyer-interactions.component';
import { AdminSellerInteractionsComponent } from './pages/admin-seller-interactions/admin-seller-interactions.component';
import { AdminProductManagementComponent } from './pages/admin-product-management/admin-product-management.component';

@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        AdminLoginComponent,
        AdminDashboardComponent,
        AdminLayoutComponent,
        AdminSellerManagementComponent,
        AdminBuyerManagementComponent,
        AdminAuditLogComponent,
        AdminOrderManagementComponent,
        SellerDashboardComponent,
        BuyerDashboardComponent,
        HeaderComponent,
        BuyerOrderComponent,
        HomeDashboardComponent,
        HomeComponent,
        AboutUsComponent,
        ProductsComponent,
        ContactComponent,
        CategoryComponent,
        NewArrivalsComponent,
        WatchListComponent,
        BuyersproductsComponent,
        FooterComponent,
        AppleComponent,
        BananaComponent,
        PrdlandpgComponent,
        AvocadoComponent,
        CarrotComponent,
        PineappleComponent,
        CoconutComponent,
        PepperComponent,
        // Seller Onboarding
        OnboardingLayoutComponent,
        Step1IdentityComponent,
        Step2VerificationComponent,
        Step3FarmComponent,
        Step4ProductsComponent,
        SearchableDropdownComponent,
        EnquiryDialogComponent,
        StatusBadgeComponent,
        PaginationComponent,
        OrderRowComponent,
        OrderDetailsPanelComponent,
        MessagesComponent,
        AdminBuyerInteractionsComponent,
        AdminSellerInteractionsComponent,
        AdminProductManagementComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        ContactHeroComponent], providers: [{ provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }

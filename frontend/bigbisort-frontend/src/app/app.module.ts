import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
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
import { ProductManagementComponent } from './pages/admin-dashboard/product-management/product-management.component';


@NgModule({ declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        AdminDashboardComponent,
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
        ProductManagementComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule], providers: [{ provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }

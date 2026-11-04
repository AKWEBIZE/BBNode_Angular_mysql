import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
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
import { BuyersproductsComponent } from './pages/buyer-dashboard/buyersproducts/buyersproducts.component';
import { PrdlandpgComponent } from './home-dashboard/prdlandpg/prdlandpg.component';
import { AppleComponent } from './home-dashboard/30_Products/apple/apple.component';
import { AvocadoComponent } from './home-dashboard/30_Products/avocado/avocado.component';
import { CarrotComponent } from './home-dashboard/30_Products/carrot/carrot.component';
import { BananaComponent } from './home-dashboard/30_Products/banana/banana.component';
import { PineappleComponent } from './home-dashboard/30_Products/pineapple/pineapple.component';
import { CoconutComponent } from './home-dashboard/30_Products/coconut/coconut.component';
import { PepperComponent } from './home-dashboard/30_Products/pepper/pepper.component';

const routes: Routes = [

{
    path: '',
    component: HomeDashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },  // ✅ Home is default
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutUsComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'category/:type', component: CategoryComponent },
      { path: 'login', component: LoginComponent },
      { path: 'prdland', component: PrdlandpgComponent },

//from here onwards 38 prd38 route inintializise should declare 

              { path: 'apple', component: AppleComponent },
              { path: 'avocado', component: AvocadoComponent },
              { path: 'carrot', component: CarrotComponent },
              { path: 'banana', component: BananaComponent },
              { path: 'pineapple', component: PineappleComponent },
              { path: 'coconut', component: CoconutComponent },
              { path: 'pepper', component: PepperComponent },

    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'ADMIN' }
  },
  {
    path: 'seller',
    component: SellerDashboardComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'SELLER' }
  },
  // {
  //   path: 'buyer',
  //   component: BuyerDashboardComponent,
  //   canActivate: [RoleGuard],
  //   data: { expectedRole: 'BUYER' }
  // },

 {
  path: 'buyer',
  component: BuyerDashboardComponent,
  canActivate: [RoleGuard],
  data: { expectedRole: 'BUYER' }
},
{
  path: 'buyer/orders',
  component: BuyerOrderComponent,
  canActivate: [RoleGuard],
  data: { expectedRole: 'BUYER' }
},
{
  path: 'buyer/newarr',
  component: NewArrivalsComponent,
  canActivate: [RoleGuard],
  data: { expectedRole: 'BUYER' }
},
{
  path: 'buyer/WL',
  component: WatchListComponent,
  canActivate: [RoleGuard],
  data: { expectedRole: 'BUYER' }
},
{ 
  path: 'buyer/categories',
  component: BuyersproductsComponent,
  canActivate: [RoleGuard],
  data: { expectedRole: 'BUYER' }
},



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PricingComponent } from './pricing/pricing.component';
import { SuccessComponent } from './success/success.component';
import { OrdersComponent } from './orders/orders.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'orders', component: OrdersComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  declarations: [

  ],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

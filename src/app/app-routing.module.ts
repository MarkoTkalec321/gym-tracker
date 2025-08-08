import { NgModule } from '@angular/core';
import { RegisterComponent } from './auth/register/register.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'register', pathMatch: 'full' }
];

@NgModule({
  declarations: [

  ],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import {ProfileComponent} from "./profile/profile.component";
import {CoachComponent} from "./coach/coach.component";
import {ForumComponent} from "./forum/forum.component";
import {SocialComponent} from "./social/social.component";
import {AdminComponent} from "./admin/admin.component";

const routes: Routes = [
  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes with toolbar
  {
    path: '',
    component: ToolbarComponent, // main layout
    children: [
      { path: 'welcome', component: WelcomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'coach', component: CoachComponent },
      { path: 'forum', component: ForumComponent },
      { path: 'social', component: SocialComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    ],
  },

  // Fallbacks
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/welcome' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

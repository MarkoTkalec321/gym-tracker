import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Route, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {AuthService} from "../service/auth.service";
import {ToastService} from "../service/toast.service";
import {SupabaseService} from "../service/supabase.service";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @Output() logoutClick = new EventEmitter<void>();
  tabs: { label: string, route: string }[] = [];
  selectedTab = 0;
  isLoggedIn = false;
  membershipType: string | null = null;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              private toastService: ToastService,
              private supabaseService: SupabaseService

  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    this.isLoggedIn = !!user;

    if (this.isLoggedIn && user) {
      const membership = await this.supabaseService.getMembershipDataAndRefresh(user.id);
      this.membershipType = membership?.type || null;
    }

    this.setupTabs();

    // Update selectedTab on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const child = this.route.firstChild;
        if (child) {
          const path = child.snapshot.routeConfig?.path;
          const index = this.tabs.findIndex(tab => tab.route === path);
          if (index !== -1) this.selectedTab = index;
        }
      });
  }

  setupTabs() {
    const childRoutes = this.route.routeConfig?.children || [];

    this.tabs = childRoutes
      .filter(r => r.component)
      .filter(r => this.isRouteAllowed(r.path!))
      .map(r => ({ route: r.path!, label: this.capitalize(r.path!) }));
  }

  private isRouteAllowed(path: string): boolean {
    if (this.membershipType === 'pro') {
      return !['coach', 'admin', 'social'].includes(path);
    }
    if (this.membershipType === 'elite') {
      return !['coach', 'admin'].includes(path);
    }
    return true; // fallback: allow all
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.isLoggedIn = false;
      this.toastService.showSuccess('You have been logged out successfully.');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
      this.toastService.showError('Logout failed.');
    }
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    this.router.navigate([this.tabs[index].route], { relativeTo: this.route });
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

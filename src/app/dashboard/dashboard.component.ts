import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../service/supabase.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  subscription: any = null;
  loading = true;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadSubscription();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async loadSubscription() {
    try {
      this.subscription = await this.supabaseService.getUserSubscription();
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}
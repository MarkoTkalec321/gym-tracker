import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../service/supabase.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabaseService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.loadOrders();
      }
    });
  }

  async loadOrders() {
    try {
      this.orders = await this.supabaseService.getUserOrders();
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to load orders';
    } finally {
      this.loading = false;
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'completed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'canceled':
        return 'warn';
      default:
        return 'primary';
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
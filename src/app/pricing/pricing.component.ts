import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../service/supabase.service';
import { STRIPE_PRODUCTS, StripeProduct } from '../../stripe-config';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  products = STRIPE_PRODUCTS;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    this.supabaseService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  async purchaseProduct(product: StripeProduct) {
    this.loading = true;
    this.errorMessage = null;

    try {
      const { url } = await this.supabaseService.createCheckoutSession(product.priceId, product.mode);
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create checkout session';
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
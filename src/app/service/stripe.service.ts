import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../config/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  async checkout(planId: string, userId: string) {
    const res = await fetch(environment.supabaseUrl + environment.functions.createCheckoutSession, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, userId }),
    });

    const { sessionId, error } = await res.json();
    if (error || !sessionId) throw new Error(error || 'No sessionId returned');

    const stripe = await loadStripe(environment.stripePublicKey);
    if (!stripe) throw new Error('Stripe failed to load');

    await stripe.redirectToCheckout({ sessionId });
  }

  async cancelSubscription(userId: string, scheduledPlan: string) {
    const res = await fetch(environment.supabaseUrl + environment.functions.cancelSubscription, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, scheduledPlan })
    });

    if (!res.ok) {
      throw new Error(`Cancel failed: ${await res.text()}`);
    }

    return res.json();
  }

}

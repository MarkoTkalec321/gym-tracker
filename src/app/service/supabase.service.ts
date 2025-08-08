import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      'https://aijvzrmcakpmkredknsq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpanZ6cm1jYWtwbWtyZWRrbnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzEwNDIsImV4cCI6MjA2NDkwNzA0Mn0.K9cIqAtqTpfrquxnOZONwDE7WYiSu2y8emM31q5mqzQ'
    );

    // Initialize auth state
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUserSubject.next(session?.user ?? null);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  async createCheckoutSession(priceId: string, mode: 'payment' | 'subscription') {
    const session = await this.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`https://aijvzrmcakpmkredknsq.supabase.co/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        mode,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/pricing`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    return response.json();
  }

  async getUserSubscription() {
    const { data, error } = await this.supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getUserOrders() {
    const { data, error } = await this.supabase
      .from('stripe_user_orders')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data;
  }
}

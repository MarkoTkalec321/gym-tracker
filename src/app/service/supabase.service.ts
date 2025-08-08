import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://aijvzrmcakpmkredknsq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpanZ6cm1jYWtwbWtyZWRrbnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzEwNDIsImV4cCI6MjA2NDkwNzA0Mn0.K9cIqAtqTpfrquxnOZONwDE7WYiSu2y8emM31q5mqzQ'                         // replace with your anon public key
    );
  }

}

// admin.component.ts
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../service/supabase.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  clients: any[] = [];
  loading = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    this.loading = true;
    try {
      this.clients = await this.supabaseService.getClients();
    } catch (err) {
      console.error('Failed to load clients', err);
    } finally {
      this.loading = false;
    }
  }

  async deleteClient(clientId: string) {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await this.supabaseService.deleteClient(clientId);
      this.clients = this.clients.filter(c => c.id !== clientId);
    } catch (err) {
      console.error('Failed to delete client', err);
    }
  }
}

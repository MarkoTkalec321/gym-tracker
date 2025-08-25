import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import { AuthService } from '../../service/auth.service';
import { ToastService } from '../../service/toast.service';
import { MatTableDataSource } from '@angular/material/table';
import {Subject} from "rxjs";

@Component({
  selector: 'app-add-clients',
  templateUrl: './add-clients.component.html',
  styleUrls: ['./add-clients.component.scss']
})
export class AddClientsComponent implements OnInit {
  clients: any[] = [];
  groups: any[] = [];
  coachGroups: any[] = [];
  loading = true;
  dataSource = new MatTableDataSource<any>();
  clientAdded$ = new Subject<any>(); // notify parent when client is added


  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private toastService: ToastService,
    @Optional() private dialogRef?: MatDialogRef<AddClientsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {}

  async ngOnInit() {
    const user = await this.authService.getUser();
    if (!user) {
      this.toastService.showError('Unable to get logged-in user.');
      this.loading = false;
      return;
    }

    // Fetch all clients
    this.clients = await this.supabaseService.getAllClientsWithGroups();

    // Fetch groups **created by the logged-in coach**
    this.coachGroups = await this.supabaseService.getGroupsByCoach(user.id);

    // Assign a default group to each client from available coach groups
    this.clients.forEach(client => {
      const availableGroups = this.getAvailableGroups(client);
      if (availableGroups.length > 0) {
        client.selectedGroup = availableGroups[0].id;
      } else {
        client.selectedGroup = null;
      }
    });

    this.dataSource.data = this.clients;
    this.loading = false;
  }

  // Return groups that the client is NOT in and that belong to the logged-in coach
  getAvailableGroups(client: any) {
    const clientGroupIds = client.groups?.map((g: any) => g.id) || [];
    return this.coachGroups.filter(group => !clientGroupIds.includes(group.id));
  }

  async addClientToGroup(client: any) {
    try {
      const group = this.coachGroups.find(g => g.id === client.selectedGroup);
      if (!group) {
        this.toastService.showError('Selected group not found.');
        return;
      }

      const { data: groupClients, error } = await this.supabaseService.getGroupClients(group.id);
      if (error) throw error;

      const currentClients = groupClients || [];

      if (group.capacity !== null && currentClients.length >= group.capacity) {
        this.toastService.showError(`Group "${group.name}" is full!`);
        return;
      }

      await this.supabaseService.addClientToGroup(client.id, client.selectedGroup);

      this.toastService.showSuccess(
        `${client.first_name} ${client.last_name} added to a group successfully!`
      );

      client.groups = client.groups || [];
      client.groups.push(group);

      const availableGroups = this.getAvailableGroups(client);
      client.selectedGroup = availableGroups.length > 0 ? availableGroups[0].id : null;

      this.clientAdded$.next({ id: group.id, clientCount: currentClients.length + 1 });

      // ✅ Close dialog and pass updatedGroupId
      //this.dialogRef?.close({ updatedGroupId: group.id });

    } catch (error: any) {
      console.error('Error adding client to group:', error.message);
      this.toastService.showError('Failed to add client to group.');
    }
  }

  close() {
    this.dialogRef?.close();
  }
}

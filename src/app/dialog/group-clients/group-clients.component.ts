import {Component, Inject, Optional, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import { MatTableDataSource } from '@angular/material/table';
import {ToastService} from "../../service/toast.service";
import {firstValueFrom} from "rxjs";
import {MESSAGES} from "../../data/messages.data";
import {ConfirmDialogData, ConfirmDialogDataDeleteClient} from "../../model/confirm-dialog.model";
import {DeleteClientComponent} from "../delete-client/delete-client.component";

@Component({
  selector: 'app-group-clients',
  templateUrl: './group-clients.component.html',
  styleUrls: ['./group-clients.component.scss']
})
export class GroupClientsComponent implements OnInit {
  clients: any[] = [];
  loading = true;
  dataSource = new MatTableDataSource<any>();

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  constructor(
    private supabaseService: SupabaseService,
    private toastService: ToastService,
    private dialog: MatDialog,
    @Optional() private dialogRef?: MatDialogRef<GroupClientsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { groupId: string }
  ) {}

  async ngOnInit() {
    if (this.data?.groupId) {
      this.clients = await this.supabaseService.getClientsByGroup(this.data.groupId);
      this.dataSource.data = this.clients;
    }
    this.loading = false;
  }

  async openConfirm(title: string, message: string) {
    const dialogRef = this.dialog.open<DeleteClientComponent, ConfirmDialogDataDeleteClient, boolean>(
      DeleteClientComponent,
      {
        width: '400px',
        data: { title, message }
      }
    );

    return await firstValueFrom(dialogRef.afterClosed());
  }

  async removeClient(client: any) {
    if (!this.data?.groupId) return;

    const messageConfig = MESSAGES.deleteClientFromGroup(
      `${client.first_name} ${client.last_name}`
    );

    const confirmed = await this.openConfirm(
      messageConfig.title,
      messageConfig.message
    );

    if (!confirmed) return;

    try {
      await this.supabaseService.removeClientFromGroup(client.id, this.data.groupId);

      this.clients = this.clients.filter(c => c.id !== client.id);
      this.dataSource.data = this.clients;

      this.toastService.showSuccess('Client removed successfully');
    } catch (err) {
      console.error('Failed to remove client:', err);
      this.toastService.showError('Failed to remove client');
    }
  }


  close() {
    this.dialogRef?.close();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SupabaseService } from "../../service/supabase.service";
import { MatDialog } from '@angular/material/dialog';
import {ToastService} from "../../service/toast.service";
import {MESSAGES} from "../../data/messages.data";
import {ConfirmationDialogComponent} from "../../confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-thread-delete-dialog',
  template: `
    <button mat-icon-button color="warn" (click)="deleteThread($event)" [disabled]="deleting">
      <mat-icon *ngIf="!deleting" style="font-size: 35px; width: 35px; height: 35px;">delete</mat-icon>
      <mat-spinner *ngIf="deleting" diameter="24"></mat-spinner>
    </button>
  `,
  styleUrls: ['./thread-delete-dialog.component.scss'],
})
export class ThreadDeleteDialogComponent {
  @Input() threadId!: string;
  @Output() deleted: EventEmitter<string> = new EventEmitter<string>();

  deleting = false;

  constructor(
    private supabase: SupabaseService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  async deleteThread(event: Event) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: MESSAGES.deleteThread.title,
        message: MESSAGES.deleteThread.message,
        options: MESSAGES.deleteThread.options
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (!result) return;

    this.deleting = true;
    const { error } = await this.supabase.deleteThread(this.threadId);

    if (error) {
      this.toastService.showError('Error deleting thread: ' + error.message);
      this.deleting = false;
      return;
    }

    this.deleted.emit(this.threadId);
    this.toastService.showSuccess('Thread deleted successfully');
    this.deleting = false;
  }
}

import { Component, Inject, OnInit, Optional } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { SupabaseService } from '../../service/supabase.service';
import {
  TrainingSessionsDeleteDialogComponent
} from "../training-sessions-delete-dialog/training-sessions-delete-dialog.component";

@Component({
  selector: 'app-training-sessions-dialog-view',
  templateUrl: './training-sessions-dialog-view.component.html',
  styleUrls: ['./training-sessions-dialog-view.component.scss']
})
export class TrainingSessionsDialogViewComponent implements OnInit {
  sessions: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private dialog: MatDialog,
    @Optional() private dialogRef?: MatDialogRef<TrainingSessionsDialogViewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { groupId?: string }
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  async loadSessions() {
    const groupId = this.data?.groupId;
    if (!groupId) {
      console.warn('No groupId provided to load sessions.');
      this.sessions = [];
      return;
    }

    this.sessions = await this.supabaseService.getTrainingSessionsByGroup(groupId);
  }

  openDeleteDialog(session: any) {
    const dialogRef = this.dialog.open(TrainingSessionsDeleteDialogComponent, {
      width: '300px',
      data: { session }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'confirm') {
        await this.supabaseService.deleteTrainingSession(session.id);
        this.loadSessions(); // refresh list
      }
    });
  }

  close() {
    this.dialogRef?.close();
  }
}

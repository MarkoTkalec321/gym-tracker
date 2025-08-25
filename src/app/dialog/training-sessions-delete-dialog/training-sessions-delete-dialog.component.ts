import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-training-sessions-delete-dialog',
  templateUrl: './training-sessions-delete-dialog.component.html',
  styleUrls: ['./training-sessions-delete-dialog.component.scss']
})
export class TrainingSessionsDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { session: any }) {}

}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.scss']
})
export class GroupDialogComponent {
  groupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GroupDialogComponent>
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [null, [Validators.min(1), Validators.max(99), Validators.required]]
    });
  }

  save() {
    if (this.groupForm.valid) {
      this.dialogRef.close(this.groupForm.value); // send back data
    }
  }

  cancel() {
    this.dialogRef.close(); // no data -> cancel
  }
}

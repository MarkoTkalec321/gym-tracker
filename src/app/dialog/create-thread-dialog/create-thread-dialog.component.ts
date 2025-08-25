import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-thread-dialog',
  templateUrl: './create-thread-dialog.component.html',
  styleUrls: ['./create-thread-dialog.component.scss']
})
export class CreateThreadDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateThreadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groupId: string }
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        group_id: this.data.groupId,
        title: this.form.value.title,
        content: this.form.value.content
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}

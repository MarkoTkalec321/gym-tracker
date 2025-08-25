import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SupabaseService} from "../../service/supabase.service";

@Component({
  selector: 'app-thread-delete-dialog',
  templateUrl: './thread-delete-dialog.component.html',
  styleUrls: ['./thread-delete-dialog.component.scss']
})
export class ThreadDeleteDialogComponent {
  @Input() threadId!: string;
  @Output() deleted: EventEmitter<string> = new EventEmitter<string>();

  deleting = false;

  constructor(private supabase: SupabaseService) {}

  async deleteThread() {
    const confirmDelete = confirm('Are you sure you want to delete this thread?');
    if (!confirmDelete) return;

    this.deleting = true;
    const {error} = await this.supabase.deleteThread(this.threadId);

    if (error) {
      alert('Error deleting thread: ' + error.message);
      this.deleting = false;
      return;
    }

    this.deleted.emit(this.threadId);
    this.deleting = false;
  }
}

import { Component } from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {Group} from "../model/group.model";
import {ForumService} from "../service/forum.service";
import {Member} from "../model/member.model";
import {Thread} from "../model/thread.model";
import {CreateThreadDialogComponent} from "../dialog/create-thread-dialog/create-thread-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ThreadDetailComponent} from "../dialog/thread-detail/thread-detail.component";
import {MatMenuTrigger} from "@angular/material/menu";
import {ToastService} from "../service/toast.service";
import {SupabaseService} from "../service/supabase.service";
import {AuthService} from "../service/auth.service";

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent {
  groups$: Observable<Group[]>;
  selectedGroup$: Observable<Group | null>;
  threads$: Observable<Thread[]>;
  members$: Observable<Member[]>;
  selectedMember$ = new BehaviorSubject<Member | null>(null);

  constructor(private forumService: ForumService,
              private dialog: MatDialog,
              private supabaseService: SupabaseService,
              private authService: AuthService,
              private toastService: ToastService

  ) {
    this.groups$ = this.forumService.groups$;
    this.selectedGroup$ = this.forumService.selectedGroup$;
    this.threads$ = this.forumService.threads$;
    this.members$ = this.forumService.members$;
  }

  selectGroup(group: Group) {
    this.forumService.selectGroup(group);
  }
  openCreateThreadDialog(group: Group) {
    const dialogRef = this.dialog.open(CreateThreadDialogComponent, {
      width: '400px',
      data: { groupId: group.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.forumService.createThread(result);
      }
    });
  }

  onThreadDeleted(threadId: string) {
    this.threads$ = this.threads$.pipe(
      map(threads => threads.filter(t => t.id !== threadId))
    );
  }

  openThreadDialog(thread: Thread) {
    this.dialog.open(ThreadDetailComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      data: {
        threadId: thread.id,
        threadTitle: thread.title,
        threadContent: thread.content
      }
    });

  }

  openMenu(event: MouseEvent, member: Member, trigger: MatMenuTrigger) {
    event.preventDefault();
    this.selectedMember$.next(member);
    trigger.openMenu();
  }

  async sendFriendRequest() {
    const member = this.selectedMember$.value;
    if (!member) return;

    try {
      const user = await this.authService.getUser();

      if (!user) throw new Error('User not logged in');

      await this.supabaseService.sendFriendRequest(user.id, member.id);
      this.toastService.showSuccess(`Friend request sent to ${member.name}`);
    } catch (e: any) {
      if (e.message?.includes('Friend request already exists')) {
        this.toastService.showError(`Friend request to ${member.name} is already pending or accepted.`);
      } else {
        this.toastService.showError("Failed to send friend request. Please try again.");
      }
      console.error("Failed to send friend request:", e);
    }
  }




}

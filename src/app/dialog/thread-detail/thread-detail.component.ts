import {Component, Inject, Input, OnInit} from '@angular/core';
import {SupabaseService} from "../../service/supabase.service";
import {FormControl} from "@angular/forms";
import {AuthService} from "../../service/auth.service";
import {BehaviorSubject, map, startWith, switchMap} from "rxjs";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-thread-detail',
  templateUrl: './thread-detail.component.html',
  styleUrls: ['./thread-detail.component.scss']
})
export class ThreadDetailComponent implements OnInit {
  /*@Input() threadId!: string;
  @Input() threadTitle!: string;
  @Input() threadContent!: string;*/
  // Remove @Input() decorators - they won't work in dialogs
  threadId!: string;
  threadTitle!: string;
  threadContent!: string;

  newComment = new FormControl('');

  // reactive subjects
  private reloadComments$ = new BehaviorSubject<void>(undefined);
  private posting$ = new BehaviorSubject<boolean>(false);

  // reactive stream of comments
  comments$ = this.reloadComments$.pipe(
    switchMap(() => this.supabase.getCommentsForThread$(this.threadId))
  );

  // reactive stream of loading state
  loading$ = this.reloadComments$.pipe(
    map(() => true), // when reload triggered → set loading true
    startWith(true)
  );


  postingState$ = this.posting$.asObservable();

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.threadId = data.threadId;
    this.threadTitle = data.threadTitle;
    this.threadContent = data.threadContent;
  }

  ngOnInit() {
    // initial load
    this.reloadComments$.next();
  }

  async postComment() {
    const content = this.newComment.value?.trim();
    if (!content) return;

    this.posting$.next(true);

    try {
      const user = await this.authService.getUser();
      if (!user) return;

      const { error } = await this.supabase.addComment(this.threadId, content, user.id);

      if (error) {
        alert('Error posting comment: ' + error.message);
      } else {
        this.newComment.reset();
        this.reloadComments$.next(); // 🔥 reload reactively
      }
    } finally {
      this.posting$.next(false);
    }
  }

}

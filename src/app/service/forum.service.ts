// forum.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group } from '../model/group.model';
import { Thread } from '../model/thread.model';
import { Member } from '../model/member.model';
import { SupabaseService } from './supabase.service';
import {AuthService} from "./auth.service";

@Injectable({ providedIn: 'root' })
export class ForumService implements OnDestroy {
  private groupsSubject = new BehaviorSubject<Group[]>([]);
  private selectedGroupSubject = new BehaviorSubject<Group | null>(null);
  private threadsSubject = new BehaviorSubject<Thread[]>([]);
  private membersSubject = new BehaviorSubject<Member[]>([]);

  groups$: Observable<Group[]> = this.groupsSubject.asObservable();
  selectedGroup$: Observable<Group | null> = this.selectedGroupSubject.asObservable();
  threads$: Observable<Thread[]> = this.threadsSubject.asObservable();
  members$: Observable<Member[]> = this.membersSubject.asObservable();

  private subscriptions: any[] = [];

  constructor(private supabaseService: SupabaseService,
              private authService: AuthService
  ) {
    this.loadGroups();
    this.subscribeGroups();
  }

  /** Load groups initially */
  async loadGroups() {
    const user = await this.authService.getUser();
    if (!user) {
      console.error('No logged in user');
      return;
    }
    const  data  = await this.supabaseService.getGroupsByCoach(user.id);
    this.groupsSubject.next(data);
  }

  /** Realtime subscription for groups */
  subscribeGroups() {
    const sub = this.supabaseService.subscribeGroups(() => this.loadGroups());
    this.subscriptions.push(sub);
  }

  /** Select a group and load threads + members */
  async selectGroup(group: Group) {
    this.selectedGroupSubject.next(group);

    // Load threads with author info
    try {
      const { data: threads, error } = await this.supabaseService.getThreadsWithAuthors(group.id);
      if (!error && threads) {
        this.threadsSubject.next(threads);
      } else {
        console.error('Error loading threads:', error);
        this.threadsSubject.next([]);
      }
    } catch (e) {
      console.error('Error loading threads:', e);
      this.threadsSubject.next([]);
    }

    // Subscribe to realtime threads
    const threadSub = this.supabaseService.subscribeThreads(group.id, () => this.selectGroup(group));
    this.subscriptions.push(threadSub);

    // Load members
    try {
      const members = (await this.supabaseService.getClientsByGroup(group.id))
        .flat() as {
        id: string;
        user_id: string;
        first_name: string;
        last_name: string;
        date_of_birth: string;
      }[];

      this.membersSubject.next(
        members.map(m => ({
          id: m.user_id,
          name: `${m.first_name} ${m.last_name}`
        }))
      );
    } catch (e) {
      console.error('Error loading members:', e);
      this.membersSubject.next([]);
    }

    // Subscribe to realtime members
    const membersSub = this.supabaseService.subscribeGroupMembers(group.id, () => this.selectGroup(group));
    this.subscriptions.push(membersSub);
  }


  async createThread(threadData: { group_id: string; title: string; content: string }) {
    const user = await this.authService.getUser();
    if (!user) {
      console.error('No logged in user');
      return;
    }

    try {
      await this.supabaseService.createThread({
        group_id: threadData.group_id,
        title: threadData.title,
        content: threadData.content,
        author_id: user.id
      });
    } catch (e) {
      console.error('Error creating thread:', e);
    }
  }



  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => this.supabaseService.removeChannel(sub));
  }
}

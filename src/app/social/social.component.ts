import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Talk from 'talkjs';
import { AuthService } from "../service/auth.service";
import { SupabaseService } from "../service/supabase.service";
import { environment } from "../config/environment";

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss']
})
export class SocialComponent implements OnInit, OnDestroy {
  private session: Talk.Session | null = null;
  public currentUser!: Talk.User;

  // Make friends reactive
  public friends$ = new BehaviorSubject<any[]>([]);

  @ViewChild('talkjsContainer', { static: true }) talkjsContainer!: ElementRef;

  public chatbox: Talk.Chatbox | null = null;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await Talk.ready;

    const authUser = await this.authService.getUser();
    if (!authUser) {
      console.error("No user logged in");
      return;
    }

    const profile = await this.supabaseService.getUserProfile(authUser.id);

    this.currentUser = new Talk.User({
      id: profile.uid,
      name: profile.name,
      role: profile.role || "default"
    });

    this.session = new Talk.Session({
      appId: environment.talkJS.appId,
      me: this.currentUser
    });

    const friendIds = await this.supabaseService.getFriends(authUser.id);
    const friendProfiles = await this.supabaseService.getFriendProfiles(friendIds);

    // Update the reactive subject
    this.friends$.next(friendProfiles);
  }

  openChat(friend: any) {
    if (!this.session) return;

    const otherUser = new Talk.User({
      id: friend.uid,
      name: friend.name,
      role: friend.role || "default"
    });

    const conversationId = Talk.oneOnOneId(this.currentUser, otherUser);
    const conversation = this.session.getOrCreateConversation(conversationId);
    conversation.setParticipant(this.currentUser);
    conversation.setParticipant(otherUser);

    if (this.chatbox) this.chatbox.destroy();

    this.chatbox = this.session.createChatbox();
    this.chatbox.select(conversation);
    this.chatbox.mount(this.talkjsContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.session) this.session.destroy();
  }
}

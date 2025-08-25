import {Component, OnDestroy, OnInit} from '@angular/core';
import { SupabaseService } from '../service/supabase.service';
import {Subscription} from "rxjs";
import {AuthService} from "../service/auth.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;       // full user object
  membership: any = null;
  private membershipSub!: Subscription;

  constructor(private supabaseService: SupabaseService,
              private authService: AuthService) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      if (!user) return;

      this.user = user;
      this.membership = await this.supabaseService.getMembershipDataAndRefresh(user.id);

      this.membershipSub = this.supabaseService.membership$.subscribe((membership) => {
        this.membership = membership;
      });
    } catch (err: any) {
      console.error('Failed to load user info:', err.message || err);
    }
  }

  ngOnDestroy() {
    this.membershipSub?.unsubscribe();
  }
}

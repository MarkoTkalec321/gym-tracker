import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { Plan } from '../model/plan.model';
import { PLANS } from '../data/plan.data';
import { SupabaseService } from '../service/supabase.service';
import { StripeService } from '../service/stripe.service';
import {firstValueFrom, Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {MESSAGES} from "../data/messages.data";
import {ToastService} from "../service/toast.service";
import {AuthService} from "../service/auth.service";
import {ConfirmDialogData} from "../model/confirm-dialog.model";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  plans: Plan[] = PLANS;
  currentPlanId: string = 'free';
  userId: string | null = null;
  private membershipSub!: Subscription;
  scheduledPlanId: string | null = null;

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private stripeService: StripeService,
    private dialog: MatDialog,
    private router: Router,
    private toast: ToastService

  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      if (!user) {
        console.log('No user logged in');
        return;
      }

      this.userId = user.id;
      console.log('Logged in user:', user);

      // Fetch initial membership type
      const membership = await this.supabaseService.getMembershipDataAndRefresh(user.id);
      this.currentPlanId = membership?.type || 'free';
      this.scheduledPlanId = membership?.scheduled_plan || null; // <--- add this

      // Subscribe to membership changes
      this.membershipSub = this.supabaseService.membership$.subscribe(m => {
        this.currentPlanId = m?.type || 'free';
        this.scheduledPlanId = m?.scheduled_plan || null; // <--- add this
      });

    } catch (err: any) {
      console.error('Failed to load user or membership:', err.message || err);
    }
  }

  ngOnDestroy() {
    this.membershipSub?.unsubscribe();
  }

  async openOptions(data: ConfirmDialogData): Promise<string | null> {
    const dialogRef = this.dialog.open(this.confirmDialog, { data });
    return await firstValueFrom(dialogRef.afterClosed());
  }

  async openConfirm(title: string, message: string) {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      data: { title, message },
    });
    return await firstValueFrom(dialogRef.afterClosed());
  }

  async onSubscribe(plan: Plan) {
    if (!this.userId) {
      const choice = await this.openOptions({
        title: MESSAGES.notLoggedIn.title,
        message: MESSAGES.notLoggedIn.message,
        options: ['Register', 'Login', 'Cancel']
      });

      if (choice === 'Register') {
        await this.router.navigate(['/toolbar/register']);
      } else if (choice === 'Login') {
        await this.router.navigate(['/toolbar/login']);
      }

      return;
    }

    // Determine if this is a downgrade or upgrade
    const currentPlanIndex = this.plans.findIndex(p => p.id === this.currentPlanId);
    const selectedPlanIndex = this.plans.findIndex(p => p.id === plan.id);

    if (selectedPlanIndex < currentPlanIndex) {
      // downgrade
      const confirmed = await this.openConfirm(
        MESSAGES.downgrade(plan.name).title,
        MESSAGES.downgrade(plan.name).message
      );
      if (!confirmed) return;

      try {
        await this.stripeService.cancelSubscription(this.userId, plan.id);

        this.scheduledPlanId = plan.id;
        this.toast.showSuccess(MESSAGES.successDowngrade(plan.name));

        await this.supabaseService.getMembershipDataAndRefresh(this.userId);
      } catch (err: any) {
        console.error(err);
        this.toast.showSuccess(err.message || 'Failed to schedule downgrade.');
      }
    } else if (selectedPlanIndex > currentPlanIndex) {
      // upgrade
      const confirmed = await this.openConfirm(
        MESSAGES.upgrade(plan.name).title,
        MESSAGES.upgrade(plan.name).message
      );
      if (!confirmed) return;

      try {
        await this.stripeService.checkout(plan.id, this.userId);
        await this.supabaseService.getMembershipDataAndRefresh(this.userId);

      } catch (err: any) {
        console.error(err);
        this.toast.showSuccess(err.message || 'Unexpected error occurred during checkout');
      }
    }
  }

  isCurrent(plan: Plan) {
    return plan.id === this.currentPlanId;
  }

  isScheduled(plan: Plan) {
    return plan.id === this.scheduledPlanId && plan.id !== this.currentPlanId;
  }

}

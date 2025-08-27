import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../service/supabase.service';
import { Subscription, forkJoin, of, firstValueFrom } from "rxjs";
import { AuthService } from "../service/auth.service";
import { ExerciseService } from "../service/exercise.service";
import { Exercise } from "../model/excercise.model";
import { switchMap, map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MESSAGES } from "../data/messages.data";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  membership: any = null;
  private membershipSub!: Subscription;
  favoriteExercises: (Exercise & { uniqueId: string; isExpanded: boolean })[] = [];
  loading = false;
  userProfile: any = null;

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getUser();
      if (!user) return;

      this.user = user;

      this.userProfile = await this.supabaseService.getUserProfile(user.id);

      this.membership = await this.supabaseService.getMembershipDataAndRefresh(user.id);

      this.membershipSub = this.supabaseService.membership$.subscribe((membership) => {
        this.membership = membership;
      });

      this.loadFavorites();

    } catch (err: any) {
      console.error('Failed to load user info:', err.message || err);
      this.showError('Failed to load user information');
    }
  }

  loadFavorites() {
    this.loading = true;
    this.supabaseService.getFavorites(this.user.id).pipe(
      switchMap((res: any) => {
        const favs = res.data || [];
        const favoriteNames = favs.map((f: any) => f.exercise_name);

        if (!favoriteNames.length) {
          this.favoriteExercises = [];
          return of([]);
        }

        return this.exerciseService.getExercises().pipe(
          map((allExercises: Exercise[]) =>
            allExercises
              .filter(ex => favoriteNames.includes(ex.name))
              .map((ex, index) => ({
                ...ex,
                uniqueId: ex.id?.toString() || `${ex.name}-${index}`,
                isExpanded: false
              }))
          )
        );
      }),
      catchError(error => {
        console.error('Error loading favorites:', error);
        this.showError('Failed to load favorite exercises');
        return of([]);
      })
    ).subscribe(exs => {
      this.favoriteExercises = exs;
      this.loading = false;
      this.cdRef.detectChanges();
    });
  }

  trackByExerciseId(index: number, exercise: any): string {
    return exercise.uniqueId;
  }

  toggleInstructions(exercise: Exercise & { uniqueId: string; isExpanded: boolean }) {
    console.log('Toggling exercise:', exercise.uniqueId);
    console.log('Current state:', exercise.isExpanded);

    // Close all other exercises
    this.favoriteExercises.forEach(ex => {
      if (ex.uniqueId !== exercise.uniqueId) {
        console.log('Closing exercise:', ex.uniqueId);
        ex.isExpanded = false;
      }
    });

    // Toggle the clicked exercise
    console.log('Toggling to:', !exercise.isExpanded);
    exercise.isExpanded = !exercise.isExpanded;

    console.log('Final state:', this.favoriteExercises.map(ex => ({
      id: ex.uniqueId,
      expanded: ex.isExpanded
    })));
  }

  async openConfirm(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(this.confirmDialog, {
      data: { title, message },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    return !!result;
  }

  removeFromFavorites(event: Event, exercise: Exercise & { uniqueId: string; isExpanded?: boolean }) {
    event.stopPropagation(); // Prevent the card from toggling when clicking the button

    if (!this.user) return;

    this.openConfirm(
      MESSAGES.removeFavorite(exercise.name).title,
      MESSAGES.removeFavorite(exercise.name).message
    ).then(confirm => {
      if (!confirm) return;

      this.loading = true;
      this.supabaseService.removeFavorite(this.user.id, exercise.name)
        .pipe(
          catchError(error => {
            console.error('Error removing favorite:', error);
            this.showError('Failed to remove from favorites');
            this.loading = false;
            return of(null);
          })
        )
        .subscribe((response: any) => {
          if (response && response.error) {
            this.showError('Failed to remove from favorites');
            this.loading = false;
            return;
          }

          this.favoriteExercises = this.favoriteExercises.filter(ex => ex.uniqueId !== exercise.uniqueId);
          this.showSuccess('Removed from favorites');
          this.loading = false;
          this.cdRef.detectChanges();
        });
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  ngOnDestroy() {
    this.membershipSub?.unsubscribe();
  }
}

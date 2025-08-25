import {Component, Inject, OnInit, Optional} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { SupabaseService } from '../../service/supabase.service';
import {AuthService} from "../../service/auth.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OSMService} from "../../service/osm.service";
import {map, Observable, startWith} from "rxjs";
import {ExerciseService} from "../../service/exercise.service";


@Component({
  selector: 'app-training-session-dialog',
  templateUrl: './training-session-dialog.component.html',
  styleUrls: ['./training-session-dialog.component.scss']
})
export class TrainingSessionDialogComponent implements OnInit {
  sessionForm!: FormGroup;
  groups: any[] = []; // will hold the coach's groups
  gyms: any[] = [];
  gymCtrl = new FormControl<string>('');
  filteredGyms!: Observable<any[]>;
  exercises: any[] = [];

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private osmService: OSMService,
    private exerciseService: ExerciseService,
    @Optional() private dialogRef?: MatDialogRef<TrainingSessionDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {}

  ngOnInit() {
    this.sessionForm = this.fb.group({
      name: [null, Validators.required],
      group_id: [null, Validators.required],
      gym: [null, Validators.required],
      date: [null, Validators.required],
      start_time: [null, Validators.required],
      duration: [null, Validators.required],
      exercise_names: [[]]
    });

    this.filteredGyms = this.gymCtrl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => this._filterGyms(value ?? ''))
    );

    this.loadGroups();
    this.loadOSMGyms();
    this.loadExercises();
  }

  private _filterGyms(value: string | any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : (value?.name ?? '').toLowerCase();
    return this.gyms.filter(gym =>
      gym.name.toLowerCase().includes(filterValue) ||
      gym.address.toLowerCase().includes(filterValue)
    );
  }


  onGymSelected(selectedGym: any) {
    console.log('Selected gym:', selectedGym);

    if (selectedGym) {
      this.sessionForm.patchValue({ gym: `${selectedGym.name}, ${selectedGym.address}` });
    }
  }

  displayGym(gym: any): string {
    return gym ? `${gym.name} – ${gym.address}` : '';
  }

  async loadGroups() {
    const user = await this.authService.getUser();
    console.log('Logged in user:', user);
    if (!user) return;

    this.groups = await this.supabaseService.getGroupsByCoach(user.id);
  }

  async loadOSMGyms() {
    this.osmService.searchGymsInCroatia().subscribe({
      next: (res: any) => {
        console.log('Overpass result:', res);

        this.gyms = res.elements
          .map((el: any) => {
            const addr = [
              el.tags['addr:street'],
              el.tags['addr:housenumber'],
              el.tags['addr:city']
            ].filter(Boolean).join(', ');

            return {
              name: el.tags?.name || null,
              address: addr || null,
              lat: el.lat,
              lng: el.lon
            };
          })
          .filter((gym: any) => !!gym.name && !!gym.address);
      },
      error: (err) => {
        console.error('Error loading gyms from Overpass:', err);
      }
    });
  }


  async submit() {
    if (this.sessionForm.invalid) return;

    const rawData = this.sessionForm.value;

    // ✅ Fix: keep date in local timezone
    const dateObj: Date = rawData.date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    // ✅ Convert start_time to HH:MM:SS
    let start_time = rawData.start_time;
    if (typeof start_time === 'string' && (start_time.includes('AM') || start_time.includes('PM'))) {
      const d = new Date(`1970-01-01T${start_time}`);
      start_time = d.toTimeString().split(' ')[0];
    } else if (start_time instanceof Date) {
      start_time = start_time.toTimeString().split(' ')[0];
    }

    // ✅ Convert duration (minutes) into HH:MM:SS
    const durationMinutes = Number(rawData.duration);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const duration = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:00`;

    const sessionData = {
      name: rawData.name,
      group_id: rawData.group_id,
      gym: rawData.gym,
      date: date,             // e.g. "2025-08-19"
      start_time: start_time, // e.g. "11:11:00"
      duration: duration      // e.g. "02:03:00"
    };

    try {
      const result = await this.supabaseService.createTrainingSession(sessionData);

      if (result.error) {
        console.error('Failed to create session:', result.error);
        return;
      }

      const createdSession = result.data; // ✅ the actual session object

      console.log('Session created:', createdSession);

      // Add exercises if any
      if (rawData.exercise_names && rawData.exercise_names.length > 0) {
        await this.supabaseService.addExercisesToSession(createdSession!.id, rawData.exercise_names);
      }

      console.log('Exercises for session:', rawData.exercise_names);

      this.dialogRef?.close(createdSession);

    } catch (error) {
      console.error('Unexpected error:', error);
    }

  }

  async loadExercises() {
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
      },
      error: (err) => {
        console.error('Failed to load exercises', err);
      }
    });
  }



  close() {
    this.dialogRef?.close();
  }

}

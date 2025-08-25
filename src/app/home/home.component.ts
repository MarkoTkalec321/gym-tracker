// home.component.ts
import { Component, OnInit } from '@angular/core';
import {ExerciseService} from "../service/exercise.service";
import {Exercise} from "../model/excercise.model";
import {SupabaseService} from "../service/supabase.service";
import {ToastService} from "../service/toast.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
// home.component.ts
export class HomeComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];

  types: string[] = [];
  muscles: string[] = [];
  equipment: string[] = [];
  difficulties: string[] = [];

  selectedType = '';
  selectedMuscle = '';
  selectedEquipment = '';
  selectedDifficulty = '';
  searchTerm = ''; // <-- new

  constructor(private exerciseService: ExerciseService,
              private supabaseService: SupabaseService,
              private toast: ToastService
              ) {}

  ngOnInit(): void {
    this.exerciseService.getExercises().subscribe(data => {
      this.exercises = data;
      this.filteredExercises = [...data];

      this.types = Array.from(new Set(data.map(e => e.type)));
      this.muscles = Array.from(new Set(data.map(e => e.muscle)));
      this.equipment = Array.from(new Set(data.map(e => e.equipment)));
      this.difficulties = Array.from(new Set(data.map(e => e.difficulty)));
    });
  }

  filterExercises(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredExercises = this.exercises.filter(e =>
      (this.selectedType ? e.type === this.selectedType : true) &&
      (this.selectedMuscle ? e.muscle === this.selectedMuscle : true) &&
      (this.selectedEquipment ? e.equipment === this.selectedEquipment : true) &&
      (this.selectedDifficulty ? e.difficulty === this.selectedDifficulty : true) &&
      (term ? e.name.toLowerCase().includes(term) : true) // <-- filter by name
    );
  }

  async addToFavorites(exercise: Exercise): Promise<void> {
    const result = await this.supabaseService.addFavorite(exercise.name);

    if (result.error) {
      if (result.error.code === '23505') {
        this.toast.showError(`${exercise.name} is already in favorites`);
      } else {
        this.toast.showError('Something went wrong while adding to favorites');
        console.error('Error adding to favorites', result.error);
      }
      return;
    }

    this.toast.showSuccess(`${exercise.name} added to favorites`);
  }

  expandedExerciseId: string | null = null;

  toggleInstructions(exercise: Exercise) {
    this.expandedExerciseId = this.expandedExerciseId === exercise.id ? null : exercise.id;
  }


}


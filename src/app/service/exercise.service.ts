import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Exercise} from "../model/excercise.model";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../config/environment";

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  constructor(private http: HttpClient) {}

  getExercises(): Observable<Exercise[]> {
    const headers = new HttpHeaders().set('X-Api-Key', environment.exercises.apiKey);
    return this.http.get<Exercise[]>(environment.exercises.apiUrl, { headers });
  }

}

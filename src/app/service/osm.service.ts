import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OSMService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient) {}

  searchGymsInCroatia(): Observable<any> {
    const query = `
    [out:json][timeout:25];
    area["ISO3166-1"="HR"][admin_level=2]->.croatia;
    (
      node["amenity"="gym"](area.croatia);
      node["leisure"="fitness_centre"](area.croatia);
      node["sport"="fitness"](area.croatia);
    );
    out center;
  `;


    return this.http.post(this.overpassUrl, query, {
      headers: { 'Content-Type': 'text/plain' },
      responseType: 'json'
    });
  }
}

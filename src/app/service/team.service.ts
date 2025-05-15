// src/app/service/team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Team } from '../models/team.model';
import { TeamDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  readonly backendUrl = 'team';

  constructor(private http: HttpClient) {}

  public getList(): Observable<Team[]> {
    return this.http.get<Team[]>(environment.backendBaseUrl + this.backendUrl);
  }

  public getOne(id: number): Observable<Team> {
    return this.http.get<Team>(
      environment.backendBaseUrl + this.backendUrl + `/${id}`
    );
  }

  public updateTeam(id: number, teamDto: TeamDto): Observable<Team> {
    return this.http.put<Team>(
      environment.backendBaseUrl + this.backendUrl + `/${id}`,
      teamDto
    );
  }
}

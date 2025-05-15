import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  readonly backendUrl = 'game';

  constructor(private http: HttpClient) {
  }

  public getList(): Observable<Game[]> {
    return this.http.get<Game[]>(environment.backendBaseUrl + this.backendUrl);
  }

  public getOne(id: number): Observable<Game> {
    return this.http.get<Game>(environment.backendBaseUrl + this.backendUrl + `/${id}`);
  }

}
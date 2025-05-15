// src/app/service/player.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { Player, PlayerDto, Team } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  readonly playerBackendUrl = 'player';
  readonly teamBackendUrl = 'team';

  constructor(private http: HttpClient) {}

  /**
   * Get players directly from the player endpoint
   * (note: team information might be incomplete)
   */
  public getPlayersDirectly(): Observable<Player[]> {
    return this.http.get<Player[]>(
      environment.backendBaseUrl + this.playerBackendUrl
    );
  }

  /**
   * Get players from all teams to ensure full team information is included
   */
  public getPlayers(): Observable<Player[]> {
    return this.http
      .get<Team[]>(environment.backendBaseUrl + this.teamBackendUrl)
      .pipe(
        map((teams) => {
          const allPlayers: Player[] = [];

          teams.forEach((team) => {
            if (team.players && team.players.length > 0) {
              // Add the team reference to each player
              const playersWithTeam = team.players.map((player) => {
                player.team = {
                  id: team.id,
                  name: team.name,
                  coach: team.coach,
                };
                return player;
              });

              allPlayers.push(...playersWithTeam);
            }
          });

          return allPlayers;
        })
      );
  }

  public getPlayerById(id: number): Observable<Player> {
    return this.http.get<Player>(
      environment.backendBaseUrl + this.playerBackendUrl + `/${id}`
    );
  }

  public searchPlayers(
    playerName?: string,
    date?: Date,
    startRange?: Date,
    endRange?: Date,
    teamName?: string,
    teamId?: number
  ): Observable<Player[]> {
    let params = new HttpParams();

    if (playerName) {
      params = params.set('playerName', playerName);
    }

    if (date) {
      params = params.set('date', date.toISOString().split('T')[0]);
    }

    if (startRange) {
      params = params.set('startRange', startRange.toISOString().split('T')[0]);
    }

    if (endRange) {
      params = params.set('endRange', endRange.toISOString().split('T')[0]);
    }

    if (teamName) {
      params = params.set('teamName', teamName);
    }

    if (teamId) {
      params = params.set('teamId', teamId.toString());
    }

    return this.http.get<Player[]>(
      environment.backendBaseUrl + this.playerBackendUrl + '/search',
      { params }
    );
  }

  public createPlayer(playerDto: PlayerDto): Observable<Player> {
    return this.http.post<Player>(
      environment.backendBaseUrl + this.playerBackendUrl,
      playerDto
    );
  }

  public updatePlayer(id: number, player: Player): Observable<Player> {
    return this.http.put<Player>(
      environment.backendBaseUrl + this.playerBackendUrl + `/${id}`,
      player
    );
  }

  public deletePlayer(id: number): Observable<any> {
    return this.http.delete(
      environment.backendBaseUrl + this.playerBackendUrl + `/${id}`
    );
  }
}

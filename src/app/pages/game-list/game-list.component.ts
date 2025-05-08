import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { GameService } from '../../service/game.service';
import { Game, GameStatus } from '../../models';
import { GameCardComponent } from '../../components/game-card/game-card.component';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterModule,
    GameCardComponent
  ],
  templateUrl: './game-list.component.html',
  styleUrl: './game-list.component.scss'
})
export class GameListComponent implements OnInit {
  games: Game[] = [];
  loading = true;
  error = '';
  
  // For filtering
  filteredGames: Game[] = [];
  activeFilter: GameStatus | 'ALL' = 'ALL';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.fetchGames();
  }

  fetchGames(): void {
    this.loading = true;
    this.gameService.getList().subscribe({
      next: (games) => {
        this.games = games;
        this.filteredGames = games;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching games:', error);
        this.error = 'Failed to load games. Please try again later.';
        this.loading = false;
      }
    });
  }

  filterByStatus(status: string): void {
    this.activeFilter = status as (GameStatus | 'ALL');
    
    if (status === 'ALL') {
      this.filteredGames = this.games;
    } else {
      this.filteredGames = this.games.filter(game => game.status === status);
    }
  }

  getStatusColor(status: GameStatus): string {
    switch (status) {
      case GameStatus.PENDING:
        return 'accent';
      case GameStatus.OVER:
        return 'primary';
      case GameStatus.CANCELLED:
        return 'warn';
      case GameStatus.RESCHEDULED:
        return '';
      default:
        return '';
    }
  }

  refreshGames(): void {
    this.fetchGames();
  }
}
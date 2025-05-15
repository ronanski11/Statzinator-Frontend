// src/app/pages/game-detail/game-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { GameService } from '../../service/game.service';
import { Game, GameStatus } from '../../models';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  templateUrl: './game-detail.component.html',
  styleUrl: './game-detail.component.scss',
})
export class GameDetailComponent implements OnInit {
  gameId!: number;
  game: Game | null = null;
  loading = true;
  error = '';

  // For stat keys display
  displayedStatColumns: string[] = ['key', 'team1', 'team2'];
  statRows: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.gameId = +id;
        this.loadGameDetails();
      }
    });
  }

  loadGameDetails(): void {
    this.loading = true;
    this.gameService.getOne(this.gameId).subscribe({
      next: (data) => {
        this.game = data;

        // Process stats if they exist
        if (this.game && this.game.stats && this.game.stats.stats) {
          this.processStatsForDisplay();
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading game details:', err);
        this.error = 'Failed to load game details. Please try again.';
        this.loading = false;
      },
    });
  }

  processStatsForDisplay(): void {
    if (!this.game || !this.game.stats || !this.game.stats.stats) {
      return;
    }

    const stats = this.game.stats.stats;
    const statRows: any[] = [];

    // Group related stats together
    const keys = Object.keys(stats);

    // Process team stats (t1, t2)
    const team1Stats: Record<string, string> = {};
    const team2Stats: Record<string, string> = {};

    keys.forEach((key) => {
      if (key.startsWith('t1')) {
        const baseKey = key.replace('t1', '');
        team1Stats[baseKey] = stats[key];
      } else if (key.startsWith('t2')) {
        const baseKey = key.replace('t2', '');
        team2Stats[baseKey] = stats[key];
      }
    });

    // Create rows for display
    Object.keys(team1Stats).forEach((baseKey) => {
      if (team2Stats[baseKey]) {
        const displayName = this.formatStatName(baseKey);
        statRows.push({
          key: displayName,
          team1: team1Stats[baseKey],
          team2: team2Stats[baseKey],
        });
      }
    });

    this.statRows = statRows;
  }

  formatStatName(statKey: string): string {
    // Convert keys like "FGM2" to "Field Goals Made (2PT)"
    switch (statKey) {
      case 'FGA2':
        return 'Field Goal Attempts (2PT)';
      case 'FGA3':
        return 'Field Goal Attempts (3PT)';
      case 'FGM2':
        return 'Field Goals Made (2PT)';
      case 'FGM3':
        return 'Field Goals Made (3PT)';
      case 'FTA':
        return 'Free Throw Attempts';
      case 'FTM':
        return 'Free Throws Made';
      case 'FTPercent':
        return 'Free Throw Percentage';
      case 'FG2Percent':
        return '2PT Percentage';
      case 'FG3Percent':
        return '3PT Percentage';
      case 'TO':
        return 'Turnovers';
      case 'Rbs':
        return 'Rebounds';
      case 'Ass':
        return 'Assists';
      case 'Fls':
        return 'Fouls';
      case 'Pts':
        return 'Points';
      default:
        return statKey;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
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

  getStatusIcon(status: GameStatus): string {
    switch (status) {
      case GameStatus.PENDING:
        return 'schedule';
      case GameStatus.OVER:
        return 'check_circle';
      case GameStatus.CANCELLED:
        return 'cancel';
      case GameStatus.RESCHEDULED:
        return 'event_repeat';
      default:
        return 'help';
    }
  }

  hasStats(): boolean {
    return (
      !!this.game?.stats &&
      (this.game.stats.stats
        ? Object.keys(this.game.stats.stats).length > 0
        : false)
    );
  }

  // Helper methods to safely access stats
  getStatValue(key: string): string {
    if (!this.game || !this.game.stats || !this.game.stats.stats) {
      return '0';
    }
    return this.game.stats.stats[key] || '0';
  }

  getTeam1Points(): string {
    return this.getStatValue('t1Pts');
  }

  getTeam2Points(): string {
    return this.getStatValue('t2Pts');
  }

  getTeam1FG2Percent(): string {
    return this.getStatValue('t1FG2Percent');
  }

  getTeam1FG3Percent(): string {
    return this.getStatValue('t1FG3Percent');
  }

  getTeam2FG2Percent(): string {
    return this.getStatValue('t2FG2Percent');
  }

  getTeam2FG3Percent(): string {
    return this.getStatValue('t2FG3Percent');
  }

  getTeam1Rebounds(): string {
    return this.getStatValue('t1Rbs');
  }

  getTeam2Rebounds(): string {
    return this.getStatValue('t2Rbs');
  }

  getTeam1Assists(): string {
    return this.getStatValue('t1Ass');
  }

  getTeam2Assists(): string {
    return this.getStatValue('t2Ass');
  }

  getTeam1Turnovers(): string {
    return this.getStatValue('t1TO');
  }

  getTeam2Turnovers(): string {
    return this.getStatValue('t2TO');
  }
}

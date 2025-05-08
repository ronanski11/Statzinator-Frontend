import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Game, GameStatus } from '../../models';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss'
})
export class GameCardComponent {
  @Input() game!: Game;
  
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
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  hasStats(): boolean {
    return !!this.game.stats && (this.game.stats.stats ? Object.keys(this.game.stats.stats).length > 0 : false);
  }
  
  getStatsCount(): number {
    return this.game.stats && this.game.stats.stats ? Object.keys(this.game.stats.stats).length : 0;
  }
}
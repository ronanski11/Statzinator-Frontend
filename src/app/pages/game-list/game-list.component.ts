import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatBadgeModule } from '@angular/material/badge';

import { GameService } from '../../service/game.service';
import { Game, GameStatus } from '../../models';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatBadgeModule
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

  // For table
  displayedColumns: string[] = ['id', 'time', 'teams', 'status', 'actions'];
  
  // For pagination
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;
  pageIndex = 0;
  paginatedGames: Game[] = [];

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
        this.updatePaginatedGames();
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
    
    // Reset pagination when filter changes
    this.pageIndex = 0;
    this.updatePaginatedGames();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }
    
    this.filteredGames = this.filteredGames.slice().sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id': return this.compare(a.id, b.id, isAsc);
        case 'time': return this.compare(new Date(a.time).getTime(), new Date(b.time).getTime(), isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
    
    this.updatePaginatedGames();
  }
  
  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedGames();
  }
  
  updatePaginatedGames(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.paginatedGames = this.filteredGames.slice(startIndex, startIndex + this.pageSize);
  }

  refreshGames(): void {
    this.fetchGames();
  }
  
  hasStats(game: Game): boolean {
    return !!game.stats && (game.stats.stats ? Object.keys(game.stats.stats).length > 0 : false);
  }
}
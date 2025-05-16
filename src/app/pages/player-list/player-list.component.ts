// src/app/pages/player-list/player-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PlayerService } from '../../service/player.service';
import { Player } from '../../models';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  paginatedPlayers: Player[] = [];
  loading = true;
  error = '';

  // Search/filter properties
  searchName = '';
  searchTeam = '';

  // Table properties
  displayedColumns: string[] = [
    'fullName',
    'team',
    'age',
    'physical',
    'dateOfBirth',
    'actions',
  ];

  // Pagination properties
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 10;
  pageIndex = 0;

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loading = true;
    // Use the updated getPlayers method that retrieves players from teams
    this.playerService.getPlayers().subscribe({
      next: (data) => {
        this.players = data;
        this.filteredPlayers = [...this.players];
        this.updatePaginatedPlayers();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading players:', err);
        this.error = 'Failed to load players. Please try again.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    if (!this.searchName && !this.searchTeam) {
      // If no search terms, reset to all players
      this.filteredPlayers = [...this.players];
      this.pageIndex = 0;
      this.updatePaginatedPlayers();
      return;
    }

    this.loading = true;

    // Local filtering instead of API calls if we already have all players with team data
    if (this.players.length > 0) {
      this.filteredPlayers = this.players.filter((player) => {
        // Case-insensitive name search
        const nameMatch =
          !this.searchName ||
          player.fullName.toLowerCase().includes(this.searchName.toLowerCase());

        // Case-insensitive team search
        const teamMatch =
          !this.searchTeam ||
          (player.team &&
            player.team.name
              .toLowerCase()
              .includes(this.searchTeam.toLowerCase()));

        return nameMatch && teamMatch;
      });

      this.pageIndex = 0; // Reset to first page when filters change
      this.updatePaginatedPlayers();
      this.loading = false;
    } else {
      // Fall back to API search if we don't have player data
      this.playerService
        .searchPlayers(
          this.searchName || undefined,
          undefined, // date
          undefined, // startRange
          undefined, // endRange
          this.searchTeam || undefined,
          undefined // teamId
        )
        .subscribe({
          next: (data) => {
            this.filteredPlayers = data;
            this.pageIndex = 0; // Reset to first page when filters change
            this.updatePaginatedPlayers();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error searching players:', err);
            this.error = 'Failed to search players. Please try again.';
            this.loading = false;
          },
        });
    }
  }

  resetFilters(): void {
    this.searchName = '';
    this.searchTeam = '';
    this.filteredPlayers = [...this.players];
    this.pageIndex = 0;
    this.updatePaginatedPlayers();
  }

  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.filteredPlayers = [...this.filteredPlayers].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'id':
          return this.compare(a.id, b.id, isAsc);
        case 'fullName':
          return this.compare(a.fullName, b.fullName, isAsc);
        case 'age':
          return this.compare(a.age, b.age, isAsc);
        case 'dateOfBirth':
          return this.compare(
            new Date(a.dateOfBirth).getTime(),
            new Date(b.dateOfBirth).getTime(),
            isAsc
          );
        case 'team':
          const teamA = a.team ? a.team.name : '';
          const teamB = b.team ? b.team.name : '';
          return this.compare(teamA, teamB, isAsc);
        default:
          return 0;
      }
    });

    this.updatePaginatedPlayers();
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedPlayers();
  }

  updatePaginatedPlayers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.paginatedPlayers = this.filteredPlayers.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

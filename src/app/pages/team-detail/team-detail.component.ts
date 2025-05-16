// src/app/pages/team-detail/team-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TeamService } from '../../service/team.service';
import { Player, Team } from '../../models';
import { AppAuthService } from '../../service/app.auth.service';
import { AppRoles } from '../../app.roles';
import { PlayerService } from '../../service/player.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule, // Add this
  ],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.scss',
})
export class TeamDetailComponent implements OnInit {
  teamId!: number;
  team: Team | null = null;
  loading = true;
  error = '';
  displayedColumns: string[] = [
    'fullName',
    'age',
    'height',
    'weight',
    'dateOfBirth',
    'actions', // Add actions column
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private playerService: PlayerService,
    private authService: AppAuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  // Add delete player functionality
  deletePlayer(player: Player): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Player',
        message: `Are you sure you want to delete ${player.fullName}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.playerService.deletePlayer(player.id).subscribe({
          next: () => {
            // Remove player from the team's player list
            if (this.team && this.team.players) {
              this.team.players = this.team.players.filter(
                (p) => p.id !== player.id
              );
            }

            // Show success notification
            this.snackBar.open(
              `Player ${player.fullName} deleted successfully`,
              'Close',
              { duration: 3000 }
            );
          },
          error: (error) => {
            console.error('Error deleting player:', error);
            this.snackBar.open('Failed to delete player', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  isAdmin(): boolean {
    let isAdmin = false;
    this.authService.getRoles().subscribe((roles) => {
      isAdmin = roles.includes(AppRoles.Admin);
    });
    return isAdmin;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.teamId = +id;
        this.loadTeamDetails();
      }
    });
  }

  loadTeamDetails(): void {
    this.loading = true;
    this.teamService.getOne(this.teamId).subscribe({
      next: (data) => {
        this.team = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading team details:', err);
        this.error = 'Failed to load team details. Please try again.';
        this.loading = false;
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

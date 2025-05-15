// src/app/pages/team-detail/team-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TeamService } from '../../service/team.service';
import { Team } from '../../models';
import { AppAuthService } from '../../service/app.auth.service';
import { AppRoles } from '../../app.roles';

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
  ];

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
    private authService: AppAuthService
  ) {}

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

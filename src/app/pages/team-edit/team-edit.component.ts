// src/app/pages/team-edit/team-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TeamService } from '../../service/team.service';
import { Team } from '../../models';
import { TeamDto } from '../../models/dtos/team-dto.model';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './team-edit.component.html',
  styleUrl: './team-edit.component.scss',
})
export class TeamEditComponent implements OnInit {
  teamId!: number;
  team: Team | null = null;
  loading = true;
  saving = false;
  error = '';
  teamForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamService: TeamService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      name: ['', Validators.required],
      coach: ['', Validators.required],
    });
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
        this.teamForm.patchValue({
          name: data.name,
          coach: data.coach,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading team details:', err);
        this.error = 'Failed to load team details. Please try again.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.saving = true;

      // Collect existing player IDs
      const playerIds = this.team?.players?.map((player) => player.id) || [];

      const teamDto: TeamDto = {
        name: this.teamForm.value.name,
        coach: this.teamForm.value.coach,
        playerIds: playerIds,
      };

      this.teamService.updateTeam(this.teamId, teamDto).subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Team updated successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/team', this.teamId]);
        },
        error: (err) => {
          console.error('Error updating team:', err);
          this.saving = false;
          this.snackBar.open('Failed to update team', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/team', this.teamId]);
  }
}

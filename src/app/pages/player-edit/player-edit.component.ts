// src/app/pages/player-edit/player-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { PlayerService } from '../../service/player.service';
import { TeamService } from '../../service/team.service';
import { Player, Team, PlayerDto } from '../../models';

@Component({
  selector: 'app-player-edit',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './player-edit.component.html',
  styleUrl: './player-edit.component.scss',
})
export class PlayerEditComponent implements OnInit {
  playerId!: number;
  player: Player | null = null;
  teams: Team[] = [];
  loading = true;
  saving = false;
  loadingTeams = true;
  error = '';
  playerForm: FormGroup;

  // Add these properties to handle team selection from query params
  preSelectedTeamId: number | null = null;
  selectedTeamName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playerService: PlayerService,
    private teamService: TeamService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.playerForm = this.fb.group({
      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/), // Only allow letters and spaces
        ],
      ],
      height: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.max(300), // Reasonable max height in cm
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Only numbers with up to 2 decimal places
        ],
      ],
      weight: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.max(250), // Reasonable max weight in kg
          Validators.pattern(/^\d+(\.\d{1,2})?$/), // Only numbers with up to 2 decimal places
        ],
      ],
      dateOfBirth: [
        '',
        [
          Validators.required,
          // Add custom validator to ensure date is not in the future
          this.dateNotInFuture,
        ],
      ],
      teamId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Get player ID from route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.playerId = +id;
        this.loadPlayerDetails();
        this.loadTeams();
      }
    });

    // Check for teamId in query params
    this.route.queryParams.subscribe((params) => {
      const teamId = params['teamId'];
      if (teamId) {
        this.preSelectedTeamId = +teamId;
        // Will update form value after teams are loaded
      }
    });
  }

  // Custom validator to prevent future dates
  dateNotInFuture(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const today = new Date();
    const inputDate = new Date(control.value);
    // Remove time portion for comparison
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate > today ? { futureDate: true } : null;
  }

  loadPlayerDetails(): void {
    this.loading = true;
    this.playerService.getPlayerById(this.playerId).subscribe({
      next: (data) => {
        this.player = data;
        this.playerForm.patchValue({
          fullName: data.fullName,
          height: data.height,
          weight: data.weight,
          dateOfBirth: data.dateOfBirth,
          teamId: data.team?.id,
        });

        // If we have a preSelectedTeamId from query params, override the form value
        if (this.preSelectedTeamId) {
          this.playerForm.patchValue({
            teamId: this.preSelectedTeamId,
          });
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading player details:', err);
        this.error = 'Failed to load player details. Please try again.';
        this.loading = false;
      },
    });
  }

  loadTeams(): void {
    this.loadingTeams = true;
    this.teamService.getList().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loadingTeams = false;

        // If we have a preSelectedTeamId, update the form and get the team name
        if (this.preSelectedTeamId) {
          this.playerForm.patchValue({
            teamId: this.preSelectedTeamId,
          });
          this.updateSelectedTeamName();
        }
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.loadingTeams = false;
      },
    });
  }

  updateSelectedTeamName(): void {
    if (this.preSelectedTeamId && this.teams && this.teams.length > 0) {
      const team = this.teams.find((t) => t.id === this.preSelectedTeamId);
      this.selectedTeamName = team ? team.name : 'Unknown team';
    }
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      this.saving = true;

      // Get the date of birth from the form
      const birthDate = new Date(this.playerForm.value.dateOfBirth);

      // Format the date as YYYY-MM-DD to avoid timezone issues
      const formattedDate = this.formatDateForBackend(birthDate);

      // Calculate age from date of birth
      const age = this.calculateAge(birthDate);

      // Create PlayerDto for update
      const playerDto: PlayerDto = {
        fullName: this.playerForm.value.fullName,
        height: this.playerForm.value.height,
        weight: this.playerForm.value.weight,
        dateOfBirth: formattedDate,
        teamId: this.playerForm.value.teamId,
        age: age, // Include calculated age
      };

      console.log('Sending PlayerDto for update:', playerDto);

      this.playerService.updatePlayer(playerDto, this.playerId).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.saving = false;
          this.snackBar.open('Player updated successfully', 'Close', {
            duration: 3000,
          });

          // If we came from a team page, redirect back to that team
          if (this.preSelectedTeamId) {
            this.router.navigate(['/team', this.preSelectedTeamId]);
          } else {
            // Otherwise go to players list
            this.router.navigate(['/players']);
          }
        },
        error: (err) => {
          console.error('Error updating player:', err);
          this.saving = false;
          this.snackBar.open('Failed to update player', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  cancel(): void {
    // If we came from a team page, redirect back to that team
    if (this.preSelectedTeamId) {
      this.router.navigate(['/team', this.preSelectedTeamId]);
    } else {
      // Otherwise go to players list
      this.router.navigate(['/players']);
    }
  }
}

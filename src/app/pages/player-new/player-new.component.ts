// src/app/pages/player-new/player-new.component.ts
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
import { PlayerDto, Team } from '../../models';

@Component({
  selector: 'app-player-new',
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
  templateUrl: './player-new.component.html',
  styleUrl: './player-new.component.scss',
})
export class PlayerNewComponent implements OnInit {
  teams: Team[] = [];
  loading = false;
  saving = false;
  loadingTeams = true;
  error = '';
  playerForm: FormGroup;
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
    // Load teams
    this.loadTeams();

    // Check for teamId in query params
    this.route.queryParams.subscribe((params) => {
      const teamId = params['teamId'];
      if (teamId) {
        this.preSelectedTeamId = +teamId;
        this.playerForm.patchValue({ teamId: this.preSelectedTeamId });
        this.updateSelectedTeamName();
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

  updateSelectedTeamName(): void {
    if (this.preSelectedTeamId && this.teams && this.teams.length > 0) {
      const team = this.teams.find((t) => t.id === this.preSelectedTeamId);
      this.selectedTeamName = team ? team.name : 'Loading...';
    }
  }

  loadTeams(): void {
    this.loadingTeams = true;
    this.teamService.getList().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loadingTeams = false;

        // If we have a preSelectedTeamId, make sure it's set in the form
        if (this.preSelectedTeamId) {
          this.playerForm.patchValue({ teamId: this.preSelectedTeamId });
          this.updateSelectedTeamName();
        }
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.loadingTeams = false;
        this.error = 'Failed to load teams. Please try again.';
      },
    });
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If birth month is later in the year or same month but birth day is later, subtract one year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      this.saving = true;

      // Create PlayerDto for creation
      // Calculate age from date of birth
      const birthDate = new Date(this.playerForm.value.dateOfBirth);
      const age = this.calculateAge(birthDate);

      // Create PlayerDto for creation
      const playerDto: PlayerDto = {
        fullName: this.playerForm.value.fullName,
        height: this.playerForm.value.height,
        weight: this.playerForm.value.weight,
        dateOfBirth: this.playerForm.value.dateOfBirth,
        teamId: this.playerForm.value.teamId,
        age: age, // Set the calculated age
      };

      console.log('Sending PlayerDto for creation:', playerDto);

      this.playerService.createPlayer(playerDto).subscribe({
        next: (response) => {
          console.log('Creation response:', response);
          this.saving = false;
          this.snackBar.open('Player created successfully', 'Close', {
            duration: 3000,
          });

          // If we came from a team page (had teamId in query), redirect back to that team
          if (this.preSelectedTeamId) {
            this.router.navigate(['/team', this.preSelectedTeamId]);
          } else {
            // Otherwise go to players list
            this.router.navigate(['/players']);
          }
        },
        error: (err) => {
          console.error('Error creating player:', err);
          this.saving = false;
          this.snackBar.open('Failed to create player', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  cancel(): void {
    // If we came from a team page, go back to that team
    if (this.preSelectedTeamId) {
      this.router.navigate(['/team', this.preSelectedTeamId]);
    } else {
      // Otherwise go to players list
      this.router.navigate(['/players']);
    }
  }
}

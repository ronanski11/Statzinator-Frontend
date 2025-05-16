// src/app/pages/player-new/player-new.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
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
      fullName: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(0)]],
      weight: ['', [Validators.required, Validators.min(0)]],
      dateOfBirth: ['', Validators.required],
      teamId: ['', Validators.required],
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

  onSubmit(): void {
    if (this.playerForm.valid) {
      this.saving = true;

      // Create PlayerDto for creation
      const playerDto: PlayerDto = {
        fullName: this.playerForm.value.fullName,
        height: this.playerForm.value.height,
        weight: this.playerForm.value.weight,
        dateOfBirth: this.playerForm.value.dateOfBirth,
        teamId: this.playerForm.value.teamId,
        // The backend will calculate the age based on the date of birth
        age: 0, // This will be calculated by backend
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

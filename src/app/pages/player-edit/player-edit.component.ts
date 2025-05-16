// src/app/pages/player-edit/player-edit.component.ts
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
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.playerId = +id;
        this.loadPlayerDetails();
        this.loadTeams();
      }
    });
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
      },
      error: (err) => {
        console.error('Error loading teams:', err);
        this.loadingTeams = false;
      },
    });
  }

  onSubmit(): void {
    if (this.playerForm.valid) {
      this.saving = true;

      // Create PlayerDto for update
      const playerDto: PlayerDto = {
        fullName: this.playerForm.value.fullName,
        height: this.playerForm.value.height,
        weight: this.playerForm.value.weight,
        dateOfBirth: this.playerForm.value.dateOfBirth,
        teamId: this.playerForm.value.teamId,
        // The backend will calculate the age based on the date of birth
        age: 0, // This will be ignored/recalculated by backend
      };

      console.log('Sending PlayerDto for update:', playerDto);

      this.playerService.updatePlayer(playerDto, this.playerId).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.saving = false;
          this.snackBar.open('Player updated successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/players']);
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

  cancel(): void {
    this.router.navigate(['/players']);
  }
}
//

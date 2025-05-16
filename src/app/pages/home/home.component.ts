import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AppAuthService } from '../../service/app.auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AppAuthService) {}

  ngOnInit(): void {
    // Check if user is authenticated
    this.isLoggedIn = this.authService.isAuthenticated();

    // Subscribe to any authentication changes
    this.authService.accessTokenObservable.subscribe(() => {
      this.isLoggedIn = this.authService.isAuthenticated();
    });
  }
}

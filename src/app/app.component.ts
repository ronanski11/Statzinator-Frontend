import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameListComponent } from './pages/game-list/game-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'statzinator-frontend';
}

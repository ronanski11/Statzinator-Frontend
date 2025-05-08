import { Routes } from '@angular/router';
import { GameListComponent } from './pages/game-list/game-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'games', pathMatch: 'full' },
  { path: 'games', component: GameListComponent },
  { path: '**', redirectTo: 'games' }
];
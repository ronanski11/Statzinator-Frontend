// Updated src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GameListComponent } from './pages/game-list/game-list.component';
import { GameDetailComponent } from './pages/game-detail/game-detail.component';
import { TeamListComponent } from './pages/team-list/team-list.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';
import { PlayerListComponent } from './pages/player-list/player-list.component';
import { appCanActivate } from './guard/app.auth.guard';
import { AppRoles } from './app.roles';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { TeamEditComponent } from './pages/team-edit/team-edit.component';

export const routes: Routes = [
  {
    path: 'teams',
    component: TeamListComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Teams Overview',
    },
  },
  {
    path: 'team/:id',
    component: TeamDetailComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Team Details',
    },
  },
  {
    path: 'players',
    component: PlayerListComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Players Overview',
    },
  },
  {
    path: 'games',
    component: GameListComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'All Games',
    },
  },
  {
    path: 'games/:id',
    component: GameDetailComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Game Details',
    },
  },
  {
    path: 'team/:id/edit',
    component: TeamEditComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Admin],
      pagetitle: 'Edit Team',
    },
  },
  {
    path: 'noaccess',
    component: NoAccessComponent,
  },
  {
    path: '',
    redirectTo: '/teams',
    pathMatch: 'full',
  },
];

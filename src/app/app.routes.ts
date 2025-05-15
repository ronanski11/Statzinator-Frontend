// Updated src/app/app.routes.ts
import { Routes } from '@angular/router';
import { GameListComponent } from './pages/game-list/game-list.component';
import { TeamListComponent } from './pages/team-list/team-list.component';
import { TeamDetailComponent } from './pages/team-detail/team-detail.component';
import { appCanActivate } from './guard/app.auth.guard';
import { AppRoles } from './app.roles';
import { NoAccessComponent } from './pages/no-access/no-access.component';

export const routes: Routes = [
  {
    path: 'teams',
    component: TeamListComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Teams Overview'
    }
  },
  {
    path: 'team/:id',
    component: TeamDetailComponent,
    canActivate: [appCanActivate],
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Team Details'
    }
  },
  {
    path: 'games',
    component: GameListComponent,
    canActivate: [appCanActivate], 
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'All Games'
    }
  },
  {
    path: 'noaccess',
    component: NoAccessComponent
  },
];
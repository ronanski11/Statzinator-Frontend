import { Routes } from '@angular/router';
import { GameListComponent } from './pages/game-list/game-list.component';
import { appCanActivate } from './guard/app.auth.guard';
import { AppRoles } from './app.roles';
import { NoAccessComponent } from './pages/no-access/no-access.component';

export const routes: Routes = [
  {
    path: 'games',
    component: GameListComponent,
    canActivate: [appCanActivate], 
    data: {
      roles: [AppRoles.Read],
      pagetitle: 'Alle Spiele'
    }
  },{
      path: 'noaccess',
      component: NoAccessComponent
  },
];
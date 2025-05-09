import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RoutesRecognized } from '@angular/router';
import { AppRoles } from './app.roles';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AppLoginComponent } from './components/app-login/app-login.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [MatToolbar, MatButton, MatIcon, MatButton, MatMenuModule, RouterLink, AppLoginComponent,RouterOutlet],
})
export class AppComponent {

  public pagetitle = ''
  public roles = AppRoles;

  constructor(private router: Router) {
    this.router.events.subscribe(e => {
      if (e instanceof RoutesRecognized) {
        this.pagetitle = ''
        const route = e.state.root.firstChild
        if (route) {
          this.pagetitle = route.data['pagetitle'] || ''
        }
      }
    })
  }

}

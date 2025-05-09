import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatChip } from '@angular/material/chips';
import { AppAuthService } from '../../service/app.auth.service';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-login',
    templateUrl: './app-login.component.html',
    styleUrls: ['./app-login.component.scss'],
    imports: [MatIcon, NgIf, MatChip,MatButton],
})
export class AppLoginComponent implements OnInit {

  username = ''
  useralias = ''

  constructor(
    private authService : AppAuthService
  ) {}

  ngOnInit(): void {
    this.authService.usernameObservable.subscribe(name => {
      this.username = name;
    });
    this.authService.useraliasObservable.subscribe(alias => {
      this.useralias = alias;
    });
  }

  public login () {
    this.authService.login()
  }

  public logout () {
    this.authService.logout()
  }

  public isAuthenticated () : boolean {
    return this.authService.isAuthenticated()
  }

}

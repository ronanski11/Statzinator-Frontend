import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppLoginComponent } from './app-login.component';
import {AuthConfig, OAuthModule} from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import {createSpyFromClass} from 'jasmine-auto-spies';
import { authConfig } from 'src/app/app.auth';

describe('AppLoginComponent', () => {
  let component: AppLoginComponent;
  let fixture: ComponentFixture<AppLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        OAuthModule.forRoot({ resourceServer: { sendAccessToken: true } }),
        AppLoginComponent
    ],
    providers: [
        { provide: HttpClient, useValue: createSpyFromClass(HttpClient) },
        { provide: AuthConfig, useValue: authConfig }
    ],
    teardown: {destroyAfterEach: true}
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

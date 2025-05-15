import { ApplicationConfig, importProvidersFrom, inject, provideEnvironmentInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppAuthService } from './service/app.auth.service';
import { AuthConfig, OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { BrowserModule } from '@angular/platform-browser';
import { authConfig } from './app.auth';

export function storageFactory(): OAuthStorage {
  return sessionStorage;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(
        BrowserModule,
        OAuthModule.forRoot({ 
            resourceServer: { 
                sendAccessToken: true } 
            }
        ),
    ),
    { 
        provide: AuthConfig, 
        useValue: authConfig 
    },
    {
      provide: OAuthStorage,
      useFactory: storageFactory,
    },
    provideHttpClient(
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),    
    provideEnvironmentInitializer(() => {
        inject(AppAuthService).initAuth().finally()}
    )  
  ]
};

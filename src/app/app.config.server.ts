import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { provideServerRouting } from '@angular/ssr';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { appManifest } from './app-manifest';

// Register the app manifest with Angular
console.log('Configuring server with app manifest');

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    // Add any additional server-specific providers here
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

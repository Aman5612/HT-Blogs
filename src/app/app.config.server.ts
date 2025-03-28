import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes';
import { provideServerRouting } from '@angular/ssr';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';


const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    )
  ]
};
export const config = mergeApplicationConfig(appConfig, serverConfig);

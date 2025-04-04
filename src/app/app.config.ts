import { ApplicationConfig, inject, isDevMode, PLATFORM_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HashLocationStrategy, isPlatformBrowser, isPlatformServer, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
    withComponentInputBinding()),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideAnimations(),
    {
      provide: LocationStrategy, 
      useFactory: () => {
        // Use PathLocationStrategy for SSR and direct links (better for SEO)
        // Use HashLocationStrategy for development or when requested via query param
        const platformId = inject(PLATFORM_ID);
        const platformLocation = inject(PlatformLocation);
        
        // Check URL parameters
        if (isPlatformBrowser(platformId)) {
          // For client-side browsing
          const urlParams = new URLSearchParams(window.location.search);
          // Use hash strategy if explicitly requested with ?useHash=true
          if (urlParams.get('useHash') === 'true') {
            return new HashLocationStrategy(platformLocation);
          }
          
          // For development mode, you might want to use hash routing
          if (isDevMode()) {
            return new HashLocationStrategy(platformLocation);
          }
        }
        
        // For SSR/production, use regular paths for better SEO
        return new PathLocationStrategy(platformLocation);
      }
    }
  ]
};
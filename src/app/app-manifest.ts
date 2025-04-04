import { NgModule } from '@angular/core';
import bootstrap from '../main.server';
import { AngularNodeAppEngine } from '@angular/ssr/node';

// Create the app manifest
export const appManifest = {
  bootstrap: bootstrap,
  resolvers: {}
};

// Try to set the app manifest using Angular's internal API
try {
  // Angular uses different internal APIs across versions
  // Try different approaches to register the app manifest
  
  // For newer Angular versions (19+)
  const core = require('@angular/core');
  if (core.ɵAPP_ENGINE_MANIFEST && typeof core.ɵAPP_ENGINE_MANIFEST === 'object') {
    // Use APP_ENGINE_MANIFEST token
    core.ɵAPP_ENGINE_MANIFEST.bootstrap = bootstrap;
    console.log('Registered app manifest using ɵAPP_ENGINE_MANIFEST');
  } else if (typeof core.ɵsetAngularAppManifest === 'function') {
    // Use setAngularAppManifest function
    core.ɵsetAngularAppManifest(appManifest);
    console.log('Registered app manifest using ɵsetAngularAppManifest');
  } else if (typeof core.ɵsetAngularAppEngineManifest === 'function') {
    // Use setAngularAppEngineManifest function
    core.ɵsetAngularAppEngineManifest({ resolver: { bootstrap } });
    console.log('Registered app manifest using ɵsetAngularAppEngineManifest');
  } else {
    console.warn('Could not find Angular internal API to set app manifest');
  }
} catch (error) {
  console.warn('Error registering app manifest:', error);
}

/**
 * Get the Angular Node App Engine
 */
export function initializeSSREngine() {
  return new AngularNodeAppEngine();
}

/**
 * This module registers the application with Angular's SSR engine.
 * By importing this module, we ensure the app manifest is properly registered.
 */
@NgModule({
  providers: [
    // Provide bootstrap function to Angular's DI system
    {
      provide: 'APP_BOOTSTRAP_FUNCTION',
      useValue: bootstrap
    }
  ]
})
export class AppManifestModule {
  // Static accessor for the bootstrap function
  static getBootstrap() {
    return bootstrap;
  }
} 
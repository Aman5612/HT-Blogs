import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Define the bootstrap function
const bootstrap = async () => {
  try {
    // Bootstrap the application with server-side rendering config
    return await bootstrapApplication(AppComponent, config);
  } catch (error) {
    console.error('Bootstrap error:', error);
    throw error;
  }
};

// Export the bootstrap function as default export
export default bootstrap;

// Also provide a named export for direct use
export { bootstrap };
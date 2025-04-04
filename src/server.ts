import {
  isMainModule
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Request, Response } from 'express';
import * as fs from 'fs';

// Create server app
const app = express();

// Get paths
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Find JS and CSS files in the browser directory
let mainJsFile = '';
let polyfillsJsFile = '';
let stylesFile = '';
let chunkFiles: string[] = [];

try {
  // Read directory and find the main files
  const files = fs.readdirSync(browserDistFolder);
  
  mainJsFile = files.find(file => file.startsWith('main-') && file.endsWith('.js')) || 'main.js';
  polyfillsJsFile = files.find(file => file.startsWith('polyfills-') && file.endsWith('.js')) || 'polyfills.js';
  stylesFile = files.find(file => file.startsWith('styles-') && file.endsWith('.css')) || 'styles.css';
  
  // Also find any chunk files
  chunkFiles = files.filter(file => file.startsWith('chunk-') && file.endsWith('.js'));
  
  console.log(`Found main JS file: ${mainJsFile}`);
  console.log(`Found polyfills JS file: ${polyfillsJsFile}`);
  console.log(`Found styles file: ${stylesFile}`);
  console.log(`Found ${chunkFiles.length} chunk files`);
} catch (error) {
  console.error('Error finding JS/CSS files:', error);
  // Use defaults if an error occurs
  mainJsFile = 'main.js';
  polyfillsJsFile = 'polyfills.js';
  stylesFile = 'styles.css';
}

// Create a basic HTML template with proper SEO tags
const createHtmlTemplate = (req: Request) => {
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const isBlogPost = req.originalUrl.includes('/blog/');
  
  // Set default meta values
  let title = 'HTBlogs - Travel and Lifestyle Blog';
  let description = 'Explore our collection of travel guides, luxury experiences, and lifestyle tips from around the world. Discover new destinations and plan your next adventure.';
  let ogType = 'website';
  let ogImage = `${req.protocol}://${req.get('host')}/assets/default-image.jpg`;
  
  // For blog posts (You could enhance this with actual blog data if needed)
  if (isBlogPost) {
    title = 'The Ultimate Guide to Luxury Experiences in Qatar | Exclusive Travel Tips';
    description = 'Discover the finest luxury experiences in Qatar, from opulent hotels and Michelin-star dining to private desert safaris and VIP shopping. Plan your lavish getaway today!';
    ogType = 'article';
    ogImage = 'https://d12g53icgxmb2x.cloudfront.net/1743137895789-w=2160 (6).avif';
  }
  
  // Create chunk script tags
  const chunkScripts = chunkFiles.map(chunk => 
    `<script src="${chunk}" type="module"></script>`
  ).join('\n    ');
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="travel, luxury, lifestyle, blog, vacation, destination, experience, adventure">
    <link rel="canonical" href="${url}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:alt" content="HTBlogs image">
    <meta property="og:site_name" content="HTBlogs">
    <meta property="og:locale" content="en_US">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImage}">
    
    <!-- Fix for ES modules -->
    <script type="module">
      // This helps resolve ES module imports
      window.global = window;
      window.process = { env: { NODE_ENV: 'production' } };
      window.__dirname = '/';
    </script>
    
    <!-- Load CSS -->
    <link rel="stylesheet" href="${stylesFile}">
    
    <!-- Load chunk files first -->
    ${chunkScripts}
    
    <!-- Load main JS files -->
    <script src="${polyfillsJsFile}" type="module"></script>
    <script src="${mainJsFile}" type="module"></script>
  </head>
  <body>
    <app-root>Loading...</app-root>
  </body>
</html>`;
};

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by serving dynamic index.html with SEO tags
 */
app.use('/**', (req, res) => {
  console.log(`Serving request for ${req.originalUrl}`);
  const html = createHtmlTemplate(req);
  res.send(html);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = (req: Request, res: Response) => {
  console.log(`Handling request for ${req.originalUrl}`);
  app(req, res);
};

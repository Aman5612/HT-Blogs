import {
  isMainModule
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Request, Response } from 'express';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { environment } from './environments/environment';

// Define interface for blog post data
interface BlogPostData {
  id: string;
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  featureImage?: string;
  tags?: string[];
  publishedDate?: string;
  updatedAt?: string;
  author?: string;
}

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

// Mock API for testing
app.get('/api/posts/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Serving mock blog data for ID: ${id}`);
  // Return mock blog data
  res.json({
    id,
    title: `[MOCK] Blog Post`,
    metaTitle: `[MOCK] Sample Blog Post | Development Environment`,
    metaDescription: `This is mock data for development and testing purposes. This should be replaced with real API data in production.`,
    featureImage: `https://picsum.photos/800/600?random=${id}`,
    tags: ['mock', 'development', 'testing'],
    publishedDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'Mock System',
    content: '<h1>Mock Content</h1><p>This is sample content from the mock API used for development.</p>'
  });
});

// Add a test route to check if environment is available
app.get('/api/check-environment', (req, res) => {
  res.json({
    apiUrl: environment.apiUrl,
    hasApiUrl: !!environment.apiUrl,
    hasFallbackUrl: !!environment.fallbackApiUrl,
    env: process.env['NODE_ENV']
  });
});

// Helper function to fetch blog post data from API (fallback only)
async function fetchBlogPost(id: string): Promise<BlogPostData | null> {
  console.log(`[FALLBACK] Attempting emergency fallback for blog ID: ${id}`);
  
  // Last resort fallback data
  return {
    id,
    title: `[FALLBACK] Emergency Content`,
    metaTitle: `[FALLBACK] Emergency Content | Error Recovery`,
    metaDescription: 'This is fallback content when all API calls fail completely',
    tags: ['fallback', 'emergency', 'content'],
    publishedDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: 'System'
  };
}

// Create a basic HTML template with proper SEO tags
const createHtmlTemplate = async (req: Request) => {
  console.log(`===== REQUEST: ${req.originalUrl} =====`);
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
  // Fix: Get path from originalUrl if path is not available or empty
  const urlPath = req.originalUrl || '/';
  console.log(`Request originalUrl: "${req.originalUrl}"`);
  console.log(`Request path (from req.path): "${req.path}"`);
  console.log(`Using path for processing: "${urlPath}"`);
  
  // Check for blog post URLs with multiple patterns
  const directBlogMatch = urlPath.match(/\/blog\/([^\/]+)/) || 
                         urlPath.match(/\/blogs\/([^\/]+)/) || 
                         urlPath.match(/\/post\/([^\/]+)/);
  
  // If we're at the root path, check if this might be a hash-based URL
  const isRootPath = urlPath === '/' || urlPath === '';
  console.log(`Is root path (potential hash-based URL): ${isRootPath}`);

  // Set default meta values (will be overridden for blog posts)
  let title = 'HTBlogs - Travel and Lifestyle Blog';
  let description = 'Explore our collection of travel guides, luxury experiences, and lifestyle tips from around the world. Discover new destinations and plan your next adventure.';
  let ogType = 'website';
  let ogImage = `${req.protocol}://${req.get('host')}/assets/default-image.jpg`;
  let keywords = 'travel, luxury, lifestyle, blog, vacation, destination, experience, adventure';
  let structuredData = null;
  
  // For direct blog post URLs
  if (directBlogMatch && directBlogMatch[1]) {
    const blogId = directBlogMatch[1];
    console.log(`👉 Detected direct blog post request with ID: "${blogId}"`);
    await fetchAndProcessBlogData(blogId);
  } 
  // At root path, we'll include meta for recent blog posts or default content
  // Hash-based routes (#/blog/ID) will need client-side handling for SEO
  else if (isRootPath) {
    console.log('Root path detected - Adding default or recent blog metadata');
    
    // Option: Pre-fetch most recent blog post for the root path
    // This would give better SEO for the site's landing page
    try {
      if (environment.apiUrl) {
        console.log('Attempting to fetch recent blog post data for root path');
        const recentPostsUrl = `${environment.apiUrl}/posts?limit=1`;
        
        try {
          const response = await fetch(recentPostsUrl);
          if (response.ok) {
            const posts = await response.json() as BlogPostData[];
            if (posts && Array.isArray(posts) && posts.length > 0) {
              const recentPost = posts[0] as BlogPostData;
              console.log(`Using recent blog post for root SEO: ${recentPost.title || 'Untitled'}`);
              
              // Set improved default metadata from recent post
              title = 'HTBlogs - Travel and Lifestyle Blog | Latest Articles';
              description = `Read our latest article: ${recentPost.title}. ${recentPost.metaDescription || description}`;
              if (recentPost.featureImage) {
                ogImage = recentPost.featureImage;
              }
              if (recentPost.tags && Array.isArray(recentPost.tags) && recentPost.tags.length) {
                keywords = recentPost.tags.join(', ') + ', ' + keywords;
              }
            }
          }
        } catch (error) {
          console.log('Error fetching recent posts:', error);
        }
      }
    } catch (error) {
      console.error('Error processing root path metadata:', error);
    }
  } else {
    console.log('Not a blog post URL (regular page)');
  }
  
  // Helper function to fetch and process blog data
  async function fetchAndProcessBlogData(blogId: string): Promise<void> {
    try {
      // First try the real external API directly
      console.log(`Trying to fetch real blog data for ID: ${blogId}`);
      let blogData: BlogPostData | null = null;
      
      if (environment.apiUrl) {
        try {
          const apiUrl = `${environment.apiUrl}/posts/${blogId}`;
          console.log(`Fetching from real API: ${apiUrl}`);
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            blogData = await response.json() as BlogPostData;
            console.log('Successfully fetched from real external API');
            console.log('API returned data with title:', blogData.title);
            console.log('API returned data with metaTitle:', blogData.metaTitle);
          } else {
            console.log(`External API returned ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.log('External API error:', apiError);
        }
      }
      
      // If real API failed, fall back to mock API
      if (!blogData) {
        console.log('Real API failed or not available, falling back to mock API');
        // Try to get data from our mock API
        const mockUrl = `http://localhost:${process.env['PORT'] || 4000}/api/posts/${blogId}`;
        console.log(`Mock API URL: ${mockUrl}`);
        
        try {
          const response = await fetch(mockUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            blogData = await response.json() as BlogPostData;
            console.log('Successfully fetched from mock API');
          } else {
            console.log(`Mock API returned ${response.status}: ${response.statusText}`);
          }
        } catch (localError) {
          console.log('Mock API error:', localError);
        }
        
        // If both real API and mock API failed, use emergency fallback
        if (!blogData) {
          console.log('Both real API and mock API failed, using emergency fallback');
          blogData = await fetchBlogPost(blogId);
        }
      }
      
      if (blogData) {
        console.log(`👍 Using blog data for SEO: "${blogData.title || 'No title'}"`);
        // Override default values with blog-specific data
        title = blogData.metaTitle || blogData.title || title;
        description = blogData.metaDescription || description;
        ogType = 'article';
        ogImage = blogData.featureImage || ogImage;
        keywords = blogData.tags ? blogData.tags.join(', ') : keywords;
        
        console.log(`Title set to: "${title}"`);
        console.log(`Description set to: "${description.substring(0, 50)}..."`);
        
        // Create structured data for rich results
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': title,
          'description': description,
          'image': ogImage,
          'datePublished': blogData.publishedDate || new Date().toISOString(),
          'dateModified': blogData.updatedAt || new Date().toISOString(),
          'author': {
            '@type': 'Person',
            'name': blogData.author || 'HTBlogs Team'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'HTBlogs',
            'logo': {
              '@type': 'ImageObject',
              'url': `${req.protocol}://${req.get('host')}/assets/logo.png`
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': url
          }
        };
      } else {
        console.log('❌ No blog data was returned from API');
      }
    } catch (error) {
      console.error('Error in blog data processing:', error);
    }
  }
  
  // Create chunk script tags
  const chunkScripts = chunkFiles.map(chunk => 
    `<script src="${chunk}" type="module"></script>`
  ).join('\n    ');
  
  // Create structured data script tag if data exists
  const structuredDataScript = structuredData ? 
    `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : '';
  
  // Add special script for hash-based routing to update metadata dynamically on the client side
  const hashRoutingScript = `
    <script type="text/javascript">
      (function() {
        // Function to dynamically update page metadata based on hash changes
        function updateMetadataForHashRoute() {
          // Check if the hash contains a blog route
          const hash = window.location.hash;
          const blogMatch = hash.match(/#\\/blog\\/([^/]+)/);
          
          if (blogMatch && blogMatch[1]) {
            const blogId = blogMatch[1];
            console.log('Hash changed to blog post:', blogId);
            
            // The SSR meta tags will be replaced by Angular when it loads
            // This is just a fallback to handle direct navigation with hash
            // For proper SEO, use non-hash routes
          }
        }
        
        // Listen for hash changes
        window.addEventListener('hashchange', updateMetadataForHashRoute);
        
        // Check on initial load
        window.addEventListener('DOMContentLoaded', updateMetadataForHashRoute);
      })();
    </script>
  `;
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <base href="/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="${keywords}">
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
    
    ${structuredDataScript}
    
    <!-- Hash-based routing helpers -->
    ${hashRoutingScript}
    
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
app.use('/**', async (req, res) => {
  console.log(`Serving request for ${req.originalUrl}`);
  try {
    const html = await createHtmlTemplate(req);
    res.send(html);
  } catch (error) {
    console.error('Error generating HTML template:', error);
    res.status(500).send('Server error');
  }
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  // Find port from command line arguments
  let port = 4000; // Default port
  
  // Check command line arguments for --port=XXXX
  const args = process.argv.slice(2);
  for (const arg of args) {
    const portMatch = arg.match(/--port[=:](\d+)/);
    if (portMatch && portMatch[1]) {
      port = parseInt(portMatch[1], 10);
      break;
    }
  }
  
  // Or use environment variable
  port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : port;
  
  console.log(`Attempting to start server on port ${port}`);
  
  // Create server with error handling
  const server = app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
  
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Trying port ${port + 1}`);
      // Try next port
      server.close();
      app.listen(port + 1, () => {
        console.log(`Node Express server listening on http://localhost:${port + 1}`);
      });
    } else {
      console.error('Server error:', error);
    }
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = (req: Request, res: Response) => {
  console.log(`Handling request for ${req.originalUrl}`);
  app(req, res);
};
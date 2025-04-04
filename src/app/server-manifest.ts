// This is a placeholder for the server application manifest
// Angular Universal (SSR) will replace this file with the actual manifest during build
// The manifest contains information about the server routes and assets

export const serverManifest = {
  routes: [
    {
      path: 'blog/:id',
      component: 'BlogDetailComponent',
      data: { renderMode: 'server' }
    },
    {
      path: 'blog',
      component: 'BlogListComponent',
      data: { renderMode: 'prerender' }
    },
    {
      path: '**',
      data: { renderMode: 'prerender' }
    }
  ],
  assets: {
    'index.server.html': '<!-- server template -->'
  }
}; 
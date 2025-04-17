import { Routes } from '@angular/router';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';

import { RenderMode, ServerRoute } from '@angular/ssr';
import { BlogListComponent } from './components/blog-list/blog-list.component';

export const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
  },
  {
    path: ':id',
    component: BlogDetailComponent,
  },
];

export const serverRoutes: ServerRoute[] = [
  {
    path: ':id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

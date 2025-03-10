import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { BlogService, BlogPost } from '../../services/blog.service';
import { Observable, switchMap, map } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TripPlannerComponent } from '../trip-planner/trip-planner.component';
import { MainContentComponent } from '../main-content/main-content.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    DatePipe,
    SidebarComponent,
    TripPlannerComponent,
    MainContentComponent,
  ],
  templateUrl: './blog-detail.component.html',
  styles: [
    `
      main {
        display: flex;
        min-height: 100vh;
        margin-top: 48px;
        padding: 0 16px;
        gap: 24px;
      }

      ::ng-deep app-sidebar {
        position: sticky;
        top: 48px;
        height: calc(100vh - 48px);
        overflow-y: auto;
        width: 22%;
      }

      ::ng-deep app-main-content {
        flex: 1;
        overflow-y: auto;
      }

      ::ng-deep app-trip-planner {
        width: 28%;
      }
    `,
  ],
})
export class BlogDetailComponent implements OnInit {
  blog$!: Observable<BlogPost>;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    // Keep the service call but don't transform the data since we're using dummy components
    this.blog$ = this.route.params.pipe(
      switchMap((params) => this.blogService.getPost(params['id']))
    );
  }
}

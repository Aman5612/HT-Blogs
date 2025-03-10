import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { BlogService, BlogPost } from '../../services/blog.service';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe],
  template: `
    // <div class="blog-detail" *ngIf="blog$ | async as blog">
    //   <h1>{{ blog.title }}</h1>
    //   <div class="metadata">
    //     <span class="status">Status: {{ blog.status }}</span>
    //     <span>Created: {{ blog.createdAt | date:'mediumDate' }}</span>
    //     <span *ngIf="blog.updatedAt">Updated: {{ blog.updatedAt | date:'mediumDate' }}</span>
    //   </div>
    //   <div class="content" [innerHTML]="blog.content"></div>
    //   <div *ngIf="blog.excerpt" class="excerpt">
    //     <h3>Excerpt</h3>
    //     <p>{{ blog.excerpt }}</p>
    //   </div>
    // </div>
  `,
  styles: [`
    .blog-detail {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .metadata {
      color: #666;
      margin: 1rem 0;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.9rem;
    }
    .status {
      text-transform: uppercase;
      font-weight: 500;
    }
    .content {
      margin: 2rem 0;
      line-height: 1.6;
      font-size: 1.1rem;
    }
    .excerpt {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
      h3 {
        color: #666;
        font-size: 1.2rem;
        margin-bottom: 1rem;
      }
      p {
        color: #444;
        font-style: italic;
      }
    }
  `]
})
export class BlogDetailComponent implements OnInit {
  blog$!: Observable<BlogPost>;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {}

  ngOnInit() {
    this.blog$ = this.route.params.pipe(
      switchMap(params => this.blogService.getPost(params['id']))
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Article } from '../../interface/article.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="blog-list">
      <h2>Latest Blog Posts</h2>
      
      @if (posts$ | async; as posts) {
        <div class="posts-grid">
          @for (post of posts; track post.id) {
            <div class="post-card" [routerLink]="['/blog', post.id]" role="link" tabindex="0">
              <div class="post-image" [class.no-image]="!post.media?.[0]?.url && !post.featuredImage">
                @if (post.media?.[0]?.url || post.featuredImage) {
                  <img 
                    [src]="post.media[0]?.url || post.featuredImage" 
                    [alt]="post.title"
                  >
                }
              </div>
              <div class="post-content">
                <h3>{{ post.title }}</h3>
                <div class="post-meta">
                  <span class="date">{{ post.createdAt | date:'mediumDate' }}</span>
                  <span class="status" [class.draft]="post.status === 'draft'">
                    {{ post.status }}
                  </span>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="loading">
          Loading posts...
        </div>
      }
    </div>
  `,
  styles: [`
    .blog-list {
      padding: 2rem;
    }

    h2 {
      margin-bottom: 2rem;
      font-size: 2rem;
      color: #333;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .post-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      cursor: pointer;
      outline: none;

      &:hover, &:focus {
        transform: translateY(-4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(-2px);
      }
    }

    .post-image {
      height: 200px;
      background: #f5f5f5;
      position: relative;

      &.no-image {
        display: flex;
        align-items: center;
        justify-content: center;

        &::after {
          content: '📷';
          font-size: 2rem;
          color: #ccc;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .post-content {
      padding: 1.5rem;

      h3 {
        margin: 0 0 1rem;
        font-size: 1.25rem;
        color: #333;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .post-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #666;

      .status {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background: #e8f5e9;
        color: #2e7d32;

        &.draft {
          background: #fff3e0;
          color: #e65100;
        }
      }
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .blog-list {
        padding: 1rem;
      }

      .posts-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .post-image {
        height: 150px;
      }

      .post-content {
        padding: 1rem;

        h3 {
          font-size: 1.1rem;
        }
      }
    }
  `]
})
export class BlogListComponent implements OnInit {
  posts$: Observable<Article[]>;

  constructor(private blogService: BlogService) {
    this.posts$ = this.blogService.getAllPosts();
  }

  ngOnInit() {}
}

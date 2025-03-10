import { Component, OnInit } from '@angular/core';
import { NgFor, DatePipe, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService, BlogListItem } from '../../services/blog.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [NgFor, RouterLink, DatePipe, AsyncPipe],
  template: `
    <div class="blog-list">
      <h2>Latest Blog Posts</h2>
      <div class="blog-grid">
        <div *ngFor="let post of posts$ | async" class="blog-item">
          <h3>{{ post.title }}</h3>
          <div class="metadata">
            <span class="status">Status: {{ post.status }}</span>
            <span class="date">Created: {{ post.createdAt | date:'mediumDate' }}</span>
          </div>
          <a [routerLink]="['/blog', post.id]" class="read-more">Read More</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blog-list {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    .blog-item {
      padding: 1.5rem;
      border: 1px solid #eee;
      border-radius: 8px;
      transition: transform 0.2s;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    }
    .metadata {
      margin: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }
    .status {
      text-transform: uppercase;
      font-weight: 500;
    }
    .read-more {
      display: inline-block;
      color: #007bff;
      text-decoration: none;
      margin-top: 1rem;
      font-weight: 500;
      &:hover {
        text-decoration: underline;
      }
    }
  `]
})
export class BlogListComponent implements OnInit {
  posts$!: Observable<BlogListItem[]>;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.posts$ = this.blogService.getAllPosts();
  }
}

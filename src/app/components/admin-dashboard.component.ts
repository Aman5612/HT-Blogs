// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogService, BlogPost } from '../services/blog.service';
import { BlogListComponent } from './blog-list.component';
import { BlogEditorComponent } from './blog-editor.component';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard">
      <nav class="sidebar">
        <ul>
          <li><a (click)="currentView = 'posts'">Posts</a></li>
          <li><a (click)="currentView = 'new'">New Post</a></li>
        </ul>
      </nav>

      <main class="content">
        <ng-container [ngSwitch]="currentView">
          <app-blog-list
            *ngSwitchCase="'posts'"
            [posts]="posts"
            (editPost)="onEditPost($event)"
            (deletePost)="onDeletePost($event)"
          >
          </app-blog-list>

          <app-blog-editor *ngSwitchCase="'new'" (save)="onSavePost($event)">
          </app-blog-editor>
        </ng-container>
      </main>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, BlogListComponent, BlogEditorComponent],
})
export class AdminDashboardComponent implements OnInit {
  currentView = 'posts';
  posts: BlogPost[] = [];

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.blogService.getAllPosts().subscribe(
      (posts) => (this.posts = posts),
      (error) => console.error('Error loading posts:', error)
    );
  }

  onSavePost(post: BlogPost) {
    this.blogService.createPost(post).subscribe(
      (savedPost) => {
        this.posts = [...this.posts, savedPost];
        this.currentView = 'posts';
      },
      (error) => console.error('Error saving post:', error)
    );
  }

  onEditPost(post: BlogPost) {
    // Handle edit post
    console.log('Editing post:', post);
  }

  onDeletePost(postId: string) {
    this.blogService.deletePost(postId).subscribe(
      () => {
        this.posts = this.posts.filter((p) => p._id !== postId);
      },
      (error) => console.error('Error deleting post:', error)
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Article } from '../../interface/article.interface';

@Component({
  selector: 'app-most-read-articles',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './most-read-articles.component.html',
  styleUrls: ['./most-read-articles.component.scss']
})
export class MostReadArticlesComponent implements OnInit {
  mostReadArticles: Article[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.isLoading = true;
    this.error = null;
    
    this.blogService.getMostReadArticles().subscribe({
      next: (articles) => {
        this.mostReadArticles = articles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching most read articles:', error);
        this.error = 'Failed to load articles. Please try again later.';
        this.isLoading = false;
        this.mostReadArticles = [];
      }
    });
  }

  onArticleClick(article: Article) {
    this.router.navigate(['/blog', article.id]);
  }

  onKeyPress(event: KeyboardEvent, article: Article) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onArticleClick(article);
    }
  }

  retryLoad() {
    this.loadArticles();
  }
}

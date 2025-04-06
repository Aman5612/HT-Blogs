import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  CommonModule,
  DatePipe,
  isPlatformBrowser,
  LocationStrategy,
  HashLocationStrategy,
} from '@angular/common';
import { Router } from '@angular/router';
import { NewBlogService } from '../../services/new-blog.service';
import { Article } from '../../interface/article.interface';

@Component({
  selector: 'app-most-read-articles',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './most-read-articles.component.html',
  styleUrls: ['./most-read-articles.component.scss'],
})
export class MostReadArticlesComponent implements OnInit, OnChanges {
  @Input() relatedBlogs?: any[];

  mostReadArticles: Article[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private blogService: NewBlogService,
    private router: Router,
    private locationStrategy: LocationStrategy,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.updateArticles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['relatedBlogs']) {
      console.log('Related blogs changed:', this.relatedBlogs);
      console.log('Related blogs is array?', Array.isArray(this.relatedBlogs));
      console.log('Related blogs length:', this.relatedBlogs?.length);
      console.log('Related blogs type:', typeof this.relatedBlogs);
      this.updateArticles();
    }
  }

  private updateArticles() {
    // If relatedBlogs is provided, use those instead of fetching from service
    if (
      this.relatedBlogs &&
      Array.isArray(this.relatedBlogs) &&
      this.relatedBlogs.length > 0
    ) {
      console.log('Using related blogs:', this.relatedBlogs);

      // Convert relatedBlogs to Article format
      this.mostReadArticles = this.relatedBlogs.map((blog) => {
        return {
          id: blog.id,
          title: blog.title,
          content: blog.content,
          status: blog.status || 'PUBLISHED',
          createdAt: blog.createdAt || new Date().toISOString(),
          updatedAt: blog.updatedAt || new Date().toISOString(),
          media: [],
          featureImage: blog.featureImage || '',
          excerpt: blog.excerpt || '',
          author: blog.author,
        } as Article;
      });

      this.isLoading = false;
    } else {
      console.log(
        'No related blogs found or invalid format, loading most read articles instead'
      );
      this.loadArticles();
    }
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
      },
    });
  }

  onArticleClick(event: Event, article: Article) {
    // Check if we're using HashLocationStrategy
    event.preventDefault();
    this.router.navigate(['/blog', article.id]);
  }

  onKeyPress(event: KeyboardEvent, article: Article) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onArticleClick(event, article);
    }
  }

  retryLoad() {
    this.loadArticles();
  }
}

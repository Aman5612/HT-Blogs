import { Component, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, map, of, shareReplay, tap, Subject, takeUntil } from 'rxjs';
import { BlogService, BlogPost } from '../../services/blog.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainContentComponent } from '../main-content/main-content.component';
import { TripPlannerComponent } from '../trip-planner/trip-planner.component';
import { MostReadArticlesComponent } from '../most-read-articles/most-read-articles.component';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SidebarComponent,
    MainContentComponent,
    TripPlannerComponent,
    MostReadArticlesComponent
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BlogDetailComponent implements AfterViewInit, OnDestroy {
  blogData$: Observable<BlogPost | null>;
  error: string | null = null;
  private currentHighlight: HTMLElement | null = null;
  private observer: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>();
  private contentLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private titleService: Title,
    private metaService: Meta
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Blog post ID not found.';
      this.blogData$ = of(null);
    } else {
      this.blogData$ = this.blogService.getPost(id).pipe(
        tap(blog => {
          if (!blog) {
            this.error = 'Blog post not found.';
          } else {
            this.contentLoaded = true;
            // Set meta title and description
            this.updateMetadata(blog);
            // Initialize observer after content is loaded
            setTimeout(() => this.initializeObserver(), 300);
          }
        }),
        catchError(error => {
          console.error('Error fetching blog post:', error);
          this.error = 'Failed to load blog post. Please try again later.';
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        takeUntil(this.destroy$)
      );
    }
  }

  private updateMetadata(blog: BlogPost): void {
    // Set document title
    if (blog.metaTitle) {
      this.titleService.setTitle(blog.metaTitle);
    } else {
      this.titleService.setTitle(blog.title);
    }

    // Set meta description
    if (blog.metaDescription) {
      this.metaService.updateTag({ name: 'description', content: blog.metaDescription });
    }
  }

  ngAfterViewInit() {
    // Wait for content to be loaded before initializing observer
    if (this.contentLoaded) {
      this.initializeObserver();
    }
  }

  scrollToSection(sectionId: string) {
    requestAnimationFrame(() => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      // Remove previous highlight
      if (this.currentHighlight) {
        this.currentHighlight.classList.remove('highlight-section');
      }

      // Calculate scroll position
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      // Smooth scroll to section
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Add highlight effect
      element.classList.add('highlight-section');
      this.currentHighlight = element;

      // Remove highlight after animation
      setTimeout(() => {
        if (this.currentHighlight === element) {
          element.classList.remove('highlight-section');
          this.currentHighlight = null;
        }
      }, 2000);
    });
  }

  private initializeObserver() {
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Create new observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            const id = entry.target.id;
            if (id) {
              // Update sidebar selection
              window.dispatchEvent(new CustomEvent('section-visible', {
                detail: { sectionId: id }
              }));
            }
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: [0, 0.1, 0.5, 1]
      }
    );

    // Observe all section headings and marked paragraphs
    requestAnimationFrame(() => {
      // Find headings
      const headings = document.querySelectorAll('h1[id], h2[id], h3[id]');
      headings.forEach(heading => {
        if (heading.id) {
          this.observer?.observe(heading);
        }
      });

      // Find paragraphs with IDs (these contain bold text sections)
      const paragraphs = document.querySelectorAll('p[id]');
      paragraphs.forEach(paragraph => {
        if (paragraph.id) {
          this.observer?.observe(paragraph);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}

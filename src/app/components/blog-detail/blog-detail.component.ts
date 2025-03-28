import { Component, ViewEncapsulation, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, map, of, shareReplay, tap, Subject, takeUntil, firstValueFrom } from 'rxjs';
import { BlogService, BlogPost } from '../../services/blog.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainContentComponent } from '../main-content/main-content.component';
import { TripPlannerComponent } from '../trip-planner/trip-planner.component';
import { MostReadArticlesComponent } from '../most-read-articles/most-read-articles.component';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

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
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
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
      
      if (typeof window === 'undefined') {
        firstValueFrom(this.blogData$).catch(err => {
          console.error('Error pre-fetching blog data for SSR:', err);
        });
      }
    }
  }

  private updateMetadata(blog: BlogPost): void {
    // Set document title
    if (blog.metaTitle) {
      this.titleService.setTitle(blog.metaTitle);
    } else {
      this.titleService.setTitle(blog.title);
    }

    // Clear any previous meta tags
    this.metaService.removeTag('name="description"');
    this.metaService.removeTag('property="og:title"');
    this.metaService.removeTag('property="og:description"');
    this.metaService.removeTag('property="og:url"');
    this.metaService.removeTag('property="og:image"');

    // Basic meta description
    if (blog.metaDescription) {
      this.metaService.addTag({ name: 'description', content: blog.metaDescription });
    }

    // Open Graph Protocol tags for better social media sharing
    if (blog.metaTitle) {
      this.metaService.addTag({ property: 'og:title', content: blog.metaTitle });
    } else {
      this.metaService.addTag({ property: 'og:title', content: blog.title });
    }

    if (blog.metaDescription) {
      this.metaService.addTag({ property: 'og:description', content: blog.metaDescription });
    }

    // Current URL - Safe for SSR
    const url = this.document.location.href;
    this.metaService.addTag({ property: 'og:url', content: url });

    // Image if available
    if (blog.imageUrl) {
      this.metaService.addTag({ property: 'og:image', content: blog.imageUrl });
    }

    // Content type
    this.metaService.addTag({ property: 'og:type', content: 'article' });
  }

  ngAfterViewInit() {
    // Wait for content to be loaded before initializing observer
    if (this.contentLoaded) {
      this.initializeObserver();
    }
  }

  scrollToSection(sectionId: string) {
    console.log('BlogDetail: Scrolling to section:', sectionId);
    
    // Ensure execution in browser context only (to avoid SSR issues)
    if (typeof window === 'undefined') {
      console.log('BlogDetail: Not in browser context, skipping scroll');
      return;
    }
    
    requestAnimationFrame(() => {
      // Find the element in the DOM
      const element = document.getElementById(sectionId);
      if (!element) {
        console.warn(`BlogDetail: Element with ID ${sectionId} not found`);
        return;
      }

      console.log(`BlogDetail: Found element for section ${sectionId}:`, element);

      // Remove previous highlight
      if (this.currentHighlight) {
        this.currentHighlight.classList.remove('highlight-section');
      }

      // Calculate scroll position
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      console.log(`BlogDetail: Scrolling to position: ${offsetPosition}`);

      // Ensure element is visible using scrollIntoView
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Adjust scroll position to account for header
      setTimeout(() => {
        window.scrollBy({
          top: -headerOffset,
          behavior: 'smooth'
        });
      }, 100);

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
      // Find all headings with IDs
      const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      headings.forEach(heading => {
        if (heading.id) {
          this.observer?.observe(heading);
        }
      });

      // Find paragraphs with IDs (these contain bold text sections or are otherwise important)
      const paragraphs = document.querySelectorAll('p[id]');
      paragraphs.forEach(paragraph => {
        if (paragraph.id) {
          this.observer?.observe(paragraph);
        }
      });

      // Find lists with IDs
      const lists = document.querySelectorAll('ul[id], ol[id]');
      lists.forEach(list => {
        if (list.id) {
          this.observer?.observe(list);
        }
      });

      // Find blockquotes with IDs
      const quotes = document.querySelectorAll('blockquote[id]');
      quotes.forEach(quote => {
        if (quote.id) {
          this.observer?.observe(quote);
        }
      });

      // Find any other elements with IDs that might represent sections
      const otherSections = document.querySelectorAll('div[id^="section-"], div[id^="list-section-"], div[id^="quote-"]');
      otherSections.forEach(section => {
        if (section.id) {
          this.observer?.observe(section);
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

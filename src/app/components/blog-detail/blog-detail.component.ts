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
    this.metaService.removeTag('property="og:type"');
    this.metaService.removeTag('name="twitter:card"');
    this.metaService.removeTag('name="twitter:title"');
    this.metaService.removeTag('name="twitter:description"');
    this.metaService.removeTag('name="twitter:image"');
    this.metaService.removeTag('name="keywords"');
    this.metaService.removeTag('name="author"');

    // Basic meta description
    if (blog.metaDescription) {
      this.metaService.addTag({ name: 'description', content: blog.metaDescription });
    }

    // Add keywords based on tags if available
    if (blog.tags && blog.tags.length > 0) {
      this.metaService.addTag({ name: 'keywords', content: blog.tags.join(', ') });
    }

    // Add author
    if (blog.author) {
      this.metaService.addTag({ name: 'author', content: blog.author });
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
    
    // Twitter Card
    this.metaService.addTag({ name: 'twitter:card', content: 'summary_large_image' });
    
    if (blog.metaTitle) {
      this.metaService.addTag({ name: 'twitter:title', content: blog.metaTitle });
    } else {
      this.metaService.addTag({ name: 'twitter:title', content: blog.title });
    }
    
    if (blog.metaDescription) {
      this.metaService.addTag({ name: 'twitter:description', content: blog.metaDescription });
    }
    
    if (blog.imageUrl) {
      this.metaService.addTag({ name: 'twitter:image', content: blog.imageUrl });
    }

    // Canonical URL
    let linkCanonical = this.document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = this.document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', url);
    
    // Add structured data (JSON-LD) for blog post
    this.addStructuredData(blog);
  }
  
  private addStructuredData(blog: BlogPost): void {
    // Remove any existing structured data
    const existingScript = this.document.getElementById('blogPostStructuredData');
    if (existingScript) {
      existingScript.remove();
    }
    
    const publishDate = blog.date || new Date().toISOString();
    const baseUrl = this.document.location.origin;
    
    // Create structured data for the blog article
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': blog.metaTitle || blog.title,
      'description': blog.metaDescription || '',
      'image': blog.imageUrl|| `${baseUrl}/assets/default-image.jpg`,
      'datePublished': publishDate,
      'dateModified': publishDate,
      'author': {
        '@type': 'Person',
        'name': blog.author || 'HTBlogs Team'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'HTBlogs',
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/assets/logo.png`
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': this.document.location.href
      }
    };
    
    // Create script element and add to document
    const script = this.document.createElement('script');
    script.id = 'blogPostStructuredData';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }

  ngAfterViewInit() {
    // Wait for content to be loaded before initializing observer
    if (this.contentLoaded) {
      this.initializeObserver();
      this.ensureHeadingsHaveIds();
    }
  }

  private ensureHeadingsHaveIds() {
    // This function ensures all headings have proper IDs for navigation
    setTimeout(() => {
      const contentContainer = document.querySelector('.main-content-wrapper');
      if (!contentContainer) {
        console.warn('Could not find main-content-wrapper for adding heading IDs');
        return;
      }
      
      // Check if there's content inside MainContentComponent
      const mainContent = contentContainer.querySelector('.article-content');
      const targetElement = mainContent || contentContainer;
      
      console.log('Looking for headings in:', targetElement);
      const headings = targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      console.log(`Found ${headings.length} headings in content`);
      
      headings.forEach((heading, index) => {
        const element = heading as HTMLElement;
        
        // If heading doesn't have an ID, generate one
        if (!element.id) {
          const text = element.textContent?.trim() || `section-${index}`;
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 50);
            
          element.id = id;
          console.log(`Added ID to heading: ${id}`);
          
          // If the observer exists, observe this element
          if (this.observer) {
            this.observer.observe(element);
          }
        } else {
          console.log(`Heading already has ID: ${element.id}`);
        }
      });
    }, 500);
  }

  scrollToSection(sectionId: string) {
    console.log('BlogDetail: Scrolling to section:', sectionId);
    
    // Ensure execution in browser context only (to avoid SSR issues)
    if (typeof window === 'undefined') {
      console.log('BlogDetail: Not in browser context, skipping scroll');
      return;
    }

    // First try direct approach with document.getElementById
    const directElement = document.getElementById(sectionId);
    
    if (directElement) {
      console.log(`BlogDetail: Found element directly with ID: ${sectionId}`);
      this.scrollToElement(directElement);
      return;
    }

    // If direct approach fails, search within the content wrapper
    const contentWrapper = document.querySelector('.main-content-wrapper');
    if (contentWrapper) {
      console.log('BlogDetail: Searching within main-content-wrapper');
      
      // Get full HTML content for debugging
      const contentHtml = contentWrapper.innerHTML;
      console.log('Content HTML excerpt:', contentHtml.substring(0, 500) + '...');
      
      // Try to find element by ID attribute
      const match = contentHtml.includes(`id="${sectionId}"`);
      console.log(`Does content contain element with id="${sectionId}"? ${match}`);
      
      // Try some alternative approaches
      const contentElement = contentWrapper.querySelector(`[id="${sectionId}"]`);
      if (contentElement) {
        console.log(`BlogDetail: Found element in content wrapper with ID: ${sectionId}`);
        this.scrollToElement(contentElement as HTMLElement);
        return;
      }
      
      // Try finding elements with the text content similar to the ID
      const normalizedId = sectionId.replace(/-/g, ' ').toLowerCase();
      console.log(`BlogDetail: Looking for elements with text content matching: ${normalizedId}`);
      
      const headings = contentWrapper.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLElement;
        const headingText = heading.textContent?.toLowerCase() || '';
        
        if (headingText.includes(normalizedId) || normalizedId.includes(headingText)) {
          console.log(`BlogDetail: Found heading with matching text: "${headingText}"`);
          
          // Assign ID to the element if it doesn't have one
          if (!heading.id) {
            heading.id = sectionId;
            console.log(`BlogDetail: Assigned ID ${sectionId} to heading`);
          }
          
          this.scrollToElement(heading);
          return;
        }
      }
    }
    
    // Last resort: try to find within iframes or other containers
    console.log('BlogDetail: Trying alternative methods to find element');
    
    // Try the following selectors as a last resort
    const alternativeSelectors = [
      `h3:contains('${sectionId.replace(/-/g, ' ')}')`,
      `.content h3`,
      `.article-content *[id="${sectionId}"]`,
      `.content-wrapper *[id="${sectionId}"]`
    ];
    
    for (const selector of alternativeSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`BlogDetail: Found element using selector: ${selector}`);
          this.scrollToElement(elements[0] as HTMLElement);
          return;
        }
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e);
      }
    }
    
    console.error(`BlogDetail: Could not find element with ID ${sectionId}`);
  }
  
  private scrollToElement(element: HTMLElement) {
    // Remove previous highlight
    if (this.currentHighlight) {
      this.currentHighlight.classList.remove('highlight-section');
    }

    // Calculate scroll position accounting for fixed header
    const headerOffset = 80;
    
    console.log(`BlogDetail: Scrolling to element:`, element);
    
    // Make sure element is visible
    if (element.style.display === 'none') {
      element.style.display = 'block';
    }
    
    // Add highlight effect immediately
    element.classList.add('highlight-section');
    this.currentHighlight = element;
    
    // Get the element's position
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.pageYOffset;
    const targetPosition = elementTop - headerOffset;
    
    // Get the current scroll position
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    
    // Smooth scroll implementation with easing
    const duration = 800; // ms - longer duration for smoother scroll
    let start: number | null = null;
    
    // Easing function for smoother animation
    const easeInOutQuad = (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };
    
    const animateScroll = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutQuad(progress);
      
      window.scrollTo({
        top: startPosition + distance * easeProgress,
        behavior: 'auto' // We're handling the animation ourselves
      });
      
      if (elapsed < duration) {
        window.requestAnimationFrame(animateScroll);
      } else {
        // Final adjustment to ensure we're at the exact position
        window.scrollTo({
          top: targetPosition,
          behavior: 'auto'
        });
      }
    };
    
    window.requestAnimationFrame(animateScroll);

    // Remove highlight after animation
    setTimeout(() => {
      if (this.currentHighlight === element) {
        element.classList.remove('highlight-section');
        this.currentHighlight = null;
      }
    }, 2000);
  }

  private initializeObserver() {
    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    console.log('Initializing IntersectionObserver for scrollspy');

    // Create new observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            const id = entry.target.id;
            if (id) {
              console.log(`Section now visible: ${id}`);
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
      // Find containers to look for content in
      const containers = [
        document.querySelector('.main-content-wrapper'),
        document.querySelector('.article-content'),
        document.body
      ].filter(Boolean);

      let totalObserved = 0;

      containers.forEach(container => {
        if (!container) return;
        
        console.log(`Looking for observable elements in container:`, container);

        // Find all headings with IDs
        const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        headings.forEach(heading => {
          if (heading.id) {
            this.observer?.observe(heading);
            totalObserved++;
          }
        });

        // Find paragraphs with IDs (these contain bold text sections or are otherwise important)
        const paragraphs = container.querySelectorAll('p[id]');
        paragraphs.forEach(paragraph => {
          if (paragraph.id) {
            this.observer?.observe(paragraph);
            totalObserved++;
          }
        });

        // Find lists with IDs
        const lists = container.querySelectorAll('ul[id], ol[id]');
        lists.forEach(list => {
          if (list.id) {
            this.observer?.observe(list);
            totalObserved++;
          }
        });

        // Find blockquotes with IDs
        const quotes = container.querySelectorAll('blockquote[id]');
        quotes.forEach(quote => {
          if (quote.id) {
            this.observer?.observe(quote);
            totalObserved++;
          }
        });

        // Find any other elements with IDs that might represent sections
        const otherSections = container.querySelectorAll('div[id^="section-"], div[id^="list-section-"], div[id^="quote-"]');
        otherSections.forEach(section => {
          if (section.id) {
            this.observer?.observe(section);
            totalObserved++;
          }
        });
      });

      console.log(`Total elements being observed: ${totalObserved}`);
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

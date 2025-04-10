import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformServer, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  catchError,
  map,
  of,
  shareReplay,
  tap,
  Subject,
  takeUntil,
  firstValueFrom,
} from 'rxjs';
import { BlogPost } from '../../services/blog.service';
import { NewBlogService } from '../../services/new-blog.service';
import { SidebarComponent, ContentSection } from '../sidebar/sidebar.component';
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
    MostReadArticlesComponent,
  ],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
    private blogService: NewBlogService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Blog post ID not found.';
      this.blogData$ = of(null);
    } else {
      this.blogData$ = this.blogService.getPost(id).pipe(
        map((blog) => {
          if (blog) {
            console.log('BlogDetail - Raw blog data:', blog);
            console.log('BlogDetail - TableOfContents:', blog.tableOfContents);

            if (blog.content) {
              console.log(
                'BlogDetail - Content preview:',
                blog.content.substring(0, 200) + '...'
              );
              console.log(
                'BlogDetail - Content contains HTML?',
                blog.content.includes('<html>')
              );
              console.log(
                'BlogDetail - Content has h3 tags?',
                blog.content.includes('<h3')
              );
            }

            // If tableOfContents exists, use it directly
            if (blog.tableOfContents && blog.tableOfContents.sections) {
              console.log(
                'BlogDetail - TableOfContents sections found:',
                JSON.stringify(blog.tableOfContents.sections, null, 2)
              );
            } else {
              // Otherwise try to convert from the old format
              console.log(
                'BlogDetail - No tableOfContents found, checking for old format'
              );

              // Convert tableOfContents to ContentSection format if it exists
              const blogWithTableOfContents = blog as unknown as {
                tableOfContents?: {
                  sections: any[];
                };
              };

              if (
                blogWithTableOfContents.tableOfContents &&
                blogWithTableOfContents.tableOfContents.sections
              ) {
                console.log('Converting tableOfContents to sections format');
                blog.sections = this.convertTableOfContentsToSections(
                  blogWithTableOfContents.tableOfContents.sections
                );
              }
            }

            // Debug relatedBlogs
            console.log('Blog relatedBlogs:', blog.relatedBlogs);
          }
          return blog;
        }),
        tap((blog) => {
          if (!blog) {
            this.error = 'Blog post not found.';
          } else {
            this.contentLoaded = true;
            // Set meta title and description
            this.updateMetadata(blog);
            // Initialize observer after content is loaded (only in browser)
            if (!isPlatformServer(this.platformId)) {
              setTimeout(() => this.initializeObserver(), 300);
            }
          }
        }),
        catchError((error) => {
          console.error('Error fetching blog post:', error);
          this.error = 'Failed to load blog post. Please try again later.';
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        takeUntil(this.destroy$)
      );

      // For SSR, ensure data is loaded immediately
      if (isPlatformServer(this.platformId)) {
        firstValueFrom(this.blogData$).catch((err) => {
          console.error('Error pre-fetching blog data for SSR:', err);
        });
      }
    }
  }

  // Convert the tableOfContents format to ContentSection format
  private convertTableOfContentsToSections(sections: any[]): ContentSection[] {
    console.log('Table of Contents sections to convert:', sections);

    if (!sections || sections.length === 0) {
      console.warn('No table of contents sections found');
      return [];
    }

    // Create main section
    const mainSection: ContentSection = {
      id: 'main-title',
      title: 'Content Sections',
      level: 1,
      subSections: [],
    };

    // Create top level virtual section for all content
    const topLevelSection: ContentSection = {
      id: 'content-top-level',
      title: 'Content Sections',
      level: 2,
      subSections: [],
    };

    mainSection.subSections = [topLevelSection];

    // Process each section from tableOfContents
    sections.forEach((section) => {
      console.log('Processing TOC section:', section);

      const newSection: ContentSection = {
        id: section.id,
        title: section.title,
        level: 3,
        subSections: [],
      };

      // Add subsections if they exist
      if (section.subsections && section.subsections.length > 0) {
        console.log('Processing subsections:', section.subsections);
        newSection.subSections = section.subsections.map(
          (subsection: { id: string; title: string }) => ({
            id: subsection.id,
            title: subsection.title,
            level: 4,
            subSections: [],
          })
        );
      }

      topLevelSection.subSections?.push(newSection);
    });

    console.log('Final sections structure:', mainSection);
    return [mainSection];
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
      this.metaService.addTag({
        name: 'description',
        content: blog.metaDescription,
      });
    }

    // Add keywords based on tags if available
    if (blog.tags && blog.tags.length > 0) {
      this.metaService.addTag({
        name: 'keywords',
        content: blog.tags.join(', '),
      });
    }

    // Add author
    if (blog.author) {
      this.metaService.addTag({
        name: 'author',
        content:
          typeof blog.author === 'string' ? blog.author : blog.author.name,
      });
    }

    // Open Graph Protocol tags for better social media sharing
    if (blog.metaTitle) {
      this.metaService.addTag({
        property: 'og:title',
        content: blog.metaTitle,
      });
    } else {
      this.metaService.addTag({ property: 'og:title', content: blog.title });
    }

    if (blog.metaDescription) {
      this.metaService.addTag({
        property: 'og:description',
        content: blog.metaDescription,
      });
    }

    // Current URL - Safe for SSR
    const url = this.document.location.href;
    this.metaService.addTag({ property: 'og:url', content: url });

    // Image if available
    if (blog.imageUrl || blog.featureImage) {
      const imageContent = blog.imageUrl || blog.featureImage || '';
      this.metaService.addTag({
        property: 'og:image',
        content: imageContent,
      });
    }

    // Content type
    this.metaService.addTag({ property: 'og:type', content: 'article' });

    // Twitter Card
    this.metaService.addTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    if (blog.metaTitle) {
      this.metaService.addTag({
        name: 'twitter:title',
        content: blog.metaTitle,
      });
    } else {
      this.metaService.addTag({ name: 'twitter:title', content: blog.title });
    }

    if (blog.metaDescription) {
      this.metaService.addTag({
        name: 'twitter:description',
        content: blog.metaDescription,
      });
    }

    if (blog.imageUrl || blog.featureImage) {
      const imageContent = blog.imageUrl || blog.featureImage || '';
      this.metaService.addTag({
        name: 'twitter:image',
        content: imageContent,
      });
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
    const existingScript = this.document.getElementById(
      'blogPostStructuredData'
    );
    if (existingScript) {
      existingScript.remove();
    }

    const publishDate = blog.date || blog.createdAt || new Date().toISOString();
    const baseUrl = this.document.location.origin;

    // Create structured data for the blog article
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || '',
      image:
        blog.imageUrl ||
        blog.featureImage ||
        `${baseUrl}/assets/default-image.jpg`,
      datePublished: publishDate,
      dateModified: blog.updatedAt || publishDate,
      author: {
        '@type': 'Person',
        name:
          typeof blog.author === 'string'
            ? blog.author
            : blog.author?.name || 'HTBlogs Team',
      },
      publisher: {
        '@type': 'Organization',
        name: 'HTBlogs',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/assets/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': this.document.location.href,
      },
    };

    // Create script element and add to document
    const script = this.document.createElement('script');
    script.id = 'blogPostStructuredData';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }

  ngAfterViewInit() {
    // Only execute client-side code when not on server
    if (!isPlatformServer(this.platformId) && this.contentLoaded) {
      this.initializeObserver();
      this.ensureHeadingsHaveIds();
    }
  }

  private ensureHeadingsHaveIds() {
    // Only run in browser environment
    if (isPlatformServer(this.platformId)) {
      return;
    }

    // This function ensures all headings have proper IDs for navigation
    setTimeout(() => {
      const contentContainer = document.querySelector('.main-content-wrapper');
      if (!contentContainer) {
        console.warn(
          'Could not find main-content-wrapper for adding heading IDs'
        );
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

    // Log all elements with IDs in the content wrapper
    const contentWrapper = document.querySelector('.main-content-wrapper');
    if (!contentWrapper) {
      console.error('BlogDetail: Content wrapper not found');
      return;
    }

    // First collect all candidate elements matching this ID
    const candidates: { element: HTMLElement; priority: number }[] = [];

    // First priority: actual heading elements with this ID (not section-anchor)
    const headings = contentWrapper.querySelectorAll(
      `h1#${sectionId}, h2#${sectionId}, h3#${sectionId}, h4#${sectionId}, h5#${sectionId}, h6#${sectionId}`
    );
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i] as HTMLElement;
      if (!this.isInsidePackageCard(heading)) {
        candidates.push({ element: heading, priority: 1 });
      }
    }

    // Second priority: paragraphs or other text elements
    const paragraphs = contentWrapper.querySelectorAll(
      `p#${sectionId}, div#${sectionId}:not(.section-anchor)`
    );
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i] as HTMLElement;
      if (!this.isInsidePackageCard(paragraph)) {
        candidates.push({ element: paragraph, priority: 2 });
      }
    }

    // Third priority: section-anchor divs
    const anchors = contentWrapper.querySelectorAll(
      `.section-anchor#${sectionId}`
    );
    for (let i = 0; i < anchors.length; i++) {
      candidates.push({ element: anchors[i] as HTMLElement, priority: 3 });
    }

    // Last priority: any element with this ID
    const anyElement = document.getElementById(sectionId);
    if (
      anyElement &&
      !this.isInsidePackageCard(anyElement) &&
      !candidates.some((c) => c.element === anyElement)
    ) {
      candidates.push({ element: anyElement, priority: 4 });
    }

    console.log(
      `BlogDetail: Found ${candidates.length} candidate elements for ID: ${sectionId}`
    );

    // Sort by priority and scroll to the best match
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.priority - b.priority);
      const bestMatch = candidates[0].element;
      console.log(`BlogDetail: Scrolling to best match element:`, bestMatch);
      this.scrollToElement(bestMatch);
      return;
    }

    // If no elements found, create a new anchor
    console.log('BlogDetail: No existing elements found, creating new anchor');
    const newAnchor = document.createElement('div');
    newAnchor.id = sectionId;
    newAnchor.className = 'section-anchor';
    newAnchor.style.position = 'relative';
    newAnchor.style.marginTop = '20px';
    newAnchor.style.height = '1px';

    // Find the first heading to insert after
    const firstHeading = contentWrapper.querySelector('h1, h2');
    if (firstHeading && firstHeading.parentNode) {
      firstHeading.parentNode.insertBefore(newAnchor, firstHeading.nextSibling);
      console.log('BlogDetail: Inserted anchor after first heading');
    } else {
      // Otherwise add to the top of the content
      const mainContentElement = contentWrapper.querySelector('.main-content');
      if (mainContentElement) {
        mainContentElement.prepend(newAnchor);
      } else {
        contentWrapper.prepend(newAnchor);
      }
    }

    this.scrollToElement(newAnchor);
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
        behavior: 'auto', // We're handling the animation ourselves
      });

      if (elapsed < duration) {
        window.requestAnimationFrame(animateScroll);
      } else {
        // Final adjustment to ensure we're at the exact position
        window.scrollTo({
          top: targetPosition,
          behavior: 'auto',
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
    // Skip on server side
    if (isPlatformServer(this.platformId)) {
      return;
    }

    // Clean up existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    console.log('Initializing IntersectionObserver for scrollspy');

    // Create new observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            const id = entry.target.id;
            if (id) {
              console.log(`Section now visible: ${id}`);
              // Update sidebar selection
              window.dispatchEvent(
                new CustomEvent('section-visible', {
                  detail: { sectionId: id },
                })
              );
            }
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    // Observe all section headings and marked paragraphs
    requestAnimationFrame(() => {
      // Find containers to look for content in
      const containers = [
        document.querySelector('.main-content-wrapper'),
        document.querySelector('.article-content'),
        document.body,
      ].filter(Boolean);

      let totalObserved = 0;

      containers.forEach((container) => {
        if (!container) return;

        console.log(`Looking for observable elements in container:`, container);

        // Find all headings with IDs
        const headings = container.querySelectorAll(
          'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'
        );
        headings.forEach((heading) => {
          if (heading.id && !this.isInsidePackageCard(heading as HTMLElement)) {
            this.observer?.observe(heading);
            totalObserved++;
          }
        });

        // Find paragraphs with IDs (these contain bold text sections or are otherwise important)
        const paragraphs = container.querySelectorAll('p[id]');
        paragraphs.forEach((paragraph) => {
          if (
            paragraph.id &&
            !this.isInsidePackageCard(paragraph as HTMLElement)
          ) {
            this.observer?.observe(paragraph);
            totalObserved++;
          }
        });

        // Find lists with IDs
        const lists = container.querySelectorAll('ul[id], ol[id]');
        lists.forEach((list) => {
          if (list.id && !this.isInsidePackageCard(list as HTMLElement)) {
            this.observer?.observe(list);
            totalObserved++;
          }
        });

        // Find blockquotes with IDs
        const quotes = container.querySelectorAll('blockquote[id]');
        quotes.forEach((quote) => {
          if (quote.id && !this.isInsidePackageCard(quote as HTMLElement)) {
            this.observer?.observe(quote);
            totalObserved++;
          }
        });

        // Find any other elements with IDs that might represent sections
        const otherSections = container.querySelectorAll(
          'div[id^="section-"], div[id^="list-section-"], div[id^="quote-"]'
        );
        otherSections.forEach((section) => {
          if (section.id && !this.isInsidePackageCard(section as HTMLElement)) {
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

  // Helper method to check if element is inside a package card
  private isInsidePackageCard(element: HTMLElement): boolean {
    let current: HTMLElement | null = element;
    while (current) {
      if (
        current.classList.contains('package-card') ||
        current.closest('.package-card') ||
        current.closest('.scroll-container') ||
        current.closest('.package-container')
      ) {
        console.log('BlogDetail: Element is inside package card, skipping');
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  // Check if two text strings are similar
  private isTextSimilar(text1: string, text2: string): boolean {
    // Basic similarity check
    const words1 = text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const words2 = text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (words1.length === 0 || words2.length === 0) {
      return false;
    }

    // Count matching words
    let matchCount = 0;
    for (const word2 of words2) {
      for (const word1 of words1) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matchCount++;
          break;
        }
      }
    }

    return (
      matchCount > 0 && matchCount >= Math.min(2, Math.floor(words2.length / 2))
    );
  }
}

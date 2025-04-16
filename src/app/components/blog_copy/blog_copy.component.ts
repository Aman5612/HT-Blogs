import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewBlogService } from '../../services/new-blog.service';
import { Article } from '../../interface/article.interface';
import {
  Observable,
  Subject,
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  of,
} from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="blog-list">
      <h2>Latest Blog Posts</h2>

      <div class="search-container">
        <input
          type="text"
          placeholder="Search by title..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          class="search-input"
        />
      </div>

      @if (loading && filteredPosts.length === 0) {
      <div class="loading">Loading posts...</div>
      } @else if (filteredPosts.length === 0) {
      <div class="no-results">No posts found matching your search.</div>
      } @else {
      <div class="posts-grid">
        @for (post of filteredPosts; track post.id) {
        <div
          class="post-card"
          [routerLink]="['/blog', post.id]"
          role="link"
          tabindex="0"
        >
          <div
            class="post-image"
            [class.no-image]="!post.media?.[0]?.url && !post.featureImage"
          >
            @if (post.media?.[0]?.url || post.featureImage) {
            <img
              [src]="post.featureImage || post.media[0].url"
              [alt]="post.featureImageAlt"
            />
            }
          </div>
          <div class="post-content">
            <h3>{{ post.title }}</h3>
            <div class="post-meta">
              <span class="date">{{
                post.createdAt | date : 'mediumDate'
              }}</span>
              <span class="status" [class.draft]="post.status === 'DRAFT'">
                {{ post.status }}
              </span>
            </div>
          </div>
        </div>
        }
      </div>

      <div class="scroll-loader">
        @if (loading) {
        <div class="loading-more">
          <div class="spinner"></div>
          <span>Loading more posts...</span>
        </div>
        } @if (!isSearching && pagination && !loading &&
        !pagination.hasNextPage) {
        <div class="end-of-results">No more posts to load</div>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .blog-list {
        padding: 2rem;
        padding-top: 5rem;
      }

      h2 {
        margin-bottom: 2rem;
        font-size: 2rem;
        color: #333;
      }

      .search-container {
        margin-bottom: 2rem;
      }

      .search-input {
        width: 100%;
        max-width: 500px;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        outline: none;
        transition: border-color 0.2s;
      }

      .search-input:focus {
        border-color: #6495ed;
        box-shadow: 0 0 0 2px rgba(100, 149, 237, 0.2);
      }

      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .post-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
        cursor: pointer;
        outline: none;

        &:hover,
        &:focus {
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

      .scroll-loader {
        padding: 1rem;
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .loading,
      .no-results,
      .end-of-results {
        text-align: center;
        padding: 2rem;
        color: #666;
      }

      .loading-more {
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: #666;

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(100, 149, 237, 0.3);
          border-radius: 50%;
          border-top-color: #6495ed;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      }

      .end-of-results {
        padding: 1rem;
        font-style: italic;
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .blog-list {
          padding: 1rem;
          padding-top: 4rem;
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

        .loading-more {
          padding: 0.75rem;

          .spinner {
            width: 20px;
            height: 20px;
            border-width: 2px;
          }
        }
      }
    `,
  ],
})
export class BlogListComponent implements OnInit {
  posts: Article[] = [];
  filteredPosts: Article[] = [];
  loading = false;
  page = 1;
  limit = 5;
  searchTerm = '';
  isSearching = false;
  pagination: any = null;
  allPostsLoaded = false;
  private searchTerms = new Subject<string>();

  constructor(
    private blogService: NewBlogService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.setMetadata();
    this.setupSearch();
    this.loadPosts();
  }

  private setupSearch() {
    this.searchTerms
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.filterPosts();
      });
  }

  onSearch() {
    this.searchTerms.next(this.searchTerm);
  }

  filterPosts() {
    if (!this.searchTerm.trim()) {
      this.filteredPosts = [...this.posts];
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredPosts = this.posts.filter((post) =>
      post.title.toLowerCase().includes(searchTermLower)
    );
  }

  loadPosts() {
    if (this.loading || (this.pagination && !this.pagination.hasNextPage))
      return;

    this.loading = true;
    this.blogService
      .getPaginatedPosts(this.page, this.limit, '')
      .subscribe((response) => {
        console.log('response', response.data);
        this.posts = [...this.posts, ...response.data];
        this.pagination = response.pagination;
        this.loading = false;
        this.page++;

        // Update filtered posts after loading
        this.filterPosts();
      });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    // Don't load more posts when searching (client-side filtering)
    if (this.isSearching) return;

    // Check if we're near the bottom of the page
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (
      scrollTop + clientHeight >= scrollHeight - 200 &&
      !this.loading &&
      (!this.pagination || this.pagination.hasNextPage)
    ) {
      this.loadPosts();
    }
  }

  private setMetadata(): void {
    const title = 'HTBlogs - Travel and Lifestyle Blog';
    const description =
      'Explore our collection of travel guides, luxury experiences, and lifestyle tips from around the world. Discover new destinations and plan your next adventure.';

    // Set document title
    this.titleService.setTitle(title);

    // Clear any previous meta tags
    this.metaService.removeTag('name="description"');
    this.metaService.removeTag('property="og:title"');
    this.metaService.removeTag('property="og:description"');
    this.metaService.removeTag('property="og:url"');
    this.metaService.removeTag('property="og:type"');
    this.metaService.removeTag('name="twitter:card"');
    this.metaService.removeTag('name="twitter:title"');
    this.metaService.removeTag('name="twitter:description"');
    this.metaService.removeTag('name="twitter:image"');
    this.metaService.removeTag('name="robots"');
    this.metaService.removeTag('name="keywords"');

    // Set basic meta tags
    this.metaService.addTag({ name: 'description', content: description });
    this.metaService.addTag({ name: 'robots', content: 'index, follow' });
    this.metaService.addTag({
      name: 'keywords',
      content:
        'travel, luxury, lifestyle, blog, vacation, destination, experience, adventure',
    });

    // Set Open Graph tags
    this.metaService.addTag({ property: 'og:title', content: title });
    this.metaService.addTag({
      property: 'og:description',
      content: description,
    });
    this.metaService.addTag({
      property: 'og:url',
      content: this.document.location.href,
    });
    this.metaService.addTag({ property: 'og:type', content: 'website' });
    this.metaService.addTag({
      property: 'og:image',
      content: this.document.location.origin + '/assets/default-image.jpg',
    });

    // Set Twitter Card tags
    this.metaService.addTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.addTag({ name: 'twitter:title', content: title });
    this.metaService.addTag({
      name: 'twitter:description',
      content: description,
    });
    this.metaService.addTag({
      name: 'twitter:image',
      content: this.document.location.origin + '/assets/default-image.jpg',
    });

    // Set canonical URL
    let linkCanonical = this.document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = this.document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', this.document.location.href);

    // Add structured data for blog listing
    this.addStructuredData();
  }

  private addStructuredData(): void {
    // Remove any existing structured data
    const existingScript = this.document.getElementById(
      'blogListStructuredData'
    );
    if (existingScript) {
      existingScript.remove();
    }

    const baseUrl = this.document.location.origin;

    // Create structured data for the blog list
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      headline: 'HTBlogs - Travel and Lifestyle Blog',
      description:
        'Explore our collection of travel guides, luxury experiences, and lifestyle tips from around the world.',
      url: this.document.location.href,
      publisher: {
        '@type': 'Organization',
        name: 'HTBlogs',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/assets/logo.png`,
        },
      },
    };

    // Create script element and add to document
    const script = this.document.createElement('script');
    script.id = 'blogListStructuredData';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }
}

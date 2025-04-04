import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Article } from '../../interface/article.interface';
import { Observable } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';

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
              <div class="post-image" [class.no-image]="!post.media?.[0]?.url && !post.featureImage">
                @if (post.media?.[0]?.url || post.featureImage) {
                  <img 
                    [src]="post.featureImage || post.media[0].url" 
                    [alt]="post.featureImageAlt"
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

  constructor(
    private blogService: BlogService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.posts$ = this.blogService.getAllPosts();
  }

  ngOnInit() {
    this.setMetadata();
  }

  private setMetadata(): void {
    const title = 'HTBlogs - Travel and Lifestyle Blog';
    const description = 'Explore our collection of travel guides, luxury experiences, and lifestyle tips from around the world. Discover new destinations and plan your next adventure.';
    
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
    this.metaService.addTag({ name: 'keywords', content: 'travel, luxury, lifestyle, blog, vacation, destination, experience, adventure' });
    
    // Set Open Graph tags
    this.metaService.addTag({ property: 'og:title', content: title });
    this.metaService.addTag({ property: 'og:description', content: description });
    this.metaService.addTag({ property: 'og:url', content: this.document.location.href });
    this.metaService.addTag({ property: 'og:type', content: 'website' });
    this.metaService.addTag({ property: 'og:image', content: this.document.location.origin + '/assets/default-image.jpg' });
    
    // Set Twitter Card tags
    this.metaService.addTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.addTag({ name: 'twitter:title', content: title });
    this.metaService.addTag({ name: 'twitter:description', content: description });
    this.metaService.addTag({ name: 'twitter:image', content: this.document.location.origin + '/assets/default-image.jpg' });
    
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
    const existingScript = this.document.getElementById('blogListStructuredData');
    if (existingScript) {
      existingScript.remove();
    }
    
    const baseUrl = this.document.location.origin;
    
    // Create structured data for the blog list
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'headline': 'HTBlogs - Travel and Lifestyle Blog',
      'description': 'Explore our collection of travel guides, luxury experiences, and lifestyle tips from around the world.',
      'url': this.document.location.href,
      'publisher': {
        '@type': 'Organization',
        'name': 'HTBlogs',
        'logo': {
          '@type': 'ImageObject',
          'url': `${baseUrl}/assets/logo.png`
        }
      }
    };
    
    // Create script element and add to document
    const script = this.document.createElement('script');
    script.id = 'blogListStructuredData';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    this.document.head.appendChild(script);
  }
}

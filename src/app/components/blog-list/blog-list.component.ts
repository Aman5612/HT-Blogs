import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewBlogService } from '../../services/new-blog.service';
import { Article } from '../../interface/article.interface';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule, FooterComponent],
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

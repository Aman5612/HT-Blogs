import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { SectionScrollDirective } from '../../directives/section-scroll.directive';

interface Package {
  id: string;
  name: string;
  starting_price: number;
  description?: string;
  image_url?: string;
  categories?: string[];
}

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, SectionScrollDirective],
  template: `
    <div class="main-content">
      @if (content) {
      <div>
        <h1 class="blog-title">{{ customTitle }}</h1>
        @if (keywords) {
        <div class="keywords-container">
          @for (keyword of keywordsArray; track keyword) {
          <span class="keyword-tag">{{ keyword }}</span>
          }
        </div>
        }
        <div
          class="content-wrapper"
          [innerHTML]="sanitizedContent"
          appSectionScroll
        ></div>
      </div>
      } @else {
      <div class="empty-state">
        <p>No content available</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .main-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        width: 100%;
        min-width: 0; // Fix for grid item overflow
        overflow-wrap: break-word;
      }

      .blog-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        line-height: 1.2;
        color: #1a1a1a;
      }

      .keywords-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .keyword-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: #f0f0f0;
        border-radius: 50px;
        font-size: 0.85rem;
        color: #666;
        font-weight: 500;
      }

      .content-wrapper {
        line-height: 1.6;
        color: #1a1a1a;
        font-size: 1.1rem;
        position: relative;

        :host ::ng-deep {
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            scroll-margin-top: calc(
              64px + 2rem
            ); // Account for header height + padding
            font-weight: 600;
            line-height: 1.3;
            color: #1a1a1a;
          }

          h1 {
            font-size: 2.5rem;
            margin: 2rem 0 1.5rem;
          }

          h2 {
            font-size: 2rem;
            margin: 2rem 0 1rem;
          }

          h3 {
            font-size: 1.75rem;
            margin: 1.5rem 0 1rem;
          }

          p {
            margin-bottom: 1.5rem;
            line-height: 1.8;
          }

          img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 2rem 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          ul,
          ol {
            margin: 1.5rem 0;
            padding-left: 1.5rem;

            li {
              margin-bottom: 0.75rem;
              line-height: 1.6;
            }
          }

          blockquote {
            margin: 2rem 0;
            padding: 1.5rem 2rem;
            border-left: 4px solid #1a1a1a;
            background: #f8f8f8;
            font-style: italic;
            color: #333;
            border-radius: 4px;

            p:last-child {
              margin-bottom: 0;
            }
          }

          code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Fira Code', monospace;
            font-size: 0.9em;
            color: #1a1a1a;
          }

          pre {
            background: #f8f8f8;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 2rem 0;
            border: 1px solid #eee;

            code {
              background: none;
              padding: 0;
              font-size: 0.9em;
              line-height: 1.5;
              color: #1a1a1a;
            }
          }

          a {
            color: #0066cc;
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s;

            &:hover {
              border-bottom-color: currentColor;
            }
          }

          hr {
            margin: 3rem 0;
            border: none;
            border-top: 1px solid #eee;
          }

          table {
            width: 100%;
            margin: 2rem 0;
            border-collapse: collapse;

            th,
            td {
              padding: 0.75rem;
              border: 1px solid #eee;
              text-align: left;
            }

            th {
              background: #f8f8f8;
              font-weight: 600;
            }

            tr:nth-child(even) {
              background: #fafafa;
            }
          }

          // Package cards container
          .package-cards-container {
            margin: 3rem 0;
            padding: 2rem;
            background: #f9f9f9;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .package-cards-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #1a1a1a;
          }

          .package-cards-wrapper {
            overflow-x: auto;
            white-space: nowrap;
            padding: 0.5rem 0;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: #ccc transparent;

            &::-webkit-scrollbar {
              height: 6px;
            }

            &::-webkit-scrollbar-track {
              background: transparent;
            }

            &::-webkit-scrollbar-thumb {
              background-color: #ccc;
              border-radius: 20px;
            }
          }

          .package-cards {
            display: inline-flex;
            gap: 16px;
            padding: 0 4px;
          }

          .package-card {
            width: 280px;
            border-radius: 12px;
            overflow: hidden;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;

            &:hover {
              transform: translateY(-4px);
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
            }
          }

          .package-image {
            background-color: #f3f4f6;
            overflow: hidden;
            position: relative;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              margin: 0;
              box-shadow: none;
              border-radius: 0;
            }
          }

          .package-content {
            padding: 16px 20px;
            white-space: normal;
          }

          .package-title {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            line-height: 1.3;
          }

          .package-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 8px;
            font-size: 12px;
            color: #4b5563;
          }

          .package-type {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 12px;
          }

          .package-price {
            font-weight: 600;
            font-size: 14px;
            color: #111827;
          }

          // First element spacing
          > *:first-child {
            margin-top: 0;
          }

          // Last element spacing
          > *:last-child {
            margin-bottom: 0;
          }

          /* Additional styles for clickable sections */
          h1[id],
          h2[id],
          h3[id],
          h4[id],
          h5[id],
          h6[id] {
            transition: background-color 0.2s ease;
            padding: 4px 8px;
            margin-left: -8px;
            border-radius: 4px;
            display: inline-block;
          }

          h1[id]:hover,
          h2[id]:hover,
          h3[id]:hover,
          h4[id]:hover,
          h5[id]:hover,
          h6[id]:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }

          p[id] {
            padding: 4px;
            margin-left: -4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }

          p[id]:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }

          p[id] strong,
          p[id] b {
            transition: background-color 0.2s ease;
            padding: 2px 4px;
            border-radius: 3px;
          }

          p[id] strong:hover,
          p[id] b:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }

          ul[id],
          ol[id] {
            transition: background-color 0.2s ease;
            padding-top: 4px;
            padding-bottom: 4px;
            border-radius: 4px;
          }

          ul[id]:hover,
          ol[id]:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }

          blockquote[id] {
            transition: background-color 0.2s ease;
          }

          blockquote[id]:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }

          /* Ensure all elements with IDs have proper scroll margins */
          [id] {
            scroll-margin-top: 80px; /* Match the header offset */
          }
        }
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        color: #666;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 1rem;
        }

        .content-wrapper {
          font-size: 14px;
        }

        ::ng-deep .content-wrapper h1 {
          font-size: 24px !important;
          margin: 1.5rem 0 1rem !important;
        }

        ::ng-deep .content-wrapper h2 {
          font-size: 18px !important;
          margin: 1.25rem 0 0.75rem !important;
        }

        ::ng-deep .content-wrapper h3 {
          font-size: 16px !important;
          margin: 1rem 0 0.5rem !important;
        }

        ::ng-deep .content-wrapper p {
          font-size: 14px !important;
          line-height: 1.6 !important;
          margin-bottom: 1rem !important;
        }

        ::ng-deep .package-cards-container {
          padding: 1rem;
          margin: 2rem 0;
        }

        ::ng-deep .package-cards-title {
          font-size: 18px;
          margin-bottom: 1rem;
        }
      }
    `,
  ],
})
export class MainContentComponent implements OnInit {
  @Input() set content(value: string) {
    this._content = value;
    // Process content when it's set
    this.processContent();
  }

  get content(): string {
    return this._content;
  }

  @Input() packageIds: string[] = [];
  @Input() customTitle: string = '';
  @Input() relatedBlogs: any = [];
  @Input() keywords: string = '';

  get keywordsArray(): string[] {
    if (!this.keywords) return [];
    return this.keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  private _content: string = '';
  sanitizedContent: SafeHtml = '';
  packages: Package[] = [];

  constructor(private sanitizer: DomSanitizer, private http: HttpClient) {}

  ngOnInit(): void {
    console.log('->>', this.packageIds);
    if (this.packageIds && this.packageIds.length > 0) {
      this.fetchPackages();
    }
  }

  private fetchPackages(): void {
    // Create a promise for each package ID to fetch
    const fetchPromises = this.packageIds.map((id) =>
      this.http
        .get<any>(
          `https://staging.holidaytribe.com:3000/package/getPackageByIds/${id}`
        )
        .toPromise()
        .then((response) => {
          if (
            response &&
            response.status &&
            response.result &&
            response.result[0]
          ) {
            return response.result[0];
          }
          return null;
        })
        .catch((error) => {
          console.error(`Error fetching package with ID ${id}:`, error);
          return null;
        })
    );

    // Resolve all promises
    Promise.all(fetchPromises).then((results) => {
      // Filter out null results
      this.packages = results.filter((pkg) => pkg !== null);
      // After packages are loaded, update the content
      this.processContent();
    });
  }

  private processContent(): void {
    if (!this._content) {
      this.sanitizedContent = '';
      return;
    }

    // If no packages or packages not yet loaded, just sanitize the content
    if (!this.packages || this.packages.length === 0) {
      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(
        this._content
      );
      return;
    }

    // Create package cards HTML
    const packageCardsHtml = this.createPackageCardsHtml();
    let modifiedContent = this._content;

    // Find all h2 and h3 tags
    const h2Matches = [...modifiedContent.matchAll(/<h2[^>]*>.*?<\/h2>/gi)];
    const h3Matches = [...modifiedContent.matchAll(/<h3[^>]*>.*?<\/h3>/gi)];

    // Try to find the second h2
    if (h2Matches.length >= 2) {
      const secondH2 = h2Matches[1];
      const insertionIndex = secondH2.index!;
      modifiedContent =
        modifiedContent.slice(0, insertionIndex) +
        packageCardsHtml +
        modifiedContent.slice(insertionIndex);
    }
    // If no second h2, try second h3
    else if (h3Matches.length >= 2) {
      const secondH3 = h3Matches[1];
      const insertionIndex = secondH3.index!;
      modifiedContent =
        modifiedContent.slice(0, insertionIndex) +
        packageCardsHtml +
        modifiedContent.slice(insertionIndex);
    }
    // If neither condition is met, append to the end
    else {
      modifiedContent += packageCardsHtml;
    }

    this.sanitizedContent =
      this.sanitizer.bypassSecurityTrustHtml(modifiedContent);
  }

  private createPackageCardsHtml(): string {
    return `
      <style>
        h3 {
        
          overflow: hidden;
          text-overflow: ellipsis; 
          white-space: nowrap; 
        }
        @media (max-width: 768px) {
          h3{
            font-size: 14px !!important;
          }
          .size{
            font-size: 12px !important;
          }
        } 

        .package-card {
          width: 164px; /* Default for mobile */
        }
        @media (min-width: 768px) {
          .package-card {
            width: 264px; /* Desktop */
          }
        }
        .scroll-container {
          overflow-x: auto;
          white-space: nowrap;
          padding-left: 0.25rem;
          padding-right: 0.25rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .scroll-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, newer Edge */
        }
      </style>
      <div style="margin: 0; margin-top: 1.25rem; margin-bottom: 1.25rem; width: 100%;">
        <div class="scroll-container">
          <div style="display: flex; gap: 6px;">
            ${this.packages
              .map(
                (pkg) => `
              <div class="package-card" style="flex-shrink: 0; border-radius: 0.75rem; overflow: hidden; background-color: #F8F8F8;">
                <div style="overflow: hidden; position: relative; background-color: #F8F8F8;">
                  <img src="/images/package.svg" alt="${
                    pkg.name
                  }" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                </div>
                <div style="padding: 1rem; white-space: normal;">
                  <h3 style="margin: 0; margin-bottom: 2px; font-size: 14px; font-weight: 600; color: #111827;">
                    ${pkg.name}
                  </h3>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.75rem; color: #4b5563;">Resorts</span>
                    <span style="font-size: 0.75rem; color: #4b5563;">•</span>
                    <span style="font-size: 0.75rem; color: #4b5563;">Clubs</span>
                    <span style="font-size: 0.75rem; color: #4b5563;">•</span>
                    <span style="font-size: 0.75rem; color: #4b5563;">Beach</span>
                  </div>
                  <div class="size" style="font-size: 0.875rem; color: #6b7280; margin-bottom: 2px;">
                    ${pkg.description || 'Weekend getaway'}
                  </div>
                  <div style="font-weight: 600; font-size: 0.875rem; color: #111827;" class="size">
                    From ₹${
                      pkg.starting_price
                        ? pkg.starting_price.toLocaleString()
                        : '29,000'
                    }
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }
}

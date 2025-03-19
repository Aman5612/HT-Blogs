import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-content">
      @if (content) {
        <div class="content-wrapper" [innerHTML]="sanitizedContent"></div>
      } @else {
        <div class="empty-state">
          <p>No content available</p>
        </div>
      }
    </div>
  `,
  styles: [`
    
    .main-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      width: 100%;
      min-width: 0; // Fix for grid item overflow
      overflow-wrap: break-word;
    }

    .content-wrapper {
      line-height: 1.6;
      color: #1a1a1a;
      font-size: 1.1rem;

      :host ::ng-deep {
        h1, h2, h3, h4, h5, h6 {
          scroll-margin-top: calc(64px + 2rem); // Account for header height + padding
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

        ul, ol {
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

          th, td {
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

        // First element spacing
        > *:first-child {
          margin-top: 0;
        }

        // Last element spacing
        > *:last-child {
          margin-bottom: 0;
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
    }
  `]
})
export class MainContentComponent {
  @Input() set content(value: string) {
    this._content = value;
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(value);
  }
  get content(): string {
    return this._content;
  }
  private _content: string = '';
  sanitizedContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}
}

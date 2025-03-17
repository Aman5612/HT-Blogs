import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Article } from '../interface/article.interface';
import { ContentSection } from '../components/sidebar/sidebar.component';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  sections: ContentSection[];
  author: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/posts`);
  }

  getMostReadArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/posts`).pipe(
      map((articles) => {
        return articles
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 5);
      })
    );
  }

  getPost(id: string): Observable<BlogPost> {
    return this.http.get<Article>(`${this.apiUrl}/posts/${id}`).pipe(
      map((article) => {
        const content = article.content || '';
        const { processedContent, sections } = this.processContent(
          content,
          article.title
        );

        return {
          id: article.id,
          title: article.title,
          content: processedContent,
          sections: sections,
          author: 'Admin', // Default author
          date: article.createdAt,
          imageUrl: article.media?.[0]?.url || article.featuredImage || '',
          tags: [],
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
        };
      })
    );
  }

  private processContent(
    content: string,
    title: string
  ): { processedContent: string; sections: ContentSection[] } {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Create the main title section
    const sections: ContentSection[] = [
      {
        id: 'main-title',
        title: title,
        level: 1,
        subSections: [],
      },
    ];

    let currentH2: ContentSection | null = null;

    // Process all headings
    const headings = tempDiv.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const title = heading.textContent?.trim() || `Section ${index + 1}`;
      const id = this.generateSectionId(title);

      // Add id to the heading in the content
      heading.id = id;

      const section: ContentSection = {
        id,
        title,
        level,
        subSections: [],
      };

      if (level === 2) {
        sections[0].subSections?.push(section);
        currentH2 = section;
      } else if (level === 3 && currentH2) {
        currentH2.subSections?.push(section);
      }
    });

    return {
      processedContent: tempDiv.innerHTML,
      sections,
    };
  }

  private generateSectionId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50); // Limit length for better URLs
  }
}

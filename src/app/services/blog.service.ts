import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Article } from '../interface/article.interface';
import { ContentSection } from '../components/sidebar/sidebar.component';
import { makeStateKey, StateKey, TransferState } from '@angular/core';
import { environment } from '../../environments/environment';

// Create state transfer keys
const POST_KEY = makeStateKey<Article[]>('post');
const POSTS_KEY = makeStateKey<Article[]>('posts');
const MOST_READ_KEY = makeStateKey<Article[]>('mostRead');

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  sections: ContentSection[];
  author?: string;
  date?: string;
  imageUrl?: string;
  slug?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  packageIds?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = environment.apiUrl;
  private transferState = inject(TransferState);

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Article[]> {
    // Check if we have the posts in transferState already
    if (this.transferState.hasKey(POSTS_KEY)) {
      const posts = this.transferState.get<Article[]>(POSTS_KEY, []);
      this.transferState.remove(POSTS_KEY); // Remove to avoid using stale data
      return of(posts);
    }

    // If not, fetch from API and store in transferState
    return this.http.get<Article[]>(`${this.apiUrl}/posts`).pipe(
      map(posts => {
        this.transferState.set(POSTS_KEY, posts);
        return posts;
      }),
      catchError(err => {
        console.error('Error fetching posts:', err);
        return of([]);
      })
    );
  }

  getMostReadArticles(): Observable<Article[]> {
    // Check if we have most read articles in transferState already
    if (this.transferState.hasKey(MOST_READ_KEY)) {
      const mostRead = this.transferState.get<Article[]>(MOST_READ_KEY, []);
      this.transferState.remove(MOST_READ_KEY); // Remove to avoid using stale data
      return of(mostRead);
    }

    return this.http.get<Article[]>(`${this.apiUrl}/posts`).pipe(
      map((articles) => {
        const mostReadArticles = articles
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 5);
        
        this.transferState.set(MOST_READ_KEY, mostReadArticles);
        return mostReadArticles;
      }),
      catchError(err => {
        console.error('Error fetching most read articles:', err);
        return of([]);
      })
    );
  }

  getPost(id: string): Observable<BlogPost | null> {
    // Check transfer state first
    const postKey = makeStateKey<BlogPost>(`post-${id}`);
    const post = this.transferState.get<BlogPost>(postKey, null as unknown as BlogPost);
    
    if (post) {
      console.log(`Retrieved post ${id} from transfer state`);
      return of(post);
    }
    
    // Fetch from API if not in transfer state
    return this.http.get<any>(`${this.apiUrl}/posts/${id}`).pipe(
      map(res => {
        if (res) {
          // Process the blog post content to extract sections
          const processedContent = this.processContent(
            res.content,
            res.title
          );
          
          const blogPost: BlogPost = {
            id: res.id,
            title: res.title,
            content: processedContent.processedContent,
            imageUrl: res.featureImage,
            slug: res.slug,
            metaTitle: res.metaTitle,
            metaDescription: res.metaDescription,
            sections: processedContent.sections,
            packageIds: res.packageIds || []
          };
          
          console.log(`Processed sections for post ${id}:`, processedContent.sections);
          
          // Store in transfer state
          this.transferState.set(postKey, blogPost);
          
          return blogPost;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching post:', error);
        return of(null);
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
    let currentH3: ContentSection | null = null;

    // Process all headings (h1, h2, h3, h4) and strong text
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
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
        currentH3 = null;
      } else if (level === 3 && currentH2) {
        currentH2.subSections?.push(section);
        currentH3 = section;
      } else if (level === 4 && currentH3) {
        currentH3.subSections?.push(section);
      } else if (level === 4 && currentH2 && !currentH3) {
        // If there's no H3 parent, add H4 under H2
        currentH2.subSections?.push(section);
      } else if (level > 1 && level <= 6 && !currentH2) {
        // If no parent section exists, add directly under main title
        sections[0].subSections?.push(section);
      }
    });

    // Process paragraphs with strong/bold elements
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach((paragraph) => {
      const boldElements = paragraph.querySelectorAll('strong, b');
      
      if (boldElements.length > 0) {
        // Consider paragraphs starting with bold text as important sections
        const firstBold = boldElements[0];
        
        if (firstBold && paragraph.textContent?.startsWith(firstBold.textContent || '')) {
          const boldText = firstBold.textContent?.trim();
          if (boldText && boldText.length > 5) { // Only consider substantial text
            const boldSectionId = this.generateSectionId(boldText);
            
            // Add ID to the containing paragraph
            paragraph.id = boldSectionId;
            
            // Create section for the bold text
            const boldSection: ContentSection = {
              id: boldSectionId,
              title: boldText,
              level: 4, // Treat as level 4 heading
              subSections: []
            };
            
            // Determine where to add this section
            if (currentH3) {
              currentH3.subSections?.push(boldSection);
            } else if (currentH2) {
              currentH2.subSections?.push(boldSection);
            } else {
              sections[0].subSections?.push(boldSection);
            }
          }
        }
      }
    });

    // Detect bullet point lists which often indicate important sections
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach((list, listIndex) => {
      // If a list is preceded by a paragraph with bold text, it's likely a section
      if (list.previousElementSibling && list.previousElementSibling.tagName === 'P') {
        const prevPara = list.previousElementSibling;
        const boldInPara = prevPara.querySelector('strong, b');
        
        if (boldInPara) {
          const listId = `list-section-${listIndex}`;
          list.id = listId;
          
          // Create a section for important lists
          const listSection: ContentSection = {
            id: listId,
            title: boldInPara.textContent?.trim() || `List ${listIndex + 1}`,
            level: 4,
            subSections: []
          };
          
          // Add to appropriate parent section
          if (currentH3) {
            currentH3.subSections?.push(listSection);
          } else if (currentH2) {
            currentH2.subSections?.push(listSection);
          } else {
            sections[0].subSections?.push(listSection);
          }
        }
      }
    });

    // Process quotes which might be important highlights
    const quotes = tempDiv.querySelectorAll('blockquote');
    quotes.forEach((quote, quoteIndex) => {
      if (quote.textContent?.trim()) {
        const quoteId = `quote-${quoteIndex}`;
        quote.id = quoteId;
        
        // Get the first line or limited text for the section title
        let quoteText = quote.textContent.trim();
        quoteText = quoteText.length > 40 ? quoteText.substring(0, 40) + '...' : quoteText;
        
        const quoteSection: ContentSection = {
          id: quoteId,
          title: `"${quoteText}"`,
          level: 4,
          subSections: []
        };
        
        // Add to appropriate parent section
        if (currentH3) {
          currentH3.subSections?.push(quoteSection);
        } else if (currentH2) {
          currentH2.subSections?.push(quoteSection);
        } else {
          sections[0].subSections?.push(quoteSection);
        }
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

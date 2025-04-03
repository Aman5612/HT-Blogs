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

    // Create a map to track sections by level and position
    const sectionMap: { [key: string]: ContentSection } = {};
    let currentH2: ContentSection | null = null;
    let currentH3: ContentSection | null = null;
    let currentH4: ContentSection | null = null;

    // First create a virtual parent section for all top-level content
    const topLevelSection: ContentSection = {
      id: 'content-top-level',
      title: 'Content Sections',
      level: 2,
      subSections: []
    };
    
    // Add it to the main section
    sections[0].subSections?.push(topLevelSection);
    currentH2 = topLevelSection;

    // Process all headings (h1, h2, h3, h4, h5, h6)
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`Found ${headings.length} headings in content`);
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const title = heading.textContent?.trim() || `Section ${index + 1}`;
      const id = this.generateSectionId(title);

      // Add id to the heading in the content
      heading.id = id;

      // Check if this heading has a strong element and use its text if available
      const strongElement = heading.querySelector('strong');
      const headingTitle = strongElement ? strongElement.textContent?.trim() : title;

      const section: ContentSection = {
        id,
        title: headingTitle || title,
        level,
        subSections: [],
      };
      
      // Store in the map for later reference
      sectionMap[id] = section;

      // Set up parent-child relationships based on heading level
      if (level === 2) {
        // H2 is a direct child of the main section
        sections[0].subSections?.push(section);
        currentH2 = section;
        currentH3 = null;
        currentH4 = null;
      } else if (level === 3) {
        // H3 is a child of the current H2 or the top-level section if no H2 exists
        if (currentH2) {
          currentH2.subSections?.push(section);
        } else {
          // If there's no H2, make it a child of the top level section
          topLevelSection.subSections?.push(section);
        }
        currentH3 = section;
        currentH4 = null;
      } else if (level === 4) {
        // H4 is a child of the current H3, or H2 if no H3 exists
        if (currentH3) {
          currentH3.subSections?.push(section);
        } else if (currentH2) {
          currentH2.subSections?.push(section);
        } else {
          // If neither H2 nor H3 exists, add to top level
          topLevelSection.subSections?.push(section);
        }
        currentH4 = section;
      } else if (level > 4) {
        // For H5 and H6, place them under the closest parent (H4, H3, H2, or top-level)
        if (currentH4) {
          currentH4.subSections?.push(section);
        } else if (currentH3) {
          currentH3.subSections?.push(section);
        } else if (currentH2) {
          currentH2.subSections?.push(section);
        } else {
          topLevelSection.subSections?.push(section);
        }
      } else if (level === 1 && index > 0) {
        // Additional H1s (not the page title) should go under top level
        topLevelSection.subSections?.push(section);
      }
      
      // Process list items that follow this heading
      let nextElement = heading.nextElementSibling;
      while (nextElement) {
        // If we hit another heading, stop processing
        if (nextElement.tagName.match(/^H[1-6]$/i)) {
          break;
        }
        
        // If we find a list (ul/ol)
        if (nextElement.tagName === 'UL' || nextElement.tagName === 'OL') {
          const listItems = nextElement.querySelectorAll('li');
          
          listItems.forEach((li, liIndex) => {
            // Get text from the first paragraph in the list item, or use the list item text
            const liParagraph = li.querySelector('p');
            const liText = liParagraph?.textContent?.trim() || li.textContent?.trim() || `List item ${liIndex + 1}`;
            
            // Find any strong elements within the list item
            const strongInLi = li.querySelector('strong, b');
            const strongText = strongInLi?.textContent?.trim();
            
            // Generate an ID for this list item
            const liId = this.generateSectionId(`${section.title}-item-${liIndex}`);
            
            // Create a section for this list item
            const listItemSection: ContentSection = {
              id: liId,
              title: strongText || liText,
              level: section.level + 1, // One level deeper than parent heading
              subSections: []
            };
            
            // Add the list item section to its parent heading section
            section.subSections?.push(listItemSection);
            
            // Add ID to the list item in the content
            li.id = liId;
          });
        }
        
        nextElement = nextElement.nextElementSibling;
      }
    });

    // Process paragraphs with strong/bold elements that are directly used as section headers
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
            
            // Store in the map
            sectionMap[boldSectionId] = boldSection;
            
            // Determine where to add this section
            if (currentH3) {
              currentH3.subSections?.push(boldSection);
            } else if (currentH2) {
              currentH2.subSections?.push(boldSection);
            } else {
              topLevelSection.subSections?.push(boldSection);
            }
          }
        }
      }
    });

    // Clean up any empty subsections arrays to reduce clutter
    const cleanSections = (section: ContentSection) => {
      if (!section.subSections || section.subSections.length === 0) {
        delete section.subSections;
        return;
      }
      
      for (const subSection of section.subSections) {
        cleanSections(subSection);
      }
    };
    
    // Clean up the section structure
    for (const section of sections) {
      cleanSections(section);
    }

    // Log the final structure for debugging
    console.log('Final section structure:', JSON.stringify(sections, null, 2));

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

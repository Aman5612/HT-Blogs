import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Article } from '../interface/article.interface';
import { ContentSection } from '../components/sidebar/sidebar.component';
import { makeStateKey, TransferState } from '@angular/core';
import { environment } from '../../environments/environment';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

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
  relatedBlogs?: any[];
  keywords?: string;
  customTitle?: string;
  excerpt?: string;
  featureImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NewBlogService {
  private apiUrl = environment.apiUrl;
  private transferState = inject(TransferState);
  // Track processed content and IDs
  private processedContentTitles = new Set<string>();
  private usedIds = new Set<string>();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getAllPosts(): Observable<Article[]> {
    const postsKey = makeStateKey<Article[]>('all-posts');

    // Check if we have the posts in transferState already (client-side)
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(postsKey)
    ) {
      const posts = this.transferState.get<Article[]>(postsKey, []);
      this.transferState.remove(postsKey); // Remove to avoid using stale data
      return of(posts);
    }

    // If not, fetch from API
    return this.http.get<Article[]>(`${this.apiUrl}/posts`).pipe(
      map((posts) => {
        // On server, store in transfer state for client to use
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(postsKey, posts);
        }
        return posts;
      }),
      catchError((err) => {
        console.error('Error fetching posts:', err);
        return of([]);
      })
    );
  }

  getMostReadArticles(): Observable<Article[]> {
    const mostReadKey = makeStateKey<Article[]>('most-read-articles');

    // Check if we have most read articles in transferState already (client-side)
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(mostReadKey)
    ) {
      const mostRead = this.transferState.get<Article[]>(mostReadKey, []);
      this.transferState.remove(mostReadKey); // Remove to avoid using stale data
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

        // On server, store in transfer state for client to use
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(mostReadKey, mostReadArticles);
        }

        return mostReadArticles;
      }),
      catchError((err) => {
        console.error('Error fetching most read articles:', err);
        return of([]);
      })
    );
  }

  getPost(id: string): Observable<BlogPost | null> {
    // Create unique key for this specific post
    const postKey = makeStateKey<BlogPost>(`blog-post-${id}`);

    // On client, check if we have post in transfer state
    if (
      isPlatformBrowser(this.platformId) &&
      this.transferState.hasKey(postKey)
    ) {
      const post = this.transferState.get<BlogPost>(
        postKey,
        null as unknown as BlogPost
      );
      this.transferState.remove(postKey); // Clean up after use

      console.log(`Retrieved post ${id} from transfer state (client)`);
      return of(post);
    }

    // Fetch from API if not in transfer state
    return this.http.get<any>(`${this.apiUrl}/posts/${id}`).pipe(
      map((res) => {
        if (res) {
          // Process the blog post content to extract sections
          const processedContent = this.processContent(res.content, res.title);

          const blogPost: BlogPost = {
            id: res.id,
            title: res.title,
            content: processedContent.processedContent,
            imageUrl: res.featureImage,
            featureImage: res.featureImage,
            slug: res.slug,
            metaTitle: res.metaTitle,
            metaDescription: res.metaDescription,
            author: res.author || 'HTBlogs Team',
            date: res.publishedDate || res.createdAt,
            tags: res.tags || [],
            sections: processedContent.sections,
            packageIds: res.packageIds || [],
            relatedBlogs: res.relatedBlogs || [],
            keywords: res.keywords || '',
            customTitle: res.customTitle || res.title,
            excerpt: res.excerpt || '',
            createdAt: res.createdAt || '',
            updatedAt: res.updatedAt || '',
          };

          // On server, store in transfer state for client to use
          if (isPlatformServer(this.platformId)) {
            console.log(`Storing post ${id} in transfer state (server)`);
            this.transferState.set(postKey, blogPost);
          }

          return blogPost;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching post:', error);
        return of(null);
      })
    );
  }

  private processContent(
    content: string,
    title: string
  ): { processedContent: string; sections: ContentSection[] } {
    // Reset tracking sets for new content processing
    this.processedContentTitles.clear();
    this.usedIds.clear();

    // For server-side rendering, we need a different approach
    if (isPlatformServer(this.platformId)) {
      // Create a basic section structure without DOM manipulation
      const sections: ContentSection[] = [
        {
          id: 'main-title',
          title: title,
          level: 1,
          subSections: [],
        },
      ];

      return {
        processedContent: content,
        sections: sections,
      };
    }

    // Client-side processing with DOM manipulation
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
      subSections: [],
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

      // Generate a unique ID for this heading
      const id = this.generateUniqueId(title);

      // Add id to the heading in the content
      heading.id = id;

      // Check if this heading has a strong element and use its text if available
      const strongElement = heading.querySelector('strong');
      const headingTitle = strongElement
        ? strongElement.textContent?.trim()
        : title;

      // Mark this title as processed
      this.processedContentTitles.add(headingTitle || title);

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
            const liText =
              liParagraph?.textContent?.trim() ||
              li.textContent?.trim() ||
              `List item ${liIndex + 1}`;

            // Find any strong elements within the list item
            const strongInLi = li.querySelector('strong, b');
            const strongText = strongInLi?.textContent?.trim();
            const itemTitle = strongText || liText;

            // Mark this title as processed
            this.processedContentTitles.add(itemTitle);

            // Create a unique ID for this list item, ensuring the index is included
            const liId = this.generateUniqueId(
              `${section.title}-item-${liIndex}`
            );

            // Create a section for this list item
            const listItemSection: ContentSection = {
              id: liId,
              title: itemTitle,
              level: section.level + 1, // One level deeper than parent heading
              subSections: [],
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
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const boldElements = paragraph.querySelectorAll('strong, b');

      if (boldElements.length > 0) {
        // Consider paragraphs starting with bold text as important sections
        const firstBold = boldElements[0];

        if (
          firstBold &&
          paragraph.textContent?.startsWith(firstBold.textContent || '')
        ) {
          const boldText = firstBold.textContent?.trim();

          // Skip this paragraph if the bold text has already been processed
          if (
            boldText &&
            boldText.length > 5 &&
            !this.processedContentTitles.has(boldText)
          ) {
            // Generate a unique ID for this bold text section
            const boldSectionId = this.generateUniqueId(
              `${boldText}-p${paragraphIndex}`
            );

            // Add ID to the containing paragraph
            paragraph.id = boldSectionId;

            // Create section for the bold text
            const boldSection: ContentSection = {
              id: boldSectionId,
              title: boldText,
              level: 4, // Treat as level 4 heading
              subSections: [],
            };

            // Mark this title as processed
            this.processedContentTitles.add(boldText);

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

  /**
   * Generates a unique ID for a section title, ensuring no duplicates exist
   */
  private generateUniqueId(title: string): string {
    // First create a base ID from the title
    const baseId = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
      .substring(0, 40); // Limit length

    // If this exact ID has been used before, make it unique by adding a counter
    let uniqueId = baseId;
    let counter = 1;

    while (this.usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    // Record that we've used this ID
    this.usedIds.add(uniqueId);

    return uniqueId;
  }
}

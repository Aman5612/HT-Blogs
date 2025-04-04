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
  private blogpost =  {
    "id": "7303320c-f9d6-4853-ae6c-6070cfddceba",
    "title": "The Ultimate Guide to Luxury Experiences in Qatar",
    "content": "<p dir=\"auto\">Qatar is synonymous with opulence, offering travelers world-class luxury experiences that blend tradition with modernity. From lavish hotels and fine dining to high-end shopping and exclusive adventures, Qatar is the perfect destination for those seeking the finer things in life. Here’s your ultimate guide to luxury experiences in Qatar.</p><p style=\"text-align: left\" dir=\"auto\"></p><p dir=\"auto\"><div style=\"text-align: center;\" class=\"image\"><img height=\"auto\" style=\"\" class=\"image\" src=\"https://d12g53icgxmb2x.cloudfront.net/1743138019649-image.png\" alt=\"A serene waterfall flows in a resort, surrounded by a gazebo and a sparkling pool, creating a tranquil atmosphere.\" flipx=\"false\" flipy=\"false\" align=\"center\" inline=\"false\"></div></p><h3 style=\"text-align: left; line-height: 1.4em\" dir=\"auto\"><span><strong>1. Stay at the Most Luxurious Hotels</strong></span></h3><p dir=\"auto\"></p><p dir=\"auto\">Qatar boasts some of the most extravagant hotels in the world, offering unparalleled hospitality and stunning architecture.</p><ul><li><p dir=\"auto\"><strong>The Ritz-Carlton, Doha:</strong> A blend of Arabian elegance and contemporary design with a private marina.</p></li><li><p dir=\"auto\"><strong>Banana Island Resort by Anantara:</strong> A private island escape with overwater villas and world-class wellness facilities.</p></li><li><p dir=\"auto\"><strong>The St. Regis Doha:</strong> Renowned for its butler service, pristine beaches, and fine dining options. <strong>Tip:</strong> Book a suite with a private pool for the ultimate indulgence.</p></li></ul><h3 style=\"line-height: 1.4em\" dir=\"auto\"><strong>2. Fine Dining at Michelin-Starred &amp; High-End Restaurants</strong></h3><p dir=\"auto\"></p><p dir=\"auto\"><div style=\"text-align: center;\" class=\"image\"><img height=\"auto\" style=\"\" class=\"image\" src=\"https://d12g53icgxmb2x.cloudfront.net/1743138112462-image.png\" alt=\" A large chandelier elegantly hangs from the ceiling of a restaurant, adding a touch of sophistication to the ambiance.\" flipx=\"false\" flipy=\"false\" align=\"center\" inline=\"false\"></div></p><p dir=\"auto\">Qatar is a paradise for food connoisseurs, offering gourmet experiences crafted by world-renowned chefs.</p><ul><li><p dir=\"auto\"><strong>IDAM by Alain Ducasse (Museum of Islamic Art):</strong> A luxurious fusion of French cuisine with Arabic flavors.</p></li><li><p dir=\"auto\"><strong>Hakkasan Doha:</strong> An upscale Cantonese restaurant with a glamorous ambiance.</p></li><li><p dir=\"auto\"><strong>Morimoto Doha:</strong> A Japanese fine-dining experience by the legendary Chef Masaharu Morimoto. <strong>Tip:</strong> Reserve a private dining room for an exclusive experience.</p></li></ul><h3 style=\"line-height: 1.4em\" dir=\"auto\"><strong>3. High-End Shopping in Qatar’s Luxury Malls</strong></h3><p dir=\"auto\"></p><p dir=\"auto\"><div style=\"text-align: center;\" class=\"image\"><img height=\"auto\" style=\"\" class=\"image\" src=\"https://d12g53icgxmb2x.cloudfront.net/1743138079940-image.png\" alt=\"Place Vendôme Mall in Lusail, Qatar – a luxury shopping destination inspired by French architecture, featuring high-end shops, restaurants, and cafes\" flipx=\"false\" flipy=\"false\" align=\"center\" inline=\"false\"></div></p><p dir=\"auto\"></p><p dir=\"auto\">Indulge in retail therapy at Qatar’s ultra-luxurious shopping destinations.</p><ul><li><p dir=\"auto\"><strong>Place Vendôme Mall:</strong> Inspired by Parisian elegance, home to top designer brands.</p></li><li><p dir=\"auto\"><strong>The Pearl-Qatar:</strong> A high-end shopping and lifestyle hub with waterfront views.</p></li><li><p dir=\"auto\"><strong>Villaggio Mall:</strong> A Venetian-inspired mall featuring luxury boutiques like Gucci, Louis Vuitton, and Dior. <strong>Tip:</strong> Look for limited-edition collections exclusive to Qatar.</p></li></ul><h3 style=\"line-height: 1.4em\" dir=\"auto\"><strong>4. Exclusive Desert &amp; Private Yacht Experiences</strong></h3><p dir=\"auto\"></p><p dir=\"auto\"><div style=\"text-align: center;\" class=\"image\"><img height=\"auto\" style=\"\" class=\"image\" src=\"https://d12g53icgxmb2x.cloudfront.net/1743138102310-image.png\" alt=\"A luxury yacht glides through the ocean, silhouetted against a vibrant sunset sky.\" flipx=\"false\" flipy=\"false\" align=\"center\" inline=\"false\"></div></p><p dir=\"auto\"></p><p dir=\"auto\">Qatar offers unique adventure experiences that combine luxury with thrill.</p><ul><li><p dir=\"auto\"><strong>Private Desert Safari:</strong> Enjoy a VIP dune-bashing experience, followed by a gourmet dinner in a luxury desert camp.</p></li><li><p dir=\"auto\"><strong>Luxury Yacht Cruise:</strong> Charter a private yacht from The Pearl-Qatar and explore the Arabian Gulf in style. <strong>Tip:</strong> Opt for a sunset cruise for breathtaking views of the Doha skyline.</p></li></ul><p dir=\"auto\">Qatar is a top destination for luxury seekers, offering experiences that redefine extravagance. Whether you’re indulging in five-star hospitality, dining at Michelin-starred restaurants, or embarking on private adventures, Qatar ensures an unforgettable, high-end experience.</p>",
    "slug": "the-ultimate-guide-to-luxury-experiences-in-qatar",
    "excerpt": "Discover the finest luxury experiences in Qatar, from opulent hotels and Michelin-star dining to private desert safaris and VIP shopping. Plan your lavish getaway today!",
    "status": "PUBLISHED",
    "authorId": "eebfd4bc-f4dd-47bd-8fb0-320f5c3933bf",
    "createdAt": "2025-03-28T05:19:30.685Z",
    "updatedAt": "2025-03-28T05:19:30.685Z",
    "metaTitle": "The Ultimate Guide to Luxury Experiences in Qatar | Exclusive Travel Tips",
    "metaDescription": "Discover the finest luxury experiences in Qatar, from opulent hotels and Michelin-star dining to private desert safaris and VIP shopping. Plan your lavish getaway today!",
    "featureImage": "https://d12g53icgxmb2x.cloudfront.net/1743137895789-w=2160 (6).avif",
    "featureImageAlt": "An image of the Louis Vuitton store in Qatar",
    "packageIds": [],
    "author": {
        "id": "eebfd4bc-f4dd-47bd-8fb0-320f5c3933bf",
        "name": "Super Admin",
        "email": "amankumartiwari392@gmail.com"
    },
    "media": [
        {
            "id": "5b1afda9-58ab-45bf-942f-067b9106e856",
            "postId": "7303320c-f9d6-4853-ae6c-6070cfddceba",
            "url": "https://d12g53icgxmb2x.cloudfront.net/1743138019649-image.png",
            "type": "image",
            "createdAt": "2025-03-28T05:19:30.764Z",
            "alt": "A serene waterfall flows in a resort, surrounded by a gazebo and a sparkling pool, creating a tranquil atmosphere."
        },
        {
            "id": "58cd721f-2219-4973-a769-256e7ec9feaf",
            "postId": "7303320c-f9d6-4853-ae6c-6070cfddceba",
            "url": "https://d12g53icgxmb2x.cloudfront.net/1743138112462-image.png",
            "type": "image",
            "createdAt": "2025-03-28T05:19:30.768Z",
            "alt": " A large chandelier elegantly hangs from the ceiling of a restaurant, adding a touch of sophistication to the ambiance."
        },
        {
            "id": "71452e75-292f-42cd-9643-41625c769d8b",
            "postId": "7303320c-f9d6-4853-ae6c-6070cfddceba",
            "url": "https://d12g53icgxmb2x.cloudfront.net/1743138079940-image.png",
            "type": "image",
            "createdAt": "2025-03-28T05:19:30.769Z",
            "alt": "Place Vendôme Mall in Lusail, Qatar – a luxury shopping destination inspired by French architecture, featuring high-end shops, restaurants, and cafes"
        },
        {
            "id": "cc4f5525-d528-43fb-a651-3ab00cf7b7cb",
            "postId": "7303320c-f9d6-4853-ae6c-6070cfddceba",
            "url": "https://d12g53icgxmb2x.cloudfront.net/1743138102310-image.png",
            "type": "image",
            "createdAt": "2025-03-28T05:19:30.771Z",
            "alt": "A luxury yacht glides through the ocean, silhouetted against a vibrant sunset sky."
        }
    ]
}
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
        return of([this.blogpost] as any[]);
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
        console.log("level 2", section);
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

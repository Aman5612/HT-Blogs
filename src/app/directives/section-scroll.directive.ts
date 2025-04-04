import { Directive, ElementRef, HostListener, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appSectionScroll]',
  standalone: true
})
export class SectionScrollDirective implements AfterViewInit {
  
  constructor(private el: ElementRef) {}
  
  ngAfterViewInit() {
    // Add click handlers to all section elements within the content
    this.addClickHandlersToSections();
  }
  
  private addClickHandlersToSections() {
    setTimeout(() => {
      // Get all elements with IDs that might be sections
      const container = this.el.nativeElement;
      console.log('SectionScroll: Adding click handlers to elements in container', container);
      
      // Look specifically for h3 elements with strong tags (very common in blogs)
      const headingsWithStrong = container.querySelectorAll('h3 strong, h3 b');
      console.log(`SectionScroll: Found ${headingsWithStrong.length} headings with strong/bold tags`);
      
      headingsWithStrong.forEach((strongElement: Element, index: number) => {
        const parentHeading = strongElement.closest('h3') as HTMLElement;
        if (parentHeading) {
          const text = strongElement.textContent?.trim() || `strong-section-${index}`;
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .substring(0, 50);
          
          // Add ID to the parent heading if it doesn't have one
          if (!parentHeading.id) {
            parentHeading.id = id;
            console.log(`SectionScroll: Added ID to heading with strong: ${id}`);
          }
          
          // Make both the heading and strong element clickable
          this.makeElementClickable(parentHeading);
          this.makeElementClickable(strongElement as HTMLElement, parentHeading.id);
        }
      });
      
      // First find all headings
      const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      console.log(`SectionScroll: Found ${headings.length} headings with IDs`);
      headings.forEach((heading: Element) => {
        if (heading.id) {
          console.log(`SectionScroll: Adding click handler to heading with ID: ${heading.id}`);
          this.makeElementClickable(heading as HTMLElement);
        }
      });
      
      // Find headings that might not have IDs and add IDs to them
      const headingsWithoutIds = container.querySelectorAll('h1:not([id]), h2:not([id]), h3:not([id]), h4:not([id]), h5:not([id]), h6:not([id])');
      console.log(`SectionScroll: Found ${headingsWithoutIds.length} headings without IDs`);
      headingsWithoutIds.forEach((heading: Element, index: number) => {
        const text = heading.textContent?.trim() || `section-${index}`;
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 50);
        
        heading.id = id;
        console.log(`SectionScroll: Added ID to heading: ${id}`);
        this.makeElementClickable(heading as HTMLElement);
      });
      
      // Find headings with strong tags that might need special handling
      const strongInHeadings = container.querySelectorAll('h1 strong, h2 strong, h3 strong, h4 strong, h5 strong, h6 strong');
      console.log(`SectionScroll: Found ${strongInHeadings.length} strong elements in headings`);
      strongInHeadings.forEach((strong: Element) => {
        const parentHeading = strong.closest('h1, h2, h3, h4, h5, h6') as HTMLElement;
        if (parentHeading && parentHeading.id) {
          console.log(`SectionScroll: Making strong element in heading ${parentHeading.id} clickable`);
          this.makeElementClickable(strong as HTMLElement, parentHeading.id);
        }
      });
      
      // Find paragraphs with IDs (these contain bold text sections)
      const paragraphs = container.querySelectorAll('p[id]');
      paragraphs.forEach((paragraph: Element) => {
        if (paragraph.id) {
          this.makeElementClickable(paragraph as HTMLElement);
          
          // Also make bold elements within paragraphs clickable
          const boldElements = paragraph.querySelectorAll('strong, b');
          boldElements.forEach((bold: Element) => {
            this.makeElementClickable(bold as HTMLElement, paragraph.id);
          });
        }
      });
      
      // Find lists with IDs
      const lists = container.querySelectorAll('ul[id], ol[id]');
      lists.forEach((list: Element) => {
        if (list.id) {
          this.makeElementClickable(list as HTMLElement);
        }
      });
      
      // Find blockquotes with IDs
      const quotes = container.querySelectorAll('blockquote[id]');
      quotes.forEach((quote: Element) => {
        if (quote.id) {
          this.makeElementClickable(quote as HTMLElement);
        }
      });
    }, 500); // Give DOM more time to render
  }
  
  private makeElementClickable(element: HTMLElement, targetId?: string) {
    // Add visual indication that this is clickable
    element.style.cursor = 'pointer';
    
    // For headings, add a link icon that appears on hover
    if (element.tagName.match(/^H[1-6]$/i)) {
      element.classList.add('section-link-target');
      
      // Create the link icon
      const linkIcon = document.createElement('span');
      linkIcon.innerHTML = '🔗';
      linkIcon.className = 'section-link-icon';
      linkIcon.style.fontSize = '16px';
      linkIcon.style.marginLeft = '6px';
      linkIcon.style.opacity = '0';
      linkIcon.style.transition = 'opacity 0.2s ease';
      
      // Add hover effect to show the link icon
      element.addEventListener('mouseenter', () => {
        linkIcon.style.opacity = '0.5';
      });
      
      element.addEventListener('mouseleave', () => {
        linkIcon.style.opacity = '0';
      });
      
      // Add the icon to the heading
      element.appendChild(linkIcon);
    }
    
    // Add click handler
    element.addEventListener('click', (event) => {
      const id = targetId || element.id;
      if (id) {
        // Scroll to this element
        this.scrollToSection(id);
        event.stopPropagation();
      }
    });
  }
  
  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    // Add highlight effect
    element.classList.add('highlight-section');
    
    // Calculate scroll position
    const headerOffset = 80;
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const targetPosition = elementTop - headerOffset;
    
    // Get the current scroll position
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    
    // Smooth scroll implementation with easing
    const duration = 800; // ms - longer duration for smoother scroll
    let start: number | null = null;
    
    // Easing function for smoother animation
    const easeInOutQuad = (t: number): number => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };
    
    const animateScroll = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutQuad(progress);
      
      window.scrollTo({
        top: startPosition + distance * easeProgress,
        behavior: 'auto' // We're handling the animation ourselves
      });
      
      if (elapsed < duration) {
        window.requestAnimationFrame(animateScroll);
      } else {
        // Final adjustment to ensure we're at the exact position
        window.scrollTo({
          top: targetPosition,
          behavior: 'auto'
        });
      }
    };
    
    window.requestAnimationFrame(animateScroll);
    
    // Update sidebar selection by dispatching an event
    window.dispatchEvent(new CustomEvent('section-visible', {
      detail: { sectionId }
    }));
    
    // Remove highlight after animation
    setTimeout(() => {
      element.classList.remove('highlight-section');
    }, 2000);
  }
} 
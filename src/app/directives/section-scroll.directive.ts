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
      
      // First find all headings
      const headings = container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
      headings.forEach((heading: Element) => {
        if (heading.id) {
          this.makeElementClickable(heading as HTMLElement);
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
    }, 300); // Give DOM time to render
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
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    
    // Smooth scroll to section
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
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
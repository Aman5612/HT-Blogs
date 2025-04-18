import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

export interface ContentSection {
  id: string;
  title: string;
  level: number;
  subSections?: ContentSection[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() sections: any = [];
  @Input() blogTitle: string = '';
  @Output() sectionClick = new EventEmitter<string>();
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;

  selectedSection: string | null = null;
  expandedSections: string[] = [];
  arrowIconPath = '/assets/icons/Arrow_icon_gray.svg';
  isFooterVisible = false;
  private footerObserver: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // For tracking sections in ngFor
  trackById(index: number, item: any): string {
    return item.id || index.toString();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Log when sections input changes
    if (changes['sections']) {
      console.log(
        'Sidebar - Sections input changed:',
        JSON.stringify(this.sections, null, 2)
      );

      // Log section type for debugging
      if (this.sections) {
        console.log(
          'Sidebar - Sections type:',
          Array.isArray(this.sections) ? 'Array' : typeof this.sections
        );
        console.log(
          'Sidebar - Sections length:',
          Array.isArray(this.sections) ? this.sections.length : 'N/A'
        );

        // If sections is an array, log first item structure
        if (Array.isArray(this.sections) && this.sections.length > 0) {
          console.log(
            'Sidebar - First section structure:',
            JSON.stringify(this.sections[0], null, 2)
          );

          // Check for subsections property
          if (this.sections[0].subsections) {
            console.log(
              'Sidebar - First section has subsections property with length:',
              this.sections[0].subsections.length
            );
          } else {
            console.log(
              'Sidebar - First section does not have subsections property'
            );
          }
        }
      }
    }
  }

  private sectionVisibilityHandler = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.sectionId) {
      // Only update the selected section indicator, but don't scroll or expand
      this.selectedSection = customEvent.detail.sectionId;

      // Removed automatic expansion and scrolling
      // Do not call expandSectionForId() or scrollSidebarToActiveSection()
    }
  };

  ngOnInit() {
    window.addEventListener('section-visible', this.sectionVisibilityHandler);

    // Log sections data
    console.log(
      'Sidebar ngOnInit - Received sections data:',
      JSON.stringify(this.sections, null, 2)
    );

    // Force reflow to make changes visible
    setTimeout(() => {
      console.log('FORCE UPDATE: Ensuring sidebar changes are applied');

      // Auto-expand top level sections when initialized
      if (this.sections && this.sections.length > 0) {
        console.log(
          'Sidebar - Sections available for auto-expand:',
          this.sections
        );

        // Handle direct tableOfContents sections array
        if (Array.isArray(this.sections)) {
          console.log('Sidebar - Processing array of sections directly');

          // Expand only the first section if it exists
          if (this.sections.length > 0) {
            const firstSection = this.sections[0];
            if (firstSection && firstSection.id) {
              // Just expand the first section
              this.expandedSections = [firstSection.id];
              console.log(
                'Sidebar - Auto-expanded first section:',
                firstSection.id
              );

              // Auto-select first subsection if available
              if (
                firstSection.subsections &&
                firstSection.subsections.length > 0
              ) {
                this.selectedSection = firstSection.subsections[0].id;
                console.log(
                  'Sidebar - Auto-selected first subsection:',
                  firstSection.subsections[0].id
                );
              }
            }
          }
        } else if (this.sections[0]?.subSections) {
          // Expand just the first top level section
          const topLevelSection = this.sections[0].subSections[0];
          if (topLevelSection && topLevelSection.id) {
            this.expandedSections = [topLevelSection.id];
            console.log(
              'Sidebar - Auto-expanded top level section:',
              topLevelSection.id
            );
          }
        }
      } else {
        console.warn('Sidebar - No sections available for auto-expand');
      }
    }, 200);

    if (isPlatformBrowser(this.platformId)) {
      this.initFooterObserver();
    }
  }

  private initFooterObserver() {
    const footer = document.querySelector('app-footer');
    if (!footer) return;

    this.footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isFooterVisible = entry.isIntersecting;

          // If the footer is visible, adjust the sidebar to prevent overlap
          if (entry.isIntersecting && this.sidebarContainer) {
            const footerTop = entry.boundingClientRect.top;
            const viewportHeight = window.innerHeight;
            const offset = Math.max(0, viewportHeight - footerTop);

            if (offset > 0) {
              this.sidebarContainer.nativeElement.style.maxHeight = `calc(100vh - 3rem - ${offset}px)`;
            }
          } else if (this.sidebarContainer) {
            // Reset max height when footer is not visible
            this.sidebarContainer.nativeElement.style.maxHeight = '';
          }
        });
      },
      {
        threshold: [0.1],
        rootMargin: '200px 0px 0px 0px', // Start detecting 200px before the footer enters viewport
      }
    );

    this.footerObserver.observe(footer);
  }

  ngOnDestroy() {
    window.removeEventListener(
      'section-visible',
      this.sectionVisibilityHandler
    );

    if (this.footerObserver) {
      this.footerObserver.disconnect();
    }
  }

  processTitle(title: string): string {
    if (!title) return '';

    // If title is too long, truncate it
    if (title.length > 50) {
      return title.substring(0, 50) + '...';
    }

    // Handle titles that are truncated with ellipsis (from tableOfContents)
    if (title.endsWith('...')) {
      // Keep the truncated format as is
      return title;
    }

    // Handle headings with numbered format (e.g. "1. Title")
    // Preserve the numbering but ensure proper display
    if (/^\d+\.\s/.test(title)) {
      // Keep the number and what follows
      return title;
    }

    // Remove any numeric prefix in other formats
    return title.replace(/^\d+\.\s*/, '');
  }

  onSectionClick(sectionId: string, event?: Event) {
    // Ensure we have a proper event to stop propagation
    if (event) {
      event.stopPropagation();
    }

    console.log('Sidebar: Section clicked:', sectionId);

    // Set the selected section
    this.selectedSection = sectionId;

    // If this is a top-level section with subsections, expand it
    if (Array.isArray(this.sections)) {
      // Find the parent section (if this is a subsection)
      const parentSection = this.findParentSectionId(sectionId);
      if (parentSection && !this.expandedSections.includes(parentSection)) {
        this.expandedSections.push(parentSection);
      }

      // For tableOfContents format
      for (const section of this.sections) {
        if (
          section.id === sectionId &&
          section.subsections &&
          section.subsections.length > 0
        ) {
          // If clicking on a section with subsections, ensure it's expanded
          if (!this.expandedSections.includes(sectionId)) {
            this.expandedSections.push(sectionId);
          }
          console.log('Expanded section with subsections:', sectionId);
        }
      }
    } else if (
      this.sections &&
      this.sections.length > 0 &&
      this.sections[0].subSections
    ) {
      // For ContentSection format
      const section = this.findSectionById(sectionId);
      if (section && section.subSections && section.subSections.length > 0) {
        // If clicking on a section with subsections, ensure it's expanded
        if (!this.expandedSections.includes(sectionId)) {
          this.expandedSections.push(sectionId);
        }
      }

      // Find the parent section (if this is a subsection)
      const parentSection = this.findParentSectionId(sectionId);
      if (parentSection && !this.expandedSections.includes(parentSection)) {
        this.expandedSections.push(parentSection);
      }
    }

    // Always emit event to scroll to section (whether it's a section or subsection)
    this.sectionClick.emit(sectionId);
    console.log('Sidebar: Event emitted for section navigation:', sectionId);
  }

  onSubSectionClick(event: Event, sectionId: string) {
    event.stopPropagation();
    console.log('Sidebar: Subsection clicked:', sectionId);

    // Set the selected section
    this.selectedSection = sectionId;

    // We're not toggling expansion when clicking directly on the section
    // This ensures clicking on a section just navigates without collapsing

    // Emit event to scroll to section IMMEDIATELY
    this.sectionClick.emit(sectionId);
    console.log('Sidebar: Event emitted for subsection:', sectionId);
  }

  private findParentSectionId(sectionId: string): string | null {
    // More comprehensive parent section finder
    // First check direct H2 sections
    for (const h2Section of this.sections[0]?.subSections || []) {
      if (h2Section.id === sectionId) {
        return h2Section.id;
      }

      // Check H3 sections
      for (const h3Section of h2Section.subSections || []) {
        if (h3Section.id === sectionId) {
          return h2Section.id; // Return H2 parent for better hierarchy
        }

        // Check H4 or other nested sections
        for (const nestedSection of h3Section.subSections || []) {
          if (nestedSection.id === sectionId) {
            return h3Section.id; // Return H3 parent for this nested section
          }

          // Check even deeper nesting if exists
          for (const deepNestedSection of nestedSection.subSections || []) {
            if (deepNestedSection.id === sectionId) {
              return nestedSection.id;
            }
          }
        }
      }
    }

    return null;
  }

  private expandSectionForId(sectionId: string) {
    // Find parent section hierarchy for this section ID
    for (const h2Section of this.sections[0]?.subSections || []) {
      // Check if this is a H2 section
      if (h2Section.id === sectionId) {
        this.expandedSections = [h2Section.id];
        return;
      }

      // Check H3 sections
      for (const h3Section of h2Section.subSections || []) {
        if (h3Section.id === sectionId) {
          this.expandedSections = [h3Section.id];
          return;
        }

        // Look for this ID in H3's subsections
        for (const nestedSection of h3Section.subSections || []) {
          if (nestedSection.id === sectionId) {
            // Expand both the H3 parent and potentially the nested section
            this.expandedSections = [h3Section.id];

            // If the nested section has its own subsections, expand it too
            if (nestedSection.subSections?.length) {
              this.expandedSections.push(nestedSection.id);
            }
            return;
          }

          // Check even deeper nesting
          for (const deepNestedSection of nestedSection.subSections || []) {
            if (deepNestedSection.id === sectionId) {
              // Expand the whole chain
              this.expandedSections = [h3Section.id, nestedSection.id];
              return;
            }
          }
        }
      }
    }
  }

  isExpanded(sectionId: string): boolean {
    return this.expandedSections.includes(sectionId);
  }

  // Check if a section has nested subsections
  private hasNestedSubSections(sectionId: string): boolean {
    // Search through the entire section tree
    for (const h2Section of this.sections[0]?.subSections || []) {
      for (const h3Section of h2Section.subSections || []) {
        for (const nestedSection of h3Section.subSections || []) {
          if (
            nestedSection.id === sectionId &&
            nestedSection.subSections &&
            nestedSection.subSections.length > 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Toggle expansion of nested subsections
  private toggleSectionExpansion(sectionId: string, event?: Event): void {
    // If event is provided, stop it from propagating to parent handlers
    if (event) {
      event.stopPropagation();
    }

    console.log('Toggling section expansion for:', sectionId);

    if (this.expandedSections.includes(sectionId)) {
      // If already expanded, collapse it
      this.expandedSections = this.expandedSections.filter(
        (id) => id !== sectionId
      );
    } else {
      // Otherwise expand it, keeping other expanded sections
      this.expandedSections = [...this.expandedSections, sectionId];

      // If this is a section with a parent, make sure the parent is expanded too
      const parentId = this.findParentSectionId(sectionId);
      if (parentId && !this.expandedSections.includes(parentId)) {
        this.expandedSections.push(parentId);
      }
    }
  }

  // Helper to find a section by ID from the entire section tree
  private findSectionById(sectionId: string): ContentSection | null {
    // Look through all sections at all levels
    for (const rootSection of this.sections) {
      if (rootSection.id === sectionId) return rootSection;

      // Check first level
      if (rootSection.subSections) {
        for (const level1 of rootSection.subSections) {
          if (level1.id === sectionId) return level1;

          // Check second level
          if (level1.subSections) {
            for (const level2 of level1.subSections) {
              if (level2.id === sectionId) return level2;

              // Check third level
              if (level2.subSections) {
                for (const level3 of level2.subSections) {
                  if (level3.id === sectionId) return level3;

                  // Check fourth level
                  if (level3.subSections) {
                    for (const level4 of level3.subSections) {
                      if (level4.id === sectionId) return level4;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return null;
  }

  // Replace the existing private toggleSectionExpansion method
  private _toggleSectionExpansion(sectionId: string) {
    // This is deprecated, just delegate to the public method
    this.toggleSectionExpansion(sectionId);
  }

  // Add this method to identify list items vs regular sections
  isListItem(section: ContentSection): boolean {
    // Check if this section is likely a list item based on its ID or title
    if (!section) return false;

    // Check if ID contains item, li, or list
    if (
      section.id.includes('-item-') ||
      section.id.includes('-li-') ||
      section.id.includes('list-item')
    ) {
      return true;
    }

    // Check if it has the right level (typically one level below its parent)
    // List items are usually at level 4 or 5 (below h3 or h4)
    if (section.level === 4 || section.level === 5) {
      // Additional heuristic: list items typically start with a bullet or have shorter titles
      if (
        section.title.startsWith('•') ||
        section.title.startsWith('-') ||
        section.title.length < 100
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Scrolls the sidebar to make the active section visible
   */
  private scrollSidebarToActiveSection(): void {
    setTimeout(() => {
      // Use setTimeout to ensure DOM has updated
      if (!this.selectedSection || !this.sidebarContainer) return;

      const sidebarElement = this.sidebarContainer.nativeElement as HTMLElement;
      const activeElement = sidebarElement.querySelector(
        `[class*="selected"]`
      ) as HTMLElement;

      if (activeElement) {
        // Calculate position to scroll to
        const containerTop = sidebarElement.getBoundingClientRect().top;
        const activeTop = activeElement.getBoundingClientRect().top;
        const activeHeight = activeElement.offsetHeight;
        const containerHeight = sidebarElement.clientHeight;

        // Check if element is not fully visible
        if (
          activeTop < containerTop + 80 || // Element is above visible area (with some padding)
          activeTop + activeHeight > containerTop + containerHeight - 20
        ) {
          // Element is below visible area

          // Calculate scroll position to center the element in the container
          const scrollTo =
            activeTop - containerTop - containerHeight / 2 + activeHeight / 2;

          // Smooth scroll to position
          sidebarElement.scrollBy({
            top: scrollTo,
            behavior: 'smooth',
          });

          console.log(
            'Sidebar: Scrolled to active section',
            this.selectedSection
          );
        }
      }
    }, 100);
  }

  /**
   * Only selects the section without toggling expansion
   */
  selectSectionOnly(sectionId: string, event?: Event): void {
    // Stop event propagation if provided - ensure this ALWAYS happens first
    if (event) {
      event.stopPropagation();
      event.preventDefault(); // Also prevent default behavior
    }

    console.log('Sidebar: Section selected:', sectionId);

    // Set the selected section
    this.selectedSection = sectionId;

    // Removed automatic parent expansion
    // We don't want to auto-expand parent sections when clicking

    // Emit event to scroll to section in the main content
    this.sectionClick.emit(sectionId);
    console.log('Sidebar: Navigation event emitted for section:', sectionId);

    // Removed scrollSidebarToActiveSection call
    // Let the user manually scroll the sidebar
  }

  /**
   * Only toggles expansion without selecting or navigating
   */
  toggleExpansionOnly(sectionId: string, event?: Event): void {
    // Make absolutely sure the event stops here and doesn't propagate further
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    console.log('****** Sidebar: Toggling expansion only for:', sectionId);
    console.log('****** Before toggle, expandedSections:', [
      ...this.expandedSections,
    ]);

    // Toggle expansion - if already expanded, collapse it; otherwise close all others and open this one
    if (this.expandedSections.includes(sectionId)) {
      // If already expanded, collapse it
      this.expandedSections = this.expandedSections.filter(
        (id) => id !== sectionId
      );
      console.log('****** Collapsing section:', sectionId);
    } else {
      // Close all currently expanded sections
      this.expandedSections = [sectionId];
      console.log('****** Expanding section and closing others:', sectionId);
    }

    console.log('****** After toggle, expandedSections:', [
      ...this.expandedSections,
    ]);
  }
  cleanString(input: string) {
    return input.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  // Update the convertTableOfContentsToSections method to better handle the tableOfContents structure
  convertTableOfContentsToSections(tocSections: any[]): ContentSection[] {
    if (!tocSections || !tocSections.length) {
      return [];
    }

    // Create main section
    const mainSection: ContentSection = {
      id: 'main-title',
      title: 'Content Sections',
      level: 1,
      subSections: [],
    };

    // Process each section from tableOfContents
    const topLevelSections = tocSections.map((section) => {
      const newSection: ContentSection = {
        id: section.id,
        title: section.title,
        level: 3,
        subSections: [],
      };

      // Add subsections if they exist
      if (section.subsections && section.subsections.length > 0) {
        newSection.subSections = section.subsections.map(
          (subsection: { id: string; title: string }) => ({
            id: subsection.id,
            title: subsection.title,
            level: 4,
            subSections: [],
          })
        );
      }

      return newSection;
    });

    // Create top level virtual section for all content
    const topLevelSection: ContentSection = {
      id: 'content-top-level',
      title: 'Content Sections',
      level: 2,
      subSections: topLevelSections,
    };

    mainSection.subSections = [topLevelSection];
    return [mainSection];
  }
}

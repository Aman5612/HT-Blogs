import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  styles: [`:host {
  position: fixed;
  top: 4.5rem;
  height: calc(100vh - 3rem);
  display: block;
  z-index: 10;
  width: 22%;
  max-width: 332px;
}

.sidebar {
  background: white;
  border-radius: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-height: 100%;
}

.title-section {
  padding: 1.25rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  z-index: 10;

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 0.5rem;
  }

  .highlights {
    font-size: 0.875rem;
    color: #666;
    font-weight: 400;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.category-header {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 1.125rem;
  padding: 12px;
  margin-top: 0.5rem;
  margin: 0.5rem 1.5rem;
  background-color: #F8F8F8;
  border-radius: 12px;
  font-size: 20px;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: #eaeaea;
  }
  
  .category-title {
    cursor: pointer;
    flex: 1;
  }
}

.sections-list {
  padding: 12px 0;
}

.section-item {
  padding: 6px 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  position: relative;
  padding: 0;
  width: 100%;
}

input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  height: 12px;
  width: 12px;
  border: 1.5px solid #D7D7D7;
  border-radius: 50%;
  flex-shrink: 0;
  background: white;

  &:after {
    content: "";
    position: absolute;
    display: none;
    top: 50%;
    left: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6F6F6F;
    transform: translate(-50%, -50%);
  }
}

input[type="radio"]:checked ~ .checkmark {
  border-color: #1a1a1a;
  &:after {
    display: block;
  }
}

.section-item:hover .checkmark {
  border-color: #1a1a1a; /* Highlight checkmark on hover */
  &:after {
    display: block;
  }
}

.section-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #F8F8F8;
  border-radius: 12px;
  transition: box-shadow 0.2s ease; /* Smooth shadow transition */
}

.section-item:hover .section-content {
  box-shadow: inset 0 0 0 1px #CFCFCF; /* Inner shadow on hover */
}

input[type="radio"]:checked ~ .section-content {
  box-shadow: inset 0 0 0 1px #CFCFCF; /* Inner shadow when selected */
}

.section-title {
  font-size: 20px;
  color: #1a1a1a;
  line-height: 1.4;
  flex-grow: 1;
  cursor: pointer;
}

.expand-icon {
  transform: rotate(0deg);
  transition: transform 0.3s ease;
  color: #666;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 5px;

  &:hover {
    background-color: #e5e5e5;
    color: #333;
  }

  &.expanded {
    transform: rotate(180deg);
  }
}

.subsections {
  margin-left: 2.5rem;
  padding: 0 0 0 0.75rem;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-in-out, margin-top 0.3s ease;
  
  &.expanded {
    max-height: 500px; /* Increased height to accommodate deeper nesting */
  }
}

.nested-subsection-item {
  font-size: 16px;
  color: #4D4D4D;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  font-weight: 400;
  padding: 6px 0;

  &:hover {
    color: #4D4D4D;
    text-decoration: underline;
  }

  &.selected {
    text-decoration: underline;
    color: #4D4D4D;
  }
}

/* Deep nesting styles */
.deep-subsections {
  margin-left: 15px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  
  &.expanded {
    max-height: 500px;
  }
}

.deep-nested-item {
  display: flex;
  align-items: center;
  padding: 5px 0;
  margin-left: 10px;
  color: #555;
  font-size: 14px;
  
  &:hover {
    color: #000;
  }
  
  &.selected {
    color: #000;
    font-weight: 500;
  }
}

/* Styles for list items in sidebar */
.list-item-entry {
  padding: 6px 0;
  margin-left: 10px;
  transition: all 0.2s;
}

.list-item-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
}

.list-bullet, .list-bullet-small {
  color: #666;
  display: inline-block;
  flex-shrink: 0;
}

.list-bullet {
  font-size: 1rem;
}

.list-bullet-small {
  font-size: 0.85rem;
}

.list-item-title {
  flex-grow: 1;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.4;
  font-weight: 400;
  padding-right: 10px;
}

.list-item-title-small {
  flex-grow: 1;
  font-size: 0.85rem;
  color: #444;
  line-height: 1.4;
  font-weight: 400;
  padding-right: 10px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
  font-size: 0.875rem;
}

// Scrollbar styling
:host {
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 2px;

  &:hover {
    background-color: #ccc;
  }
}

// Responsive adjustments
@media (max-width: 1600px) {
  :host {
    width: 22%;
  }
}

@media (max-width: 1400px) {
  :host {
    width: 22%;
    max-width: 280px;
  }
}

@media (max-width: 1200px) {
  :host {
    display: none;
  }
}

.section-level-2 {
  margin-left: 0.5rem;
}

.nested-content {
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
}

.bullet, .bullet-small {
  color: #666;
  display: inline-block;
  margin-right: 5px;
  flex-shrink: 0;
}

.bullet {
  font-size: 14px;
}

.bullet-small {
  font-size: 12px;
}

.nested-title {
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.4;
  padding-right: 20px; /* Make room for the expand icon */
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  padding: 3px 6px;
  
  &:hover {
    text-decoration: none;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.deep-nested-title {
  flex-grow: 1;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
  padding-right: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  padding: 3px 6px;
  
  &:hover {
    text-decoration: none;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.expand-icon-mini {
  transform: rotate(0deg);
  transition: transform 0.3s ease;
  color: #666;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  
  &:hover {
    background-color: #e5e5e5;
    color: #333;
  }
  
  &.expanded {
    transform: translateY(-50%) rotate(180deg);
  }
}

.list-item-entry.selected .list-item-title,
.list-item-entry.selected .list-item-title-small {
  font-weight: 500;
  color: #000;
}

.list-item-deep {
  margin-left: 20px;
  
  .list-item-content {
    padding-left: 2px;
  }
}
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() sections: ContentSection[] = [];
  @Output() sectionClick = new EventEmitter<string>();
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;

  selectedSection: string | null = null;
  expandedSections: string[] = [];

  private sectionVisibilityHandler = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.sectionId) {
      this.selectedSection = customEvent.detail.sectionId;
      
      // Find parent section (H3) of the visible section
      if (this.selectedSection) {
        this.expandSectionForId(this.selectedSection);
        // Scroll the sidebar to show the active section
        this.scrollSidebarToActiveSection();
      }
    }
  };

  ngOnInit() {
    window.addEventListener('section-visible', this.sectionVisibilityHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('section-visible', this.sectionVisibilityHandler);
  }

  processTitle(title: string): string {
    // If title is too long, truncate it
    if (title.length > 50) {
      return title.substring(0, 50) + '...';
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
    if (event) {
      event.stopPropagation();
    }
    
    console.log('Sidebar: Section clicked:', sectionId);
    
    // Set the selected section
    this.selectedSection = sectionId;
    
    // Expand this section if it has subsections
    const section = this.findSectionById(sectionId);
    if (section && section.subSections && section.subSections.length > 0) {
      this.toggleSectionExpansion(sectionId);
    }
    
    // Emit event to scroll to section
    this.sectionClick.emit(sectionId);
    console.log('Sidebar: Event emitted for section:', sectionId);
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
          if (nestedSection.id === sectionId && nestedSection.subSections && nestedSection.subSections.length > 0) {
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
      this.expandedSections = this.expandedSections.filter(id => id !== sectionId);
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
    if (section.id.includes('-item-') || section.id.includes('-li-') || section.id.includes('list-item')) {
      return true;
    }
    
    // Check if it has the right level (typically one level below its parent)
    // List items are usually at level 4 or 5 (below h3 or h4)
    if (section.level === 4 || section.level === 5) {
      // Additional heuristic: list items typically start with a bullet or have shorter titles
      if (section.title.startsWith('•') || section.title.startsWith('-') || section.title.length < 100) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Scrolls the sidebar to make the active section visible
   */
  private scrollSidebarToActiveSection(): void {
    setTimeout(() => { // Use setTimeout to ensure DOM has updated
      if (!this.selectedSection || !this.sidebarContainer) return;

      const sidebarElement = this.sidebarContainer.nativeElement as HTMLElement;
      const activeElement = sidebarElement.querySelector(`[class*="selected"]`) as HTMLElement;
      
      if (activeElement) {
        // Calculate position to scroll to
        const containerTop = sidebarElement.getBoundingClientRect().top;
        const activeTop = activeElement.getBoundingClientRect().top;
        const activeHeight = activeElement.offsetHeight;
        const containerHeight = sidebarElement.clientHeight;
        
        // Check if element is not fully visible
        if (activeTop < containerTop + 80 || // Element is above visible area (with some padding)
            activeTop + activeHeight > containerTop + containerHeight - 20) { // Element is below visible area
          
          // Calculate scroll position to center the element in the container
          const scrollTo = activeTop - containerTop - (containerHeight / 2) + (activeHeight / 2);
          
          // Smooth scroll to position
          sidebarElement.scrollBy({ 
            top: scrollTo, 
            behavior: 'smooth' 
          });
          
          console.log('Sidebar: Scrolled to active section', this.selectedSection);
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
    
    // Important: Make sure parent sections are expanded so the selection is visible
    // But NEVER collapse any sections when clicking on a title
    const parentId = this.findParentSectionId(sectionId);
    if (parentId && !this.expandedSections.includes(parentId)) {
      // Only expand parent if not already expanded - don't collapse anything
      this.expandedSections = [...this.expandedSections, parentId];
    }
    
    // Emit event to scroll to section
    this.sectionClick.emit(sectionId);
    console.log('Sidebar: Navigation event emitted for section:', sectionId);
    
    // Scroll sidebar to show the active section
    this.scrollSidebarToActiveSection();
  }
  
  /**
   * Only toggles expansion without selecting or navigating
   */
  toggleExpansionOnly(sectionId: string, event: Event): void {
    // Stop event from propagating to parent handlers
    event.stopPropagation();
    
    console.log('Sidebar: Toggling expansion only for:', sectionId);
    
    if (this.expandedSections.includes(sectionId)) {
      // If already expanded, collapse it
      this.expandedSections = this.expandedSections.filter(id => id !== sectionId);
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
}

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
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

.category-header {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 1.125rem;
  padding:12px;
  margin-top: 0.5rem;
  margin: 0.5rem 1.5rem;
  background-color: #F8F8F8;
  border-radius: 12px;
  font-size: 20px;
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
  margin-left: 1rem;
  padding: 4px 0 0 0.5rem;
  border-left: 1px dotted #ccc;
  margin-top: 3px;
}

.deep-nested-item {
  font-size: 14px;
  color: #666;
  padding: 4px 0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #333;
    text-decoration: underline;
  }
  
  &.selected {
    color: #333;
    font-weight: 500;
    text-decoration: underline;
  }
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
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() sections: ContentSection[] = [];
  @Output() sectionClick = new EventEmitter<string>();

  selectedSection: string | null = null;
  expandedSections: string[] = [];

  private sectionVisibilityHandler = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.sectionId) {
      this.selectedSection = customEvent.detail.sectionId;
      
      // Find parent section (H3) of the visible section
      if (this.selectedSection) {
        this.expandSectionForId(this.selectedSection);
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
    // console.log('Processing title:',  title.replace(/^\d+\.\s*/, ''));
    return title.replace(/^\d+\.\s*/, '');
  }

  onSectionClick(sectionId: string) {
    console.log('Sidebar: Section clicked:', sectionId);
    
    // Set the selected section
    this.selectedSection = sectionId;

    // Toggle this section's expansion
    this.toggleSectionExpansion(sectionId);
    
    // Emit event to scroll to section IMMEDIATELY (no delay)
    this.sectionClick.emit(sectionId);
    console.log('Sidebar: Event emitted for section:', sectionId);
  }

  onSubSectionClick(event: Event, sectionId: string) {
    event.stopPropagation();
    console.log('Sidebar: Subsection clicked:', sectionId);
    
    // Set the selected section
    this.selectedSection = sectionId;
    
    // Check if this subsection has its own subsections
    const hasNestedSubSections = this.hasNestedSubSections(sectionId);
    
    if (hasNestedSubSections) {
      // Toggle the expansion of this subsection
      this.toggleNestedSectionExpansion(sectionId);
    } else {
      // For leaf nodes, ensure parent is expanded
      const parentSectionId = this.findParentSectionId(sectionId);
      if (parentSectionId && !this.expandedSections.includes(parentSectionId)) {
        this.expandedSections.push(parentSectionId);
      }
    }
    
    // Emit event to scroll to section IMMEDIATELY (no delay)
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

  private toggleSectionExpansion(sectionId: string) {
    if (this.expandedSections.includes(sectionId)) {
      // If already expanded, collapse it
      this.expandedSections = [];
    } else {
      // Otherwise replace all expanded sections with just this one
      this.expandedSections = [sectionId];
    }
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
  private toggleNestedSectionExpansion(sectionId: string) {
    if (this.expandedSections.includes(sectionId)) {
      // If already expanded, remove it from expanded sections
      this.expandedSections = this.expandedSections.filter(id => id !== sectionId);
    } else {
      // Otherwise add it to expanded sections
      this.expandedSections.push(sectionId);
    }
  }
}

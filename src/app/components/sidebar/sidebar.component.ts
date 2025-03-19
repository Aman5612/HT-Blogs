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
    max-height: 200px;
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
    console.log('Processing title:',  title.replace(/^\d+\.\s*/, ''));
    return title.replace(/^\d+\.\s*/, '');
  }

  onSectionClick(sectionId: string) {
    this.selectedSection = sectionId;

    // Close all other sections and open this one
    this.toggleSectionExpansion(sectionId);
    
    // Emit event to scroll to section
    setTimeout(() => {
      this.sectionClick.emit(sectionId);
    }, 50);
  }

  onSubSectionClick(event: Event, sectionId: string) {
    event.stopPropagation();
    this.selectedSection = sectionId;
    
    // Keep only the parent section expanded
    const parentSectionId = this.findParentSectionId(sectionId);
    if (parentSectionId) {
      this.expandedSections = [parentSectionId];
    }
    
    // Emit event to scroll to section with a slight delay to ensure UI is updated
    setTimeout(() => {
      this.sectionClick.emit(sectionId);
    }, 50);
  }

  private findParentSectionId(sectionId: string): string | null {
    // Find parent H3 section for this subsection
    for (const h2Section of this.sections[0]?.subSections || []) {
      for (const h3Section of h2Section.subSections || []) {
        // Direct match with H3 section
        if (h3Section.id === sectionId) {
          return h3Section.id;
        }
        
        // Check if it's a subsection of H3
        for (const boldSection of h3Section.subSections || []) {
          if (boldSection.id === sectionId) {
            return h3Section.id;
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
    // Find parent H3 section for this subsection and expand only it
    const parentSectionId = this.findParentSectionId(sectionId);
    
    if (parentSectionId) {
      // Replace all expanded sections with just this parent
      this.expandedSections = [parentSectionId];
    }
  }

  isExpanded(sectionId: string): boolean {
    return this.expandedSections.includes(sectionId);
  }
}

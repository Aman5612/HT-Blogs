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
  styles: [`
    .sidebar {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .title-section {
      padding: 1.25rem 1.5rem;
      background: #f8f8f8;
      border-bottom: 1px solid #eee;

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 0.5rem;
      }

      .highlights {
        font-size: 0.875rem;
        color: #666;
      }
    }

    .sections-list {
      padding: 1rem 0;
    }

    .section-item {
      padding: 0.25rem 1.5rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
      position: relative;
      padding: 0.5rem 0;
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
      height: 16px;
      width: 16px;
      border: 1.5px solid #d4d4d4;
      border-radius: 50%;
      flex-shrink: 0;
      background: white;

      &:after {
        content: "";
        position: absolute;
        display: none;
        top: 50%;
        left: 50%;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #1a1a1a;
        transform: translate(-50%, -50%);
      }
    }

    input[type="radio"]:checked ~ .checkmark {
      border-color: #1a1a1a;
      &:after {
        display: block;
      }
    }

    .section-title {
      font-size: 1rem;
      color: #1a1a1a;
      line-height: 1.4;
      flex-grow: 1;
      padding-right: 0.5rem;
    }

    .subsections {
      margin-top: 0.25rem;
      padding-left: 2.25rem;
    }

    .subsection-item {
      padding: 0.5rem 0;
      font-size: 0.875rem;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: #1a1a1a;
      }

      &.selected {
        color: #1a1a1a;
        font-weight: 500;
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

    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #ddd;
      border-radius: 2px;

      &:hover {
        background-color: #ccc;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() sections: ContentSection[] = [];
  @Output() sectionClick = new EventEmitter<string>();

  selectedSection: string | null = null;

  private sectionVisibilityHandler = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.sectionId) {
      this.selectedSection = customEvent.detail.sectionId;
    }
  };

  ngOnInit() {
    window.addEventListener('section-visible', this.sectionVisibilityHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('section-visible', this.sectionVisibilityHandler);
  }

  onSectionClick(sectionId: string) {
    this.selectedSection = sectionId;
    this.sectionClick.emit(sectionId);
  }

  onSubSectionClick(event: Event, sectionId: string) {
    event.stopPropagation();
    this.selectedSection = sectionId;
    this.sectionClick.emit(sectionId);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DestinationItem {
  name: string;
  isExpanded: boolean;
  subItems?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styles: [
    `
      .sidebar {
        background: white;
        max-height: 60vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        width: 100%;
      }

      h3 {
        font-size: 20px;
        font-weight: 400;
        padding: 12px 14px;
        background: #f8f8f8;
        margin: 0 12px 12px 0px;
        border-radius: 12px;
        border-bottom: 1px solid #f0f0f0;
      }

      .destination-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
      }

      .destination-item {
        margin-bottom: 12px;
        cursor: pointer;
      }

      .destination-item-container {
        display: flex;
        gap: 16px;
        align-items: center;
      }

      .destination-header {
        display: flex;
        justify-content: space-between;
        background: #f8f8f8;
        align-items: center;
        padding: 12px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        width: 100%;
      }

      .destination-header:hover,
      .destination-header.selected {
        box-shadow: inset 0 0 0 1px #cfcfcf;
      }

      .header-content label {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .radio {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }

      .radio input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
      }

      .radio .checkmark {
        width: 14px;
        height: 14px;
        border: 1px solid #d3d3d3;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease-in-out;
      }

      .radio input:checked + .checkmark {
        border-color: #cfcfcf;
      }

      .radio input:checked + .checkmark::after {
        content: '';
        width: 8px;
        height: 8px;
        background-color: #7a7a7a;
        border-radius: 50%;
      }

      .expand-icon {
        transition: transform 0.2s;
      }

      .expand-icon.expanded {
        transform: rotate(180deg);
      }

      .sub-items {
        padding: 8px 0 8px 42px;
        transition: all 0.3s ease-in-out;
      }

      .sub-item {
        width: fit-content;
        margin-bottom: 8px;
        color: #4d4d4d;
        font-size: 16px;
        line-height: 140.3%;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: color 0.3s ease-in-out;
      }

      .sub-item::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 0;
        width: 100%;
        height: 1px;
        background: #333;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease-in-out;
      }

      .sub-item:hover::after,
      .sub-item.selected::after {
        transform: scaleX(1);
      }

      /* Scrollbar styling */
      .destination-list::-webkit-scrollbar {
        display: hidden;
        width: 0px;
      }

      .destination-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .destination-list::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 3px;
      }

      .destination-list::-webkit-scrollbar-thumb:hover {
        background: #ccc;
      }
    `,
  ],
})
export class SidebarComponent {
  destinations: DestinationItem[] = [
    {
      name: 'Sydney',
      isExpanded: false,
      subItems: ['Highlights', 'Best Time to Visit'],
    },
    {
      name: 'Great Barrier Reef',
      isExpanded: false,
      subItems: ['Highlights', 'Best Time to Visit'],
    },
    {
      name: 'Melbourne',
      isExpanded: false,
      subItems: ['Highlights', 'Best Time to Visit'],
    },
    {
      name: 'Uluru (Ayers Rock)',
      isExpanded: false,
      subItems: ['Highlights', 'Best Time to Visit'],
    },
    {
      name: 'Tasmania',
      isExpanded: false,
      subItems: ['Highlights', 'Best Time to Visit'],
    },
    {
      name: 'Gold Coast',
      isExpanded: false,
      subItems: ['Highlights', 'Best Time to Visit'],
    },
  ];

  selectedDestination: number | null = null;
  selectedSubItem: number | null = null;

  toggleExpand(index: number) {
    this.selectedDestination = index;
    this.destinations.forEach(
      (item, i) => (item.isExpanded = i === index ? !item.isExpanded : false)
    );
  }

  selectSubItem(destinationIndex: number, subItemIndex: number) {
    this.selectedDestination = destinationIndex;
    this.selectedSubItem = subItemIndex;
  }
}

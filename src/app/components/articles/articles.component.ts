import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../../interface/travel.interface';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="articles-section">
      <h2>Most Read </h2>
      <div class="articles-list">
        <div *ngFor="let article of articles" class="article-item">
          <img [src]="article.imageUrl" [alt]="article.title" />
          <div class="article-content">
            <h3>{{ article.title }}</h3>
            <div class="tags">
              <span *ngFor="let tag of article.tags" class="tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="more-container">
        <button class="more-btn">More ></button>
      </div>
    </div>
  `,
  styles: [
    `
      .articles-section {
        background: white;
        margin-top: 30px;
        margin-top: 24px;
      }

      h2 {
        font-size: 32px;
        font-weight: 400;
        margin-bottom: 15px;
      }

      .articles-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .article-item {
        display: flex;
        gap: 16px;
        border-radius: 12px;
        cursor: pointer;
        background-color: #f8f8f8;
        transition: background-color 0.2s;
      }

      .article-item:hover {
        background-color: #f5f5f5;
      }

      .article-item img {
        width: 160px;
        min-height: 120px;
        object-fit: cover;
        border-radius: 12px 0px 0px 12px;
      }

      .article-content {
        flex: 1;
      }

      .article-content h3 {
        padding-top: 12px;
        padding-right: 16px;
        padding-bottom: 12px;
        font-size: 20px;
        font-weight: 400;
        margin-bottom: 8px;
      }

      .tags {
        display: flex;
        color: #4d4d4d;
        font-size: 14px;
        flex-wrap: wrap;
        gap: 8px;
        padding-right: 16px;
        padding-bottom: 12px;
      }

      .tag {
        font-size: 0.875rem;
        color: #666;
      }

      .more-container {
        text-align: right;
        margin-top: 16px;
      }

      .more-btn {
        background: none;
        border: none;
        color: #0066cc;
        font-size: 0.875rem;
        cursor: pointer;
        padding: 4px 8px;
      }

      .more-btn:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class ArticlesComponent {
  articles: Article[] = [
    {
      title: 'Must-Try Restaurants in LA',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      tags: ['Foodie', 'Celebrity', 'Dining', 'French'],
    },
    {
      title: 'Must-Try Restaurants in LA',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      tags: ['Foodie', 'Celebrity', 'Dining', 'French'],
    },
    {
      title: 'Must-Try Restaurants in LA',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      tags: ['Foodie', 'Celebrity', 'Dining', 'French'],
    },
    {
      title: 'Must-Try Restaurants in LA',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      tags: ['Foodie', 'Celebrity', 'Dining', 'French'],
    },
    {
      title: 'Must-Try Restaurants in LA',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      tags: ['Foodie', 'Celebrity', 'Dining', 'French'],
    },
  ];
}

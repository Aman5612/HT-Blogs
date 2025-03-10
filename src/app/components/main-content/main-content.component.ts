import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-content">
      <h1>Places To Visit In Australia</h1>
      <p class="subtitle">
        relaxing beach, Scuba Diving,  food culture, vibrant nightlife, and
        sporting events....
      </p>

      <div class="destination-content">
        <p class="intro">
          Australia, with its diverse landscapes and iconic landmarks, has long
          been a top destination for travellers across the globe. From tropical
          beaches to rugged mountains, Australia offers something for every kind
          of explorer.
        </p>

        <section class="sydney-section">
          <h2>1. Sydney</h2>
          <img
            src="https://images.unsplash.com/photo-1624138784614-87fd1b6528f8"
            alt="Sydney Opera House"
            class="feature-image"
          />

          <p>
            Sydney is the heart of Australia, offering travellers a blend of
            culture, entertainment, and natural beauty. With iconic landmarks
            like the Sydney Opera House and Harbour Bridge, there's no shortage
            of things to do.
          </p>

          <h3>Highlights:</h3>
          <ul>
            <li>
              Sydney Opera House & Harbour Bridge: Witness two of Australia's
              most famous landmarks
            </li>
            <li>Bondi Beach: Enjoy surfing or lounging on the golden sands</li>
            <li>
              Royal Botanic Garden: A peaceful retreat offering spectacular
              views of the harbor
            </li>
          </ul>
        </section>

        <section class="travel-packages">
          <div class="package-grid">
            <div class="package-card">
              <img src="path-to-image" alt="Family Fun: Universal Beyond" />
              <h3>Family Fun: Universal Beyond</h3>
              <p>Resort: Gold Coast</p>
              <p class="price">From $29,000</p>
              <a href="#" class="explore-link">Explore ></a>
            </div>
            <!-- Add more package cards as needed -->
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .main-content {
        padding: 0px 40px 40px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        font-size: 32px;
        font-weight: 400;
        margin-bottom: 1rem;
      }

      h2 {
        font-size: 20px;
        font-weight: 400;
      }
      .subtitle {
        color: #4d4d4d;
        font-size: 16px;
        font-weight: 400;
        font-family: DM mono;
        margin-bottom: 2rem;
      }

      .feature-image {
        width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 20px 0;
      }

      .package-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 40px;
      }

      .package-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }

      .package-card:hover {
        transform: translateY(-5px);
      }

      .explore-link {
        color: #0066cc;
        text-decoration: none;
      }

      @media (max-width: 768px) {
        .main-content {
          padding: 20px;
        }

        h1 {
          font-size: 2rem;
        }
      }
    `,
  ],
})
export class MainContentComponent {}

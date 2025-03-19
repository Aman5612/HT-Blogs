import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MostReadArticlesComponent } from '../most-read-articles/most-read-articles.component';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, MostReadArticlesComponent],
  template: `
    <div class="trip-planner-container">
      <div class="trip-planner">
        <h2>Need help planning<br />your trip?</h2>
        <p class="subtitle">Fill in this form please</p>

        <form class="planner-form" (submit)="onSubmit($event)">
          <div class="form-group">
            <input
              type="text"
              class="form-input"
              placeholder="Name"
              [(ngModel)]="formData.name"
              name="name"
              (focus)="onInputFocus($event)"
              (blur)="onInputBlur($event)"
            />
          </div>

          <div class="form-group">
            <input
              type="tel"
              class="form-input"
              placeholder="Phone No."
              [(ngModel)]="formData.phone"
              name="phone"
              (focus)="onInputFocus($event)"
              (blur)="onInputBlur($event)"
            />
          </div>

          <div class="form-group">
            <input
              type="email"
              class="form-input"
              placeholder="Email Address"
              [(ngModel)]="formData.email"
              name="email"
              (focus)="onInputFocus($event)"
              (blur)="onInputBlur($event)"
            />
          </div>

          <p class="privacy-notice">
            By clicking button you agree with our
            <a href="#" class="policy-link">Privacy Policy</a> &
            <a href="#" class="policy-link">User Agreement</a> policy.
          </p>

          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .trip-planner-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .trip-planner {
        background: #f8f8f8;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      h2 {
        font-size: 32px;
        text-align: center;
        font-weight: 400;
        line-height: 117.5%;
      }

      p {
        color: #797979;
        font-size: 14px !important;
        font-family: DM Mono;
        font-weight: 300;
      }

      .subtitle {
        color: #797979;
        font-size: 14px;
        font-family: DM Mono;
        font-weight: 300;
        margin-bottom: 15px;
      }

      .planner-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
        max-width: 320px;
      }

      .form-group {
        position: relative;
        width: 100%;
      }

      .form-group::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: #000000;
        opacity: 0.6;
      }

      /* Simple centered input approach */
      .form-input {
        width: 100%;
        padding: 8px 0;
        border: none;
        background: transparent;
        font-size: 1rem;
        color: #333;
        outline: none;
        text-align: center;
        
        /* Chrome, Safari, Edge, Opera */
        &::-webkit-input-placeholder {
          color: #999;
          text-align: center;
          transition: opacity 0.2s ease;
        }
        
        /* Firefox */
        &::-moz-placeholder {
          color: #999;
          text-align: center;
          transition: opacity 0.2s ease;
        }
        
        /* Internet Explorer 10-11 */
        &:-ms-input-placeholder {
          color: #999;
          text-align: center;
          transition: opacity 0.2s ease;
        }
        
        /* Microsoft Edge */
        &::-ms-input-placeholder {
          color: #999;
          text-align: center;
          transition: opacity 0.2s ease;
        }
        
        /* Hide placeholder on focus for all browsers */
        &:focus::-webkit-input-placeholder {
          opacity: 0;
        }
        
        &:focus::-moz-placeholder {
          opacity: 0;
        }
        
        &:focus:-ms-input-placeholder {
          opacity: 0;
        }
        
        &:focus::-ms-input-placeholder {
          opacity: 0;
        }
      }

      .privacy-notice {
        margin-top: 8px;
        text-align: center;
      }

      .policy-link {
        color: #111;
        text-decoration: underline;
        font-weight: 500;
      }

      .submit-btn {
        background: #000;
        margin: 0 auto;
        color: white;
        border: none;
        border-radius: 100px;
        padding: 14px 32px;
        font-size: 12px !important;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
        max-width: 32%;
        max-height: 20px;
        margin-top: 8px;
      }

      .submit-btn:hover {
        background: #222;
      }
    `,
  ],
})
export class TripPlannerComponent implements OnInit {
  formData = {
    name: '',
    phone: '',
    email: '',
  };

  ngOnInit() {
    // Check if we're in a browser environment
    if (typeof document !== 'undefined') {
      // Apply this after the component is initialized
      setTimeout(() => {
        this.applyInputOverride();
      }, 0);
    }
  }

  // This applies a direct DOM modification to get the desired behavior
  private applyInputOverride() {
    // Get all inputs
    const inputs = document.querySelectorAll('.form-input') as NodeListOf<HTMLInputElement>;
    
    // Apply the style to each input using direct style properties
    inputs.forEach(input => {
      // Create a style element for our custom CSS
      const style = document.createElement('style');
      style.textContent = `
        /* Force center alignment for input text */
        input[name="${input.name}"] {
          text-align: center !important;
        }
        
        /* Fix browser autofill styling */
        input[name="${input.name}"]:-webkit-autofill,
        input[name="${input.name}"]:-webkit-autofill:hover, 
        input[name="${input.name}"]:-webkit-autofill:focus {
          -webkit-text-fill-color: #333;
          transition: background-color 5000s ease-in-out 0s;
          text-align: center !important;
        }
        
        /* Immediately hide placeholder on focus */
        input[name="${input.name}"]:focus::placeholder {
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `;
      document.head.appendChild(style);
    });
  }

  onInputFocus(event: FocusEvent) {
    // Hide placeholder immediately on focus
    const input = event.target as HTMLInputElement;
    input.setAttribute('data-placeholder', input.placeholder);
    input.placeholder = '';
  }

  onInputBlur(event: FocusEvent) {
    // Restore placeholder on blur if the input is empty
    const input = event.target as HTMLInputElement;
    if (!input.value) {
      input.placeholder = input.getAttribute('data-placeholder') || '';
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:', this.formData);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MostReadArticlesComponent } from '../most-read-articles/most-read-articles.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MostReadArticlesComponent],
  template: `
    <div class="trip-planner-container font-sans">
      <div class="trip-planner">
        <h2 class="font-normal text-[32px] leading-[118%]">Need help planning<br />your trip?</h2>
        <p class="  ">Fill in this form please</p>

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

          <button type="submit" class="submit-btn" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
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

      .error-message {
        color: #e53935;
        text-align: center;
        margin-top: 8px;
        font-size: 14px;
      }

      .success-message {
        color: #43a047;
        text-align: center;
        margin-top: 8px;
        font-size: 14px;
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

      .submit-btn:disabled {
        background: #999;
        cursor: not-allowed;
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
  
  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

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
    
    // Basic validation
    if (!this.formData.name || !this.formData.email || !this.formData.phone) {
      this.toastService.error('Please fill in all fields');
      return;
    }
    
    this.isSubmitting = true;
    
    // Set proper headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Use relative path that will be handled by the proxy
    const apiUrl = '/api/submit';
    
    // Send data to API with proper error handling
    this.http.post(apiUrl, this.formData, { 
      headers: headers, 
      observe: 'response',
      responseType: 'json'
    })
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          
          // Create a standardized error response
          const errorResponse = {
            status: error.status || 500,
            body: { 
              error: error.error?.message || error.message || 'Server error' 
            }
          };
          
          // If it's a parsing error, provide more specific message
          if (error.error instanceof SyntaxError) {
            errorResponse.body.error = 'Response parsing error. The server might be returning invalid JSON.';
          }
          
          return of(errorResponse);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          
          if (response.status >= 200 && response.status < 300) {
            this.toastService.success('Thank you! We\'ll be in touch soon.');
            
            // Reset form after successful submission
            this.formData = {
              name: '',
              phone: '',
              email: ''
            };
            
            // Restore placeholders after form reset
            setTimeout(() => {
              const inputs = document.querySelectorAll('.form-input') as NodeListOf<HTMLInputElement>;
              inputs.forEach(input => {
                // Get stored placeholder and restore it
                const placeholder = input.getAttribute('data-placeholder');
                if (placeholder) {
                  input.placeholder = placeholder;
                }
              });
            }, 0);
          } else {
            // Handle error response with toast
            this.toastService.error(response.body?.error || 'Failed to submit. Please try again.');
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
          this.isSubmitting = false;
          this.toastService.error('Network error. Please check your connection and try again.');
        }
      });
  }
}

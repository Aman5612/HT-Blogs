import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { MostReadArticlesComponent } from '../most-read-articles/most-read-articles.component';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';

interface DestinationSuggestion {
  city: string;
  country: string;
}

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MostReadArticlesComponent,
  ],
  template: `
    <div class="trip-planner-container font-sans">
      <div class="trip-planner">
        <h2 class="font-normal text-[32px] leading-[118%]">
          Need help planning<br />your trip?
        </h2>
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

          <div class="form-group destination-group">
            <input
              type="text"
              class="form-input"
              placeholder="Destination"
              [(ngModel)]="formData.destination"
              name="destination"
              (focus)="onInputFocus($event)"
              (blur)="onDestinationBlur($event)"
              (input)="onDestinationInput($event)"
              autocomplete="off"
            />
            <div
              class="destination-suggestions"
              *ngIf="showSuggestions && destinationSuggestions.length > 0"
            >
              <div
                *ngFor="let suggestion of destinationSuggestions"
                class="suggestion-item"
                (click)="selectSuggestion(suggestion)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-map-pin mr-2 h-4 w-4 text-gray-500"
                >
                  <path
                    d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                  ></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ suggestion.city }}, {{ suggestion.country }}
              </div>
            </div>
          </div>

          <!-- <div class="form-group">
            <input
              type="email"
              class="form-input"
              placeholder="Email Address"
              [(ngModel)]="formData.destination"
              name="email"
              (focus)="onInputFocus($event)"
              (blur)="onInputBlur($event)"
            />
          </div> -->

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

      .destination-group {
        position: relative;
      }

      .destination-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        margin-top: 8px;
        z-index: 10;
        max-height: none;
        height: auto;
        padding: 0;
      }

      .suggestion-item {
        padding: 10px 8px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        text-align: left;
        display: flex;
        align-items: center;
      }

      .suggestion-item img {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }

      .suggestion-item:hover {
        background-color: #f5f5f5;
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

      /* Mobile responsive styles to reduce height */
      @media (max-width: 768px) {
        .trip-planner-container {
          gap: 1rem; /* Reduced from 2rem */
        }

        .trip-planner {
          padding: 24px; /* Reduced from 32px */
          gap: 2px; /* Reduced from 4px */
        }

        h2 {
          font-size: 24px; /* Reduced from 32px */
          line-height: 1.1;
          margin-bottom: 18px;
        }

        p {
          font-size: 12px !important; /* Reduced from 14px */
          margin: 0 0 6px 0;
        }

        .planner-form {
          gap: 16px; /* Reduced from 24px */
        }

        .form-input {
          padding: 4px 0; /* Reduced from 8px */
          font-size: 0.9rem; /* Slightly smaller font */
        }

        .privacy-notice {
          margin-top: 4px; /* Reduced from 8px */
          font-size: 11px; /* Smaller text */
          line-height: 1.2;
        }

        .submit-btn {
          padding: 10px 24px; /* Reduced padding */
          margin-top: 4px; /* Reduced from 8px */
        }
      }
    `,
  ],
})
export class TripPlannerComponent implements OnInit, OnDestroy {
  formData = {
    name: '',
    phone: '',
    destination: '',
    city_country: '',
  };

  locationData = {
    city: '',
    region: '',
    country: '',
    latitude: '',
    longitude: '',
  };

  // Destination suggestions
  destinationSuggestions: DestinationSuggestion[] = [];
  showSuggestions = false;
  private destinationInput$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  isSubmitting = false;
  submitError = '';
  submitSuccess = false;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit() {
    // Check if we're in a browser environment
    if (typeof document !== 'undefined') {
      // Apply this after the component is initialized
      setTimeout(() => {
        this.applyInputOverride();
        this.getLocationData();
      }, 0);
    }

    // Setup subscription for destination input with debouncing
    this.setupDestinationAutocomplete();

    // Handle clicks outside of the suggestions dropdown
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleDocumentClick.bind(this));
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    if (typeof document !== 'undefined') {
      document.removeEventListener(
        'click',
        this.handleDocumentClick.bind(this)
      );
    }
  }

  private handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.destination-group')) {
      this.showSuggestions = false;
    }
  }

  private setupDestinationAutocomplete() {
    const subscription = this.destinationInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term || term.length < 2) {
            return of({ result: [] });
          }
          return this.searchDestinations(term);
        })
      )
      .subscribe({
        next: (response: any) => {
          // Limit to maximum 6 suggestions
          this.destinationSuggestions = response.result.slice(0, 6) || [];
          this.showSuggestions = this.destinationSuggestions.length > 0;
        },
        error: (error) => {
          console.error('Error fetching destination suggestions:', error);
          this.destinationSuggestions = [];
          this.showSuggestions = false;
        },
      });

    this.subscriptions.push(subscription);
  }

  private searchDestinations(query: string) {
    const apiUrl = `https://staging.holidaytribe.com:3000/places/semanticDestinationSearch/${encodeURIComponent(
      query
    )}`;
    return this.http.get(apiUrl).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        return of({ result: [] });
      })
    );
  }

  onDestinationInput(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('this is the destination->>>>>>>>.', input.value);
    this.destinationInput$.next(input.value);
  }

  onDestinationBlur(event: FocusEvent) {
    // Don't hide suggestions immediately to allow for clicks
    setTimeout(() => {
      // Only restore placeholder if needed
      this.onInputBlur(event);
    }, 200);
  }

  selectSuggestion(suggestion: DestinationSuggestion) {
    this.formData.city_country = `${suggestion.city}`;
    this.formData.destination = `${suggestion.city}, ${suggestion.country}`;
    this.showSuggestions = false;
  }

  // Get user's location data
  private getLocationData() {
    // Example implementation - in a real app, you'd use a geolocation service
    // This is just a placeholder to simulate the location data structure
    fetch('https://ipapi.co/json/')
      .then((response) => response.json())
      .then((data) => {
        this.locationData = {
          city: data.city || '',
          region: data.region || '',
          country: data.country_name || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
        };
      })
      .catch((error) => {
        console.error('Error fetching location data:', error);
      });
  }

  // This applies a direct DOM modification to get the desired behavior
  private applyInputOverride() {
    // Get all inputs
    const inputs = document.querySelectorAll(
      '.form-input'
    ) as NodeListOf<HTMLInputElement>;

    // Apply the style to each input using direct style properties
    inputs.forEach((input) => {
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

    // Show suggestions if it's the destination field and has value
    if (
      input.name === 'destination' &&
      input.value &&
      input.value.length >= 2
    ) {
      this.destinationInput$.next(input.value);
    }
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
    if (
      !this.formData.name ||
      !this.formData.phone ||
      !this.formData.destination
    ) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    // Prepare the payload according to the required format
    const params = {
      Last_Name: this.formData.name,
      Phone_number: this.formData.phone,
      Destination: this.formData.city_country,
      City_Country: this.formData.destination,
      Package_Selected: window.location.href,
      Source: 'Blog_Website',
      source_remark:
        new URLSearchParams(window.location.search).get('campaign_id') || '',
      ad_id: new URLSearchParams(window.location.search).get('ad_id') || '',
      location: {
        city: this.locationData.city,
        region: this.locationData.region,
        country: this.locationData.country,
        latitude: this.locationData.latitude,
        longitude: this.locationData.longitude,
      },
    };

    // Add email separately if needed for your backend
    const payload = {
      ...params,
    };

    // Set proper headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // Use relative path that will be handled by the proxy
    const apiUrl =
      'https://stagingleads.holidaytribe.com/common/publishleadsToZoho';

    // Send data to API with proper error handling
    this.http
      .post(apiUrl, payload, {
        headers: headers,
        observe: 'response',
        responseType: 'json',
      })
      .pipe(
        catchError((error) => {
          console.error('API Error:', error);

          // Create a standardized error response
          const errorResponse = {
            status: error.status || 500,
            body: {
              error: error.error?.message || error.message || 'Server error',
            },
          };

          // If it's a parsing error, provide more specific message
          if (error.error instanceof SyntaxError) {
            errorResponse.body.error =
              'Response parsing error. The server might be returning invalid JSON.';
          }

          return of(errorResponse);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.isSubmitting = false;

          if (response.status >= 200 && response.status < 300) {
            this.toastService.success("Thank you! We'll be in touch soon.");

            // Reset form after successful submission
            this.formData = {
              name: '',
              phone: '',
              destination: '',
              city_country: '',
            };

            // Restore placeholders after form reset
            setTimeout(() => {
              const inputs = document.querySelectorAll(
                '.form-input'
              ) as NodeListOf<HTMLInputElement>;
              inputs.forEach((input) => {
                // Get stored placeholder and restore it
                const placeholder = input.getAttribute('data-placeholder');
                if (placeholder) {
                  input.placeholder = placeholder;
                }
              });
            }, 0);
          } else {
            // Handle error response with toast
            this.toastService.error(
              response.body?.error || 'Failed to submit. Please try again.'
            );
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
          this.isSubmitting = false;
          this.toastService.error(
            'Network error. Please check your connection and try again.'
          );
        },
      });
  }
}

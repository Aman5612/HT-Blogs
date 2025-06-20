import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UtilService } from '../../services/util.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface DestinationSuggestion {
  city: string;
  country: string;
}

@Component({
  standalone: true,
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  tabWidth = 1280;

  name = '';
  email = '';
  phone = '';
  destination = '';
  city_country = '';
  openPopup: boolean = false;

  // Destination suggestions
  destinationSuggestions: DestinationSuggestion[] = [];
  showSuggestions = false;
  private destinationInput$ = new Subject<string>();
  private subscriptions: Subscription[] = [];

  // Validation flags
  isDestinationSelected = false;
  phoneNumberError = '';
  destinationError = '';

  locationData = {
    city: '',
    region: '',
    country: '',
    latitude: '',
    longitude: '',
  };

  constructor(
    private utilService: UtilService,
    public router: Router,
    public route: ActivatedRoute,
    private modalService: NgbModal,
    private toast: HotToastService,
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log(this.tabWidth);
    console.log('urllll', this.router.url);

    // Setup subscription for destination input with debouncing
    this.setupDestinationAutocomplete();

    // Handle clicks outside of the suggestions dropdown
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    // Get user's location data
    this.getLocationData();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.handleDocumentClick.bind(this));
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
    const apiUrl = `https://staging.holidaytribe.com:3000/places/semanticDestinationSearch/${encodeURIComponent(query)}`;
    return this.http.get(apiUrl).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        return of({ result: [] });
      })
    );
  }

  onDestinationInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.destinationInput$.next(input.value);

    // Reset selection flag when user types manually
    if (this.destination !== input.value) {
      this.isDestinationSelected = false;
    }
  }

  onDestinationBlur(event: FocusEvent) {
    // Don't hide suggestions immediately to allow for clicks
    setTimeout(() => {
      // Check if a valid destination was selected
      if (this.destination && !this.isDestinationSelected) {
        this.destinationError = 'Please select a destination from the suggestions';
      }
    }, 200);
  }

  selectSuggestion(suggestion: DestinationSuggestion) {
    this.city_country = `${suggestion.city}`;
    this.destination = `${suggestion.city}, ${suggestion.country}`;
    this.showSuggestions = false;
    this.isDestinationSelected = true;
    this.destinationError = '';
  }

  // Get user's location data
  private getLocationData() {
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

  onInputFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.setAttribute('data-placeholder', input.placeholder);
    input.placeholder = '';

    // Show suggestions if it's the destination field and has value
    if (input.name === 'destination' && input.value && input.value.length >= 2) {
      this.destinationInput$.next(input.value);
    }
  }

  onInputBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    if (!input.value) {
      input.placeholder = input.getAttribute('data-placeholder') || '';
    }
  }

  // Validate phone number input - only allow numbers and max 10 digits
  validatePhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');

    // Limit to 10 digits
    const truncatedValue = numericValue.substring(0, 10);

    // Update input value if it was modified
    if (value !== truncatedValue) {
      this.phone = truncatedValue;
      input.value = truncatedValue;
    }

    // Set error message if needed
    if (value && value !== truncatedValue) {
      this.phoneNumberError = 'Please enter numbers only (max 10 digits)';
    } else {
      this.phoneNumberError = '';
    }
  }

  submitNewsLetter() {
    // Reset error messages
    this.phoneNumberError = '';
    this.destinationError = '';

    // Basic validation
    if (!this.name || !this.phone || !this.destination) {
      this.toast.error('Please fill in all required fields');
      return;
    }

    // Phone number validation
    if (!/^\d{1,10}$/.test(this.phone)) {
      this.phoneNumberError = 'Please enter a valid phone number (numbers only, max 10 digits)';
      this.toast.error(this.phoneNumberError);
      return;
    }

    // Destination validation
    if (!this.isDestinationSelected) {
      this.destinationError = 'Please select a destination from the suggestions';
      this.toast.error(this.destinationError);
      return;
    }

    // Prepare the payload according to the required format
    const params = {
      Last_Name: this.name,
      Phone_number: this.phone,
      Destination: this.city_country,
      City_Country: this.destination,
      Package_Selected: window.location.href,
      Source: 'Blog_Website',
      source_remark: new URLSearchParams(window.location.search).get('campaign_id') || '',
      ad_id: new URLSearchParams(window.location.search).get('ad_id') || '',
      location: {
        city: this.locationData.city,
        region: this.locationData.region,
        country: this.locationData.country,
        latitude: this.locationData.latitude,
        longitude: this.locationData.longitude,
      },
    };

    // Set proper headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // Use relative path that will be handled by the proxy
    const apiUrl = 'https://stagingleads.holidaytribe.com/common/publishleadsToZoho';

    // Send data to API with proper error handling
    this.http
      .post(apiUrl, params, {
        headers: headers,
        observe: 'response',
        responseType: 'json',
      })
      .pipe(
        catchError((error) => {
          console.error('API Error:', error);
          const errorResponse = {
            status: error.status || 500,
            body: {
              error: error.error?.message || error.message || 'Server error',
            },
          };
          if (error.error instanceof SyntaxError) {
            errorResponse.body.error = 'Response parsing error. The server might be returning invalid JSON.';
          }
          return of(errorResponse);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status >= 200 && response.status < 300) {
            this.toast.success("Thank you! We'll be in touch soon.");

            // Reset form after successful submission
            this.name = '';
            this.phone = '';
            this.destination = '';
            this.city_country = '';

            // Redirect to thank you page
            window.location.href = 'https://www.holidaytribe.com/thankyou';
          } else {
            this.toast.error(response.body?.error || 'Failed to submit. Please try again.');
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
          this.toast.error('Network error. Please check your connection and try again.');
        },
      });
  }

  otp = '';
  showOTPInput = false;
  otp_received = '';
  otp_sent_on = null;

  themeList = false;
  showTheme() {
    this.themeList = true;
  }
  showwThemee() {
    this.themeList = false;
  }
  themeListt = false;
  showTerms() {
    this.themeListt = true;
  }
  showwTermss() {
    this.themeListt = false;
  }
  themeListtt = false;
  showAbout(value: any) {
    this.router.navigate(['/', value]);
  }
  showHoliday(value: any) {
    this.router.navigate(['/', value]);
    setTimeout(() => {
      this.utilService.sendClickEvent();
    }, 100);
  }
  showPartner(value: any) {
    this.router.navigate(['/', value]);
  }
  showBlog(value: any) {
    this.router.navigate(['/', value]);
  }
  showwAbout() {
    this.themeListtt = false;
  }
  navigatee(valuee: any) {
    window.location.href = 'https://www.holidaytribe.com/'+valuee;
  }
  navigateee(valuee: any) {
    window.location.href = 'https://www.holidaytribe.com/theme/'+valuee;
  }
  scrollToElement() {
    this.utilService.sendClickEvent();
  }

  sendOTP() {
    this.apiService
      .getAPI(this.apiService.API_BASE_URL + 'user/queryFormOTP/' + this.phone)
      .then((result) => {
        try {
          this.toast.success('OTP sent to phone');
          this.otp_received = result.result;
          this.otp_sent_on = new Date() as any;
          this.showOTPInput = true;
        } catch (error) {
          console.log(error);
        }
      });
  }
  verifyOTP() {
    console.log(this.otp_received);
    console.log(this.otp);
    console.log(Number(this.otp_received));
    console.log(Number(this.otp));
    console.log(this.otp_sent_on);

    if (Number(this.otp_received) == Number(this.otp)) {
      (this.otp_sent_on as any)?.setMinutes(
        (this.otp_sent_on as any)?.getMinutes() + 10
      );
      if (new Date().getTime() > (this.otp_sent_on as any)?.getTime()) {
        this.toast.error('OTP Expired');
      } else {
        this.submitFinalNewsLetter();
        this.showOTPInput = false;
      }
    } else {
      this.toast.error('Please enter valid otp');
    }
  }

  submitFinalNewsLetter() {
    this.apiService
      .postAPI(this.apiService.API_BASE_URL + 'common/addNewsLetter', {
        name: this.name,
        phone: this.phone,
        destination: this.destination,
      })
      .then(
        (result) => {
          // this.homeCMS = result.data.attributes;
          if (result.status) {
            this.name = '';
            this.phone = '';
            this.destination = '';
            this.showOTPInput = false;
            this.router.navigateByUrl('/thankyou').then(() => {
              window.location.reload();
            });
          } else {
            this.toast.error(result.message);
          }
        },
        (error) => {
          this.toast.error('Something went wrong');
          console.log(error);
        }
      );
  }
}

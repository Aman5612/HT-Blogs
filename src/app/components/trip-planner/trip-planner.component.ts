import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
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
          />
        </div>

        <div class="form-group">
          <input
            type="tel"
            class="form-input"
            placeholder="Phone No."
            [(ngModel)]="formData.phone"
            name="phone"
          />
        </div>

        <div class="form-group">
          <input
            type="email"
            class="form-input"
            placeholder="Email Address"
            [(ngModel)]="formData.email"
            name="email"
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
  `,
  styles: [
    `
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
      }

      .form-group {
        position: relative;
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

      .form-input {
        width: 100%;
        padding: 8px 0;
        border: none;
        background: transparent;
        font-size: 1rem;
        color: #333;
        outline: none;
      }

      .form-input::placeholder {
        color: #999;
        text-align: center;
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
export class TripPlannerComponent {
  formData = {
    name: '',
    phone: '',
    email: '',
  };

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:', this.formData);
  }
}

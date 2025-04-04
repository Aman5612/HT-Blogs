import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        [@toastAnimation]="'visible'"
        class="toast"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-content">
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="closeToast(toast.id)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
      }

      .toast {
        padding: 15px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0.95;
        overflow: hidden;
      }

      .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .toast-message {
        flex: 1;
        margin-right: 10px;
      }

      .toast-close {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        opacity: 0.7;
      }

      .toast-close:hover {
        opacity: 1;
      }

      .toast-success {
        background-color: #43a047;
        color: white;
      }

      .toast-error {
        background-color: #e53935;
        color: white;
      }

      .toast-info {
        background-color: #2196f3;
        color: white;
      }
    `,
  ],
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 0.95
      })),
      transition('void => visible', animate('200ms ease-out')),
      transition('visible => void', animate('200ms ease-in'))
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription | null = null;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeToast(id: number): void {
    this.toastService.remove(id);
  }
}
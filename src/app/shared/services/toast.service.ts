import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: BehaviorSubject<Toast[]> = new BehaviorSubject<Toast[]>([]);
  private nextId = 0;

  constructor() {}

  getToasts(): Observable<Toast[]> {
    return this.toasts.asObservable();
  }

  // Show a success toast
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  // Show an error toast
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  // Show an info toast
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  // Show a toast with specific type and duration
  private show(message: string, type: 'success' | 'error' | 'info', duration: number): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type, duration };
    
    // Add new toast to the array
    const currentToasts = this.toasts.getValue();
    this.toasts.next([...currentToasts, toast]);
    
    // Automatically remove toast after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  // Remove a specific toast
  remove(id: number): void {
    const currentToasts = this.toasts.getValue();
    this.toasts.next(currentToasts.filter(toast => toast.id !== id));
  }

  // Clear all toasts
  clear(): void {
    this.toasts.next([]);
  }
} 
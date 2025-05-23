import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    NavbarComponent,
    FooterComponent,
  ],
  template: `
    <div class="app-container">
      <app-navbar
        style="position: fixed; width: 100vw; top: 0px; left: 0px; z-index: 1030"
      ></app-navbar>

      <main class="main-content bg-white">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>

      <!-- Toast Container -->
      <app-toast></app-toast>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100vw;
        min-height: 100vh;
        overflow-x: hidden;
      }

      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      header {
        height: 64px;
        background: #fff;
        padding: 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: fixed;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        width: 100%;

        nav {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          gap: 2rem;
          padding: 0 2rem;
          height: 100%;
          align-items: center;

          a {
            color: #333;
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 0;
            position: relative;
            height: 100%;
            display: flex;
            align-items: center;

            &:after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 0;
              height: 2px;
              background: #333;
              transition: width 0.2s;
            }

            &:hover:after,
            &.active:after {
              width: 100%;
            }
          }
        }
      }

      .main-content {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;

        ::ng-deep > * {
          flex: 1;
          width: 100%;
        }
      }

      @media (max-width: 768px) {
        header nav {
          padding: 0 1rem;
        }
      }
    `,
  ],
})
export class AppComponent {
  title = 'HT-blogs';
}

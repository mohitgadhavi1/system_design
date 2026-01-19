import { Component, input, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContentItem } from '../services/content.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  host: {
    class: 'block'
  },
  template: `
    <!-- Backdrop for mobile -->
    <div 
      *ngIf="isDrawerVisible && isMobileView"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      (click)="closeDrawer()"
    ></div>

    <!-- Drawer -->
    <aside 
      [class]="drawerClass"
      [attr.aria-hidden]="!isDrawerVisible"
    >
      <!-- Header -->
      <div class="w-full px-6 py-4 border-b border-gray-700 mb-4">
        <div class="flex justify-between items-center">
          <h2 class="m-0 text-xl font-semibold text-white">Course Content</h2>
          <button 
            *ngIf="isMobileView"
            class="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors"
            (click)="closeDrawer()"
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>
      </div>
      
      <!-- Navigation -->
      <nav aria-label="Course navigation">
        <ul class="list-none m-0 p-0">
          @for (item of contentItems(); track item.id) {
            <li class="mb-1">
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                #rla="routerLinkActive"
                class="block px-6 py-3 text-gray-300 no-underline transition-all duration-200 border-l-4 border-transparent hover:text-white hover:bg-gray-800"
                [class.active]="rla.isActive"
                [class.!border-blue-500]="rla.isActive"
                [class.!bg-gray-800]="rla.isActive"
                [class.!text-white]="rla.isActive"
                [attr.aria-current]="rla.isActive ? 'page' : null"
                (click)="onLinkClick()"
              >
                {{ item.title }}
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    aside {
      position: fixed;
      left: 0;
      width: 280px;
      background-color: #111827;
      color: white;
      overflow-y: auto;
      transition: transform 0.3s ease-in-out;
      z-index: 50;
    }

    /* Desktop styles */
    @media (min-width: 769px) {
      aside {
        top: 56px;
        height: calc(100vh - 56px);
        transform: translateX(0);
      }

      aside[aria-hidden="true"] {
        transform: translateX(-100%);
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      aside {
        top: 0;
        height: 100vh;
        transform: translateX(-100%);
      }

      aside[aria-hidden="false"] {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  contentItems = input.required<ContentItem[]>();

  isMobileView = false;
  isDrawerVisible = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkIfMobile();
      // On desktop, drawer should be visible by default
      if (!this.isMobileView) {
        this.isDrawerVisible = true;
      }
    }
  }

  get drawerClass(): string {
    return `drawer ${this.isMobileView ? 'mobile' : 'desktop'}`;
  }

  @HostListener('window:resize', [])
  onResize() {
    if (!isPlatformBrowser(this.platformId)) return;

    const wasMobile = this.isMobileView;
    this.checkIfMobile();

    // Handle transition between mobile and desktop
    if (wasMobile && !this.isMobileView) {
      // Switched to desktop - open drawer
      this.isDrawerVisible = true;
    } else if (!wasMobile && this.isMobileView) {
      // Switched to mobile - close drawer
      this.isDrawerVisible = false;
    }
  }

  checkIfMobile() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView = window.innerWidth <= 768;
    }
  }

  toggleDrawer(): void {
    this.isDrawerVisible = !this.isDrawerVisible;
  }

  closeDrawer(): void {
    if (this.isMobileView) {
      this.isDrawerVisible = false;
    }
  }

  onLinkClick(): void {
    // Close drawer on mobile when a link is clicked
    if (this.isMobileView) {
      this.closeDrawer();
    }
  }
}
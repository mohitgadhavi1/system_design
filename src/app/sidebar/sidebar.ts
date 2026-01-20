import { Component, input, HostListener, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContentItem } from '../services/content.service';
import { ProgressService } from '../services/progress.service';

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
                class="flex items-center justify-between px-6 py-3 no-underline transition-all duration-200 border-l-4 border-transparent hover:bg-gray-800"
                [class.border-blue-500]="rla.isActive"
                [class.bg-gray-800]="rla.isActive"
                [class.text-white]="rla.isActive"
                [class.text-gray-300]="!rla.isActive"
                [class.hover:text-white]="!rla.isActive"
                [attr.aria-current]="rla.isActive ? 'page' : null"
                (click)="onLinkClick()"
              >
                <span [class.text-gray-400]="progressService.isChapterCompleted(item.id) && !rla.isActive">
                    {{ item.title }}
                </span>
                @if (progressService.isChapterCompleted(item.id)) {
                  <span class="text-green-500 ml-2" aria-label="Completed">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </span>
                }
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
  progressService = inject(ProgressService);

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
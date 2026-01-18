import { Component, input, HostListener, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ContentItem } from '../services/content.service';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, DrawerModule, ButtonModule, RouterLink, RouterLinkActive],
  host: {
    class: 'block'
  },
  template: `
    <p-drawer 
      [(visible)]="isDrawerVisible"
      position="left"
      [modal]="isMobileView"
      [showCloseIcon]="false"
      [blockScroll]="isMobileView"
      [closeOnEscape]="isMobileView"
      [styleClass]="drawerStyleClass"
    >
      <ng-template #header>
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
      </ng-template>
      
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
    </p-drawer>
  `,
  styles: [`
    :host ::ng-deep .p-drawer {
      background-color: #111827;
    }
    
    :host ::ng-deep .p-drawer-content {
      background-color: #111827;
    }
    
    :host ::ng-deep .sidebar-desktop {
      top: 56px;
      height: calc(100vh - 56px);
    }
    
    :host ::ng-deep .sidebar-mobile {
      top: 0;
      height: 100vh;
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

  get drawerStyleClass(): string {
    const baseClass = '!w-[280px] bg-gray-900 text-white overflow-y-auto';
    const positionClass = this.isMobileView ? 'sidebar-mobile' : 'sidebar-desktop';
    return `${baseClass} ${positionClass}`;
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
      this.isDrawerVisible = !this.isDrawerVisible;
    }
  }

  onLinkClick(): void {
    // Close drawer on mobile when a link is clicked
    if (this.isMobileView) {
      this.closeDrawer();
    }
  }
}
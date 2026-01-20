import { Component, HostListener, Output, EventEmitter, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  template: `
    <header class="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
      <div class="container mx-auto h-full px-4">
        <div class="flex items-center justify-between h-full">
          <!-- Hamburger Menu Button -->
          <button 
            class="bg-transparent border-none text-gray-700 cursor-pointer p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            (click)="toggleMenu()"
            [attr.aria-label]="'Toggle menu'"
            [attr.aria-expanded]="false"
          >
            <div class="w-6 h-5 flex flex-col justify-between">
              <span class="block w-full h-0.5 bg-gray-700 rounded-full"></span>
              <span class="block w-full h-0.5 bg-gray-700 rounded-full"></span>
              <span class="block w-full h-0.5 bg-gray-700 rounded-full"></span>
            </div>
          </button>
          
          <!-- Logo / Title -->
          <div class="flex items-center flex-1 justify-center md:justify-start md:ml-4">
            <h1 class="text-xl font-semibold text-gray-900 m-0">System Design Course</h1>
          </div>
          
          <!-- Profile Section -->
          <div class="flex items-center space-x-4">
            <!-- Auth State Rendering -->
            <ng-container *ngIf="user$ | async as currentUser; else guest">
              <!-- Logged In -->
              <div class="relative">
                <!-- Profile Button -->
                <button
                  (click)="toggleProfileMenu()"
                  class="flex items-center space-x-2 bg-transparent border-none cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-colors"
                  [attr.aria-expanded]="isProfileMenuOpen"
                >
                  <img 
                    [src]="currentUser.photoURL" 
                    [alt]="currentUser.displayName"
                    class="w-8 h-8 rounded-full border-2 border-gray-300"
                  />
                  <span class="hidden md:block text-sm font-medium text-gray-700 max-w-[150px] truncate">
                    {{ currentUser.displayName }}
                  </span>
                  <svg 
                    class="w-4 h-4 text-gray-600 hidden md:block transition-transform"
                    [class.rotate-180]="isProfileMenuOpen"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
  
                <!-- Dropdown Menu -->
                <div 
                  *ngIf="isProfileMenuOpen"
                  class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  (clickOutside)="closeProfileMenu()"
                >
                  <!-- User Info -->
                  <div class="px-4 py-3 border-b border-gray-200">
                    <p class="text-sm font-semibold text-gray-900">{{ currentUser.displayName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ currentUser.email }}</p>
                  </div>
  
                  <!-- Menu Items -->
                  <div class="py-1">
                    <a 
                      routerLink="/profile"
                      (click)="closeProfileMenu()"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline transition-colors"
                    >
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>View Profile</span>
                      </div>
                    </a>
                    
                    <button
                      (click)="handleSignOut()"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- Not Logged In (Guest) Template -->
            <ng-template #guest>
              <div class="flex items-center">
                <a 
                  routerLink="/profile"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors no-underline"
                >
                  Sign In
                </a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  user$ = this.authService.user$;
  isProfileMenuOpen = false;

  constructor() { }

  ngOnInit() {
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  handleSignOut(): void {
    this.authService.signOut();
    this.closeProfileMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const profileButton = target.closest('button[aria-expanded]');
    const dropdown = target.closest('.absolute.right-0');

    // Close dropdown if clicking outside
    if (!profileButton && !dropdown && this.isProfileMenuOpen) {
      this.closeProfileMenu();
    }
  }
}
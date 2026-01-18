import { Component, HostListener, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
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
          
          <!-- Placeholder for future navigation items -->
          <div class="hidden md:flex items-center space-x-4">
            <!-- Add navigation items here -->
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit() { }

  toggleMenu(): void {
    this.menuToggle.emit();
  }
}
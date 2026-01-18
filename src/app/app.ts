import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';  // ✓ Already imported
import { HeaderComponent } from './header/header';
import { SidebarComponent } from './sidebar/sidebar';
import { ContentService } from './services/content.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],  // ← Add RouterOutlet here
  template: `
    <app-header (menuToggle)="onMenuToggle()"></app-header>
    <app-sidebar #sidebar [contentItems]="contentItems"></app-sidebar>
    <main class="pt-14" [class.md:ml-[280px]]="sidebar.isDrawerVisible && !sidebar.isMobileView">
      <router-outlet />
    </main>
  `
})
export class App {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  private contentService = inject(ContentService);


  contentItems = this.contentService.getContentItems()();

  onMenuToggle() {
    this.sidebar.toggleDrawer();
  }
}
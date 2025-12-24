import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { ContentService } from './services/content.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private contentService = inject(ContentService);

  contentItems = computed(() => this.contentService.getContentItems()());
}

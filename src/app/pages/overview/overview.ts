import { Component } from '@angular/core';
import { ContentViewerComponent } from '../../content-viewer/content-viewer';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [ContentViewerComponent],
  host: {
    class: 'block'
  },
  template: `
    <main class="min-h-screen bg-white">
      <app-content-viewer contentId="overview"></app-content-viewer>
    </main>
  `,
})
export class OverviewComponent { }

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
    <main class="main-content">
      <app-content-viewer contentId="overview"></app-content-viewer>
    </main>
  `,
  styles: [`
    .main-content {
      margin-left: 280px;
      min-height: 100vh;
      background: white;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class OverviewComponent { }

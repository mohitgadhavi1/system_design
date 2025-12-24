import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentViewerComponent } from '../../content-viewer/content-viewer';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [CommonModule, ContentViewerComponent],
  template: `
    <main class="main-content">
      <app-content-viewer [contentId]="chapterId"></app-content-viewer>
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
export class ChapterComponent {
  private route = inject(ActivatedRoute);
  chapterId: string = '';

  constructor() {
    this.chapterId = this.route.snapshot.data['chapterId'] || '';
  }
}

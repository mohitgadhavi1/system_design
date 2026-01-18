import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentViewerComponent } from '../../content-viewer/content-viewer';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [CommonModule, ContentViewerComponent],
  template: `
    <main class="min-h-screen bg-white">
      <app-content-viewer [contentId]="chapterId"></app-content-viewer>
    </main>
  `,
})
export class ChapterComponent {
  private route = inject(ActivatedRoute);
  chapterId: string = '';

  constructor() {
    this.chapterId = this.route.snapshot.data['chapterId'] || '';
  }
}

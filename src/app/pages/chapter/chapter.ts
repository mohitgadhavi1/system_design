import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentViewerComponent } from '../../content-viewer/content-viewer';
import { ProgressService } from '../../services/progress.service';
import { AuthService } from '../../services/auth.service';
import { ContentService } from '../../services/content.service';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [CommonModule, ContentViewerComponent],
  template: `
    <main class="min-h-screen bg-white pb-24">
      <app-content-viewer [contentId]="chapterId"></app-content-viewer>
      
      <!-- Navigation Buttons -->
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 pt-8">
          
          <!-- Previous Button -->
          <button 
            *ngIf="previousChapter()"
            (click)="navigateToPrevious()"
            class="group flex items-center gap-3 px-6 py-3 text-left bg-transparent border border-gray-200 hover:border-blue-500 rounded-lg transition-all w-full sm:w-auto hover:bg-blue-50 cursor-pointer"
          >
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wider font-medium">Previous</div>
              <div class="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{{ previousChapter()?.title }}</div>
            </div>
          </button>
          <div *ngIf="!previousChapter()" class="hidden sm:block"></div>

          <!-- Next Button -->
          <button 
            *ngIf="nextChapter()"
            (click)="navigateToNext()"
            class="group flex items-center gap-3 px-6 py-3 text-right bg-transparent border border-gray-200 hover:border-blue-500 rounded-lg transition-all w-full sm:w-auto hover:bg-blue-50 cursor-pointer"
          >
            <div>
              <div class="text-xs text-gray-500 uppercase tracking-wider font-medium">Next</div>
              <div class="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">{{ nextChapter()?.title }}</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  `,
})
export class ChapterComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected progressService = inject(ProgressService);
  protected authService = inject(AuthService);
  protected contentService = inject(ContentService);

  chapterId: string = '';

  // Reactive computed values for prev/next
  currentChapterIndex = computed(() => {
    const items = this.contentService.getContentItems()();
    return items.findIndex(item => item.id === this.chapterId);
  });

  previousChapter = computed(() => {
    const index = this.currentChapterIndex();
    const items = this.contentService.getContentItems()();
    return index > 0 ? items[index - 1] : null;
  });

  nextChapter = computed(() => {
    const index = this.currentChapterIndex();
    const items = this.contentService.getContentItems()();
    return index < items.length - 1 ? items[index + 1] : null;
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.chapterId = this.route.snapshot.data['chapterId'] || '';
    });
  }

  async navigateToNext() {
    // 1. Mark current chapter as complete
    if (this.authService.currentUser) {
      await this.progressService.markChapterComplete(this.chapterId);
    }

    // 2. Navigate to next chapter
    const next = this.nextChapter();
    if (next) {
      this.router.navigate([next.path]);
    }
  }

  navigateToPrevious() {
    const prev = this.previousChapter();
    if (prev) {
      this.router.navigate([prev.path]);
    }
  }
}

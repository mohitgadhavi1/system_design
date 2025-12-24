import { Component, OnInit, PLATFORM_ID, inject, input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContentService } from '../services/content.service';
import { signal, computed } from '@angular/core';

@Component({
  selector: 'app-content-viewer',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block'
  },
  template: `
    <article class="content-viewer" *ngIf="content(); else loading">
      <div [innerHTML]="renderedContent()"></div>
    </article>
    
    <ng-template #loading>
      <div class="loading">
        <p>Loading content...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .content-viewer {
      max-width: none;
      padding: 2rem 3rem;
      line-height: 1.6;
    }

    :host ::ng-deep .content-viewer h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1.5rem;
      color: var(--gray-900);
      border-bottom: 2px solid var(--gray-400);
      padding-bottom: 0.5rem;
    }

    :host ::ng-deep .content-viewer h2 {
      font-size: 2rem;
      font-weight: 600;
      margin: 2rem 0 1rem;
      color: var(--gray-900);
    }

    :host ::ng-deep .content-viewer h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem;
      color: var(--gray-900);
    }

    :host ::ng-deep .content-viewer p {
      margin: 1rem 0;
      color: var(--gray-700);
    }

    :host ::ng-deep .content-viewer ul, :host ::ng-deep .content-viewer ol {
      margin: 1rem 0;
      padding-left: 2rem;
    }

    :host ::ng-deep .content-viewer li {
      margin: 0.5rem 0;
      color: var(--gray-700);
    }

    :host ::ng-deep .content-viewer code {
      background: var(--gray-400);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    :host ::ng-deep .content-viewer pre {
      background: var(--gray-900);
      color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    :host ::ng-deep .content-viewer pre code {
      background: none;
      padding: 0;
    }

    :host ::ng-deep .content-viewer blockquote {
      border-left: 4px solid var(--bright-blue);
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: var(--gray-700);
    }

    :host ::ng-deep .content-viewer a {
      color: var(--bright-blue);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s ease;
    }

    :host ::ng-deep .content-viewer a:hover {
      border-bottom-color: var(--bright-blue);
    }

    .loading {
      padding: 2rem;
      text-align: center;
      color: var(--gray-700);
    }

    @media (max-width: 768px) {
      .content-viewer {
        padding: 1rem;
      }
    }
  `]
})
export class ContentViewerComponent implements OnInit {
  private contentService = inject(ContentService);
  private platformId = inject(PLATFORM_ID);

  contentId = input.required<string>();
  content = signal<string>('');
  isLoading = signal(true);

  renderedContent = computed(() => {
    const markdown = this.content();
    return this.parseMarkdown(markdown);
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      this.content.set('# Loading Content\n\nThis content will load in the browser.');
      return;
    }

    this.loadContent();
  }

  private loadContent() {
    this.isLoading.set(true);
    this.contentService.getContent(this.contentId()).subscribe({
      next: (data) => {
        this.content.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading content:', error);
        this.content.set('# Error Loading Content\n\nPlease try again later.');
        this.isLoading.set(false);
      }
    });
  }

  private parseMarkdown(markdown: string): string {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\* (.*)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^\d\. (.*)$/gim, '<li>$1</li>')
      .replace(/^- (.*)$/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gim, '<p>$1</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>)/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>)/g, '$1')
      .replace(/(<\/ul>)<\/p>/g, '$1')
      .replace(/<p>(<blockquote>)/g, '$1')
      .replace(/(<\/blockquote>)<\/p>/g, '$1')
      .replace(/<p>(<li>)/g, '$1')
      .replace(/(<\/li>)<\/p>/g, '$1');
  }
}

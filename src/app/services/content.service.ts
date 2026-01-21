import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ContentItem {
    id: string;
    title: string;
    path: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContentService {
    private contentItems = signal<ContentItem[]>([]);

    constructor(private http: HttpClient) {
        this.loadContentItems();
    }

    private loadContentItems() {
        const items: ContentItem[] = [
            { id: 'overview', title: 'Overview', path: '/overview' },
            { id: 'chapter0', title: 'Chapter 0: Foundation', path: '/chapter0' },
            { id: 'chapter1', title: 'Chapter 1: Building Blocks', path: '/chapter1' },
            { id: 'chapter2', title: 'Chapter 2: Scaling', path: '/chapter2' },
            { id: 'chapter3', title: 'Chapter 3: Distributed Systems', path: '/chapter3' },
            { id: 'chapter4', title: 'Chapter 4: Async & Events', path: '/chapter4' },
            { id: 'chapter5', title: 'Chapter 5: Reliability', path: '/chapter5' },
            { id: 'chapter6', title: 'Chapter 6: Security', path: '/chapter6' },
            { id: 'chapter7', title: 'Chapter 7: Observability', path: '/chapter7' },
            { id: 'chapter8', title: 'Chapter 8: Case Studies', path: '/chapter8' },
            { id: 'chapter9', title: 'Chapter 9: URL Shortener Service', path: '/chapter9' }
        ];
        this.contentItems.set(items);
    }

    getContentItems() {
        return this.contentItems;
    }

    getContent(id: string): Observable<string> {
        return this.http.get(`/assets/content/${id}.md`, { responseType: 'text' }).pipe(
            catchError(error => {
                console.error(`Error loading content for ${id}:`, error);
                return of('# Content Not Found\n\nThe requested content could not be loaded.');
            })
        );
    }
}

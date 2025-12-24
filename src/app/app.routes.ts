import { Routes } from '@angular/router';
import { OverviewComponent } from './pages/overview/overview';
import { ChapterComponent } from './pages/chapter/chapter';

export const routes: Routes = [
    { path: '', redirectTo: '/overview', pathMatch: 'full' },
    { path: 'overview', component: OverviewComponent },
    { path: 'chapter0', component: ChapterComponent, data: { chapterId: 'chapter0' } },
    { path: 'chapter1', component: ChapterComponent, data: { chapterId: 'chapter1' } },
    { path: 'chapter2', component: ChapterComponent, data: { chapterId: 'chapter2' } },
    { path: 'chapter3', component: ChapterComponent, data: { chapterId: 'chapter3' } },
    { path: 'chapter4', component: ChapterComponent, data: { chapterId: 'chapter4' } },
    { path: 'chapter5', component: ChapterComponent, data: { chapterId: 'chapter5' } },
    { path: 'chapter6', component: ChapterComponent, data: { chapterId: 'chapter6' } },
    { path: 'chapter7', component: ChapterComponent, data: { chapterId: 'chapter7' } },
    { path: 'chapter8', component: ChapterComponent, data: { chapterId: 'chapter8' } },
    { path: '**', redirectTo: '/overview' }
];

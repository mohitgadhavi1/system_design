import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { switchMap, of, tap, map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

export interface UserProgress {
    completedChapters: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ProgressService {
    private firestore = inject(Firestore);
    private authService = inject(AuthService);

    private userProgress$ = this.authService.user$.pipe(
        switchMap(user => {
            if (!user) return of({ completedChapters: [] } as UserProgress);
            const userDocRef = doc(this.firestore, `system_design_data/${user.uid}`);
            return new Observable<UserProgress>(observer => {
                const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    const data = snapshot.data() as UserProgress;
                    observer.next(data || { completedChapters: [] });
                }, error => observer.error(error));
                return () => unsubscribe();
            });
        })
    );

    // Expose as a signal for easy use in templates
    progress = toSignal<UserProgress | null>(this.userProgress$, { initialValue: null });

    constructor() { }

    async markChapterComplete(chapterId: string) {
        const user = this.authService.currentUser;
        if (!user) return;

        const userDocRef = doc(this.firestore, `system_design_data/${user.uid}`);
        try {
            // Use setDoc with merge: true to ensure document exists
            await setDoc(userDocRef, {
                completedChapters: arrayUnion(chapterId),
                email: user.email,
                name: user.displayName
            }, { merge: true });
        } catch (error) {
            console.error('Error marking chapter complete:', error);
        }
    }

    async markChapterIncomplete(chapterId: string) {
        const user = this.authService.currentUser;
        if (!user) return;

        const userDocRef = doc(this.firestore, `system_design_data/${user.uid}`);
        try {
            await updateDoc(userDocRef, {
                completedChapters: arrayRemove(chapterId)
            });
        } catch (error) {
            console.error('Error marking chapter incomplete:', error);
        }
    }

    isChapterCompleted(chapterId: string): boolean {
        const currentProgress = this.progress();
        return currentProgress?.completedChapters?.includes(chapterId) ?? false;
    }

    getCompletedCount(): number {
        return this.progress()?.completedChapters?.length ?? 0;
    }
}

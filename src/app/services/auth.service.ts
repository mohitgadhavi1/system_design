import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, user, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type { User };

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private firestore: Firestore = inject(Firestore);
    user$: Observable<User | null> = user(this.auth);

    constructor() { }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            await this.syncUserToFirestore(result.user);
            return result.user;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    }

    async signOut() {
        try {
            await firebaseSignOut(this.auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    }

    get currentUser(): User | null {
        return this.auth.currentUser;
    }

    private async syncUserToFirestore(user: User) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);

        // Check for duplicates (same email, different UID)
        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        let oldData = {};
        let mergedChapters: string[] = [];

        for (const d of querySnapshot.docs) {
            if (d.id !== user.uid) {
                console.log(`Found duplicate user ${d.id} for email ${user.email}. Merging and deleting.`);
                // Merge old data
                oldData = { ...oldData, ...d.data() };

                // Merge progress data from system_design_data
                const oldProgressRef = doc(this.firestore, `system_design_data/${d.id}`);
                const oldProgressSnap = await getDoc(oldProgressRef);
                if (oldProgressSnap.exists()) {
                    const data = oldProgressSnap.data();
                    if (data && Array.isArray(data['completedChapters'])) {
                        mergedChapters.push(...data['completedChapters']);
                    }
                    // Delete old progress document
                    await deleteDoc(oldProgressRef);
                }

                // Delete the old/duplicate user document
                await deleteDoc(d.ref);
            }
        }

        // Check/Update current user's progress if we found merged chapters
        if (mergedChapters.length > 0) {
            const currentProgressRef = doc(this.firestore, `system_design_data/${user.uid}`);
            const currentProgressSnap = await getDoc(currentProgressRef);
            let currentChapters: string[] = [];

            if (currentProgressSnap.exists()) {
                const data = currentProgressSnap.data();
                if (data && Array.isArray(data['completedChapters'])) {
                    currentChapters = data['completedChapters'];
                }
            }

            const uniqueChapters = [...new Set([...currentChapters, ...mergedChapters])];

            // Using setDoc with merge: true ensures we create specific fields without overwriting everything if we didn't want to,
            // but here we are managing the 'completedChapters' list specifically.
            await setDoc(currentProgressRef, {
                completedChapters: uniqueChapters
            }, { merge: true });
        }

        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
            // Create new user document, potentially inhibiting old data
            await setDoc(userDocRef, {
                role: 'user',
                user_plan: 'free',
                permissions: [],
                provider: 'google',
                createdAt: serverTimestamp(),
                ...oldData, // Merge old data (e.g. custom role/plan)
                // Always overwrite identity fields
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null,
                lastLoginAt: serverTimestamp()
            });
        } else {
            // Update existing user
            await updateDoc(userDocRef, {
                lastLoginAt: serverTimestamp(),
                email: user.email,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null
            });
        }
    }
}
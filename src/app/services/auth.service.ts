import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        let storedUser = null;

        if (isPlatformBrowser(this.platformId)) {
            const userJson = localStorage.getItem('currentUser');
            if (userJson) {
                try {
                    storedUser = JSON.parse(userJson);
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }
        }

        this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public getCurrentUser(): Observable<User | null> {
        return this.currentUser;
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    public setUser(user: User): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
    }

    public signOut(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('currentUser');
        }
        this.currentUserSubject.next(null);
    }

    public isAuthenticated(): boolean {
        return !!this.currentUserValue;
    }
}
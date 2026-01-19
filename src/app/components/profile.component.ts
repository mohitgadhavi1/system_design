import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

declare var google: any;

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="profile-container">
      <!-- Logged Out State -->
      @if (!isLoggedIn) {
        <div class="login-section">
          <div class="login-card">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Welcome</h2>
            <p class="text-gray-600 mb-6 text-center">Sign in to access your profile</p>
            
            <!-- Google Sign-In Button -->
            <div id="google-signin-button" class="flex justify-center"></div>
          </div>
        </div>
      }

      <!-- Logged In State -->
      @if (isLoggedIn && user) {
        <div class="profile-section">
          <div class="profile-card">
            <div class="flex items-start gap-6">
              <!-- Profile Image -->
              <div class="shrink-0">
                <img 
                  [src]="user.picture" 
                  [alt]="user.name"
                  class="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
                />
              </div>

              <!-- Profile Info -->
              <div class="grow">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ user.name }}</h2>
                <p class="text-gray-600 mb-4">{{ user.email }}</p>
                
                <div class="flex gap-3">
                  <button 
                    (click)="signOut()"
                    class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            <!-- Additional Profile Information -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">Account Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500 mb-1">Full Name</p>
                  <p class="text-gray-800 font-medium">{{ user.name }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500 mb-1">Email</p>
                  <p class="text-gray-800 font-medium">{{ user.email }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500 mb-1">Given Name</p>
                  <p class="text-gray-800 font-medium">{{ user.given_name }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500 mb-1">Family Name</p>
                  <p class="text-gray-800 font-medium">{{ user.family_name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-section, .profile-section {
      width: 100%;
      max-width: 900px;
    }

    .login-card, .profile-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .login-card {
      max-width: 400px;
      margin: 0 auto;
    }

    #google-signin-button {
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .login-card, .profile-card {
        padding: 24px;
      }

      .profile-card .flex {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
    isLoggedIn = false;
    user: any = null;
    googleButtonLoaded = false;

    constructor(
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            // Check if user is already logged in
            this.authService.getCurrentUser().subscribe(user => {
                this.user = user;
                this.isLoggedIn = !!user;
            });

            // Load Google Sign-In only if not logged in
            if (!this.isLoggedIn) {
                this.loadGoogleSignIn();
            }
        }
    }

    loadGoogleSignIn() {
        if (!isPlatformBrowser(this.platformId)) return;

        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            // Script already loaded, just initialize
            this.initializeGoogleSignIn();
            return;
        }

        // Load Google GSI script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.initializeGoogleSignIn();
        };
        document.head.appendChild(script);
    }

    initializeGoogleSignIn() {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: '921307841938-gk0jclpdc4sa4017q8orendjagmhidla.apps.googleusercontent.com',
                callback: (response: any) => this.handleCredentialResponse(response),
                auto_select: false,
            });

            const buttonDiv = document.getElementById('google-signin-button');
            if (buttonDiv && buttonDiv.children.length === 0) {
                google.accounts.id.renderButton(
                    buttonDiv,
                    {
                        theme: 'outline',
                        size: 'large',
                        width: 280,
                        text: 'signin_with',
                        shape: 'rectangular',
                    }
                );
                this.googleButtonLoaded = true;
            }
        }
    }

    handleCredentialResponse(response: any) {
        // Decode the JWT token to get user info
        const payload = this.parseJwt(response.credential);

        this.user = {
            id: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            given_name: payload.given_name,
            family_name: payload.family_name,
        };

        this.isLoggedIn = true;
        this.authService.setUser(this.user);
    }

    parseJwt(token: string) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }

    signOut() {
        if (typeof google !== 'undefined') {
            google.accounts.id.disableAutoSelect();
        }
        this.authService.signOut();
        this.isLoggedIn = false;
        this.user = null;
    }
}
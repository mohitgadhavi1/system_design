import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ProgressService } from '../services/progress.service';
import { ContentService } from '../services/content.service';



@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <!-- Logged Out State -->
      @if (!(user$ | async)) {
        <div class="login-section">
          <div class="login-card">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Welcome</h2>
            <p class="text-gray-600 mb-6 text-center">Sign in to track your progress</p>
            
            <button 
              (click)="signIn()"
              class="w-full py-3 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-6 h-6" alt="Google">
              <span class="text-gray-700 font-medium">Sign in with Google</span>
            </button>
          </div>
        </div>
      }

      <!-- Logged In State -->
      @if (user$ | async; as user) {
        <div class="profile-section">
          <div class="profile-card">
            <div class="flex items-start gap-6">
              <!-- Profile Image -->
              <div class="shrink-0">
                <img 
                  [src]="user.photoURL" 
                  [alt]="user.displayName"
                  class="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg"
                />
              </div>

              <!-- Profile Info -->
              <div class="grow">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">{{ user.displayName }}</h2>
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

            <!-- Progress Information -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">Your Progress</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                 <div class="flex justify-between items-end mb-2">
                    <span class="text-gray-600">Course Completion</span>
                    <span class="text-2xl font-bold text-blue-600">{{ completedChaptersCount }} / {{ totalChapters }}</span>
                 </div>
                 <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" [style.width.%]="progressPercentage"></div>
                 </div>
                 <p class="text-right text-sm text-gray-500 mt-1">{{ progressPercentage }}% completed</p>
              </div>
            </div>

            <!-- Additional Profile Information -->
            <div class="mt-8 pt-6 border-t border-gray-200 hidden">
              <h3 class="text-xl font-semibold text-gray-800 mb-4">Account Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500 mb-1">Full Name</p>
                  <p class="text-gray-800 font-medium">{{ user.displayName }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-500 mb-1">Email</p>
                  <p class="text-gray-800 font-medium">{{ user.email }}</p>
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
export class ProfileComponent {
  authService = inject(AuthService);
  progressService = inject(ProgressService);
  contentService = inject(ContentService); // To get total chapters count

  user$ = this.authService.user$;

  get totalChapters(): number {
    // Exclude 'overview' from total count if desired, or keep it. 
    // Let's verify existing service content. Assuming all items in contentItems are chapters.
    return this.contentService.getContentItems()().length;
  }

  get completedChaptersCount(): number {
    return this.progressService.getCompletedCount();
  }

  get progressPercentage(): number {
    if (this.totalChapters === 0) return 0;
    return Math.round((this.completedChaptersCount / this.totalChapters) * 100);
  }

  async signIn() {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }

  async signOut() {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
}
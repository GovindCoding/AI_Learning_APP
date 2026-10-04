import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <header class="fixed top-0 right-0 left-64 h-20 glass-panel border-b border-borderBg-light dark:border-borderBg-dark flex items-center justify-between px-8 z-20">
      <!-- Page Title -->
      <div>
        <h1 class="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- User Stats & Actions -->
      <div class="flex items-center space-x-6">
        
        <!-- Streak Counter -->
        <div class="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-semibold text-sm shadow-[0_0_10px_rgba(249,115,22,0.1)]">
          <app-icon name="flame" className="w-5 h-5 fill-current animate-pulse"></app-icon>
          <span>{{ authService.user()?.streak || 0 }} Days</span>
        </div>

        <!-- Level & XP Progress bar -->
        <div class="flex flex-col w-48 space-y-1">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-neon-cyan flex items-center gap-1">
              <app-icon name="award" className="w-3.5 h-3.5"></app-icon> Level {{ authService.user()?.level || 1 }}
            </span>
            <span class="text-slate-400">{{ currentXpInLevel }}/{{ nextLevelXp }} XP</span>
          </div>
          <div class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full transition-all duration-500 shadow-neon-cyan"
              [style.width.%]="progressPercent"
            ></div>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button
          (click)="themeService.toggleTheme()"
          class="p-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-850 transition-all duration-300 text-slate-500 hover:text-neon-cyan"
        >
          @if (themeService.theme() === 'dark') {
            <app-icon name="sun" className="w-5 h-5"></app-icon>
          } @else {
            <app-icon name="moon" className="w-5 h-5"></app-icon>
          }
        </button>

        <!-- Notification center -->
        <div class="relative">
          <button
            (click)="showNotifications = !showNotifications"
            class="p-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-850 transition-all duration-300 text-slate-500 hover:text-neon-cyan relative"
          >
            <app-icon name="bell" className="w-5 h-5"></app-icon>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          @if (showNotifications) {
            <div class="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 border border-borderBg-light dark:border-borderBg-dark shadow-2xl z-55">
              <div class="flex items-center justify-between pb-3 border-b border-borderBg-light dark:border-borderBg-dark mb-2">
                <span class="font-semibold text-sm">Notifications</span>
                <app-icon name="sparkles" className="w-4 h-4 text-neon-cyan"></app-icon>
              </div>
              <div class="space-y-2">
                @for (notif of notifications; track notif.id) {
                  <div 
                    class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-xs transition-colors duration-300 cursor-pointer border border-transparent hover:border-neon-cyan/10"
                  >
                    {{ notif.text }}
                  </div>
                }
              </div>
            </div>
          }
        </div>

      </div>
    </header>
  `
})
export class NavbarComponent {
  @Input() pageTitle: string = 'AI Learning Tracker';

  authService = inject(AuthService);
  themeService = inject(ThemeService);

  showNotifications: boolean = false;
  readonly nextLevelXp = 1000;

  get currentXpInLevel(): number {
    const user = this.authService.user();
    return user ? user.xp % this.nextLevelXp : 0;
  }

  get progressPercent(): number {
    return Math.min((this.currentXpInLevel / this.nextLevelXp) * 100, 100);
  }

  get notifications() {
    const user = this.authService.user();
    return [
      { id: 1, text: '🎉 New Roadmap Generated for ' + (user?.learningGoal || 'Generative AI') },
      { id: 2, text: '🔥 5 Day Streak reached! Keep it up!' },
      { id: 3, text: '💡 Suggestion: Check out Claude 3.5 Sonnet in Tools!' }
    ];
  }
}

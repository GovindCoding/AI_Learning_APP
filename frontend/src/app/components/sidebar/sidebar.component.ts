import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <aside class="fixed left-0 top-0 h-full w-64 glass-panel border-r border-borderBg-light dark:border-borderBg-dark flex flex-col z-30">
      <!-- Brand Header -->
      <div class="p-6 border-b border-borderBg-light dark:border-borderBg-dark flex items-center space-x-3">
        <div class="p-2 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-xl shadow-neon-cyan">
          <app-icon name="brain" className="w-6 h-6 text-white"></app-icon>
        </div>
        <span class="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
          AI TRACKER
        </span>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        @for (item of navItems; track item.id) {
          <button
            (click)="selectPage(item.id)"
            [class]="'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ' + 
              (activePage === item.id 
                ? 'bg-gradient-to-r from-neon-cyan/10 to-neon-violet/10 border-l-4 border-neon-cyan text-neon-cyan font-medium' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30')"
          >
            <app-icon 
              [name]="item.icon" 
              [className]="'w-5 h-5 ' + (activePage === item.id ? 'text-neon-cyan' : 'text-slate-500')"
            ></app-icon>
            <span>{{ item.name }}</span>
          </button>
        }
      </nav>

      <!-- User Session Footer -->
      <div class="p-4 border-t border-borderBg-light dark:border-borderBg-dark flex flex-col space-y-3">
        <div class="flex items-center space-x-3 px-2">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-cyan/20 to-neon-violet/20 flex items-center justify-center border border-neon-cyan/30 text-neon-cyan font-bold">
            {{ userInitials }}
          </div>
          <div class="flex-1 overflow-hidden">
            <h4 class="text-sm font-semibold truncate">{{ authService.user()?.username || 'Guest Learner' }}</h4>
            <span class="text-xs text-slate-500 truncate block">Lvl {{ authService.user()?.level || 1 }} • {{ authService.user()?.xp || 0 }} XP</span>
          </div>
        </div>
        <button
          (click)="authService.logout()"
          class="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-300 text-sm"
        >
          <app-icon name="logout" className="w-4 h-4"></app-icon>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activePage: string = 'dashboard';
  @Output() activePageChange = new EventEmitter<string>();

  authService = inject(AuthService);

  get isAdmin(): boolean {
    const user = this.authService.user();
    return !!(user?.roles?.some(r => r.name === 'ROLE_ADMIN') || user?.username === 'AIElora');
  }

  get userInitials(): string {
    const username = this.authService.user()?.username;
    return username ? username.substring(0, 2).toUpperCase() : 'AI';
  }

  get navItems() {
    return [
      { id: 'dashboard', name: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'roadmap', name: 'AI Roadmap', icon: 'map' },
      { id: 'tools', name: 'Tools Directory', icon: 'grid' },
      { id: 'news', name: 'AI News Feed', icon: 'newspaper' },
      { id: 'google-ai', name: 'Google AI Hub', icon: 'sparkles' },
      { id: 'social', name: 'AI Social Studio', icon: 'share-2' },
      { id: 'modules', name: 'Learning Modules', icon: 'book-open' },
      { id: 'profile', name: 'Profile & Stats', icon: 'user' },
      ...(this.isAdmin ? [{ id: 'admin', name: 'Admin Panel', icon: 'shield-alert' }] : []),
      { id: 'settings', name: 'Settings', icon: 'settings' }
    ];
  }

  selectPage(id: string): void {
    this.activePageChange.emit(id);
  }
}

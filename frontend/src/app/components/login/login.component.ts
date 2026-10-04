import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GlassCardComponent } from '../glass-card/glass-card.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 radial-bg relative overflow-hidden bg-background-light dark:bg-background-dark">
      <!-- Orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] animate-pulse-glow" style="animation-delay: 2s;"></div>

      <app-glass-card customClass="w-full max-w-md p-8 relative z-10 border border-borderBg-light dark:border-borderBg-dark">
        <!-- Branding -->
        <div class="flex flex-col items-center justify-center space-y-2 mb-8">
          <div class="p-2.5 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-2xl shadow-neon-cyan animate-bounce">
            <app-icon name="brain" className="w-8 h-8 text-white"></app-icon>
          </div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent tracking-widest mt-2">
            AI TRACKER
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Personalized Learning & Productivity Dashboard</p>
        </div>

        @if (errorMsg) {
          <div class="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-neon-rose font-bold text-center">
            {{ errorMsg }}
          </div>
        }

        <form (submit)="handleSubmit($event)" class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-400 block">Username</label>
            <div class="relative">
              <app-icon name="user" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></app-icon>
              <input
                type="text"
                required
                [(ngModel)]="username"
                name="username"
                placeholder="AIElora"
                class="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          @if (!isLogin) {
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Email Address</label>
              <div class="relative">
                <app-icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></app-icon>
                <input
                  type="email"
                  required
                  [(ngModel)]="email"
                  name="email"
                  placeholder="name@domain.com"
                  class="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>
          }

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-400 block">Password</label>
            <div class="relative">
              <app-icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></app-icon>
              <input
                type="password"
                required
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                class="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-sm shadow-neon-cyan hover:scale-102 active:scale-98 transition-all disabled:opacity-50 mt-6"
          >
            <span>{{ loading ? 'Authenticating...' : isLogin ? 'Access Account' : 'Register Account' }}</span>
          </button>
        </form>

        <div class="text-center mt-6">
          <button
            type="button"
            (click)="isLogin = !isLogin; errorMsg = ''"
            class="text-xs text-neon-cyan hover:underline font-semibold"
          >
            {{ isLogin ? "Don't have an account? Sign Up" : 'Already registered? Log In' }}
          </button>
        </div>
      </app-glass-card>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);

  isLogin: boolean = true;
  username: string = '';
  email: string = '';
  password: string = '';
  errorMsg: string = '';
  loading: boolean = false;

  async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    this.errorMsg = '';
    this.loading = true;

    try {
      if (this.isLogin) {
        const success = await this.authService.login(this.username, this.password);
        if (!success) {
          this.errorMsg = 'Invalid credentials. Password must be >= 4 characters.';
        }
      } else {
        if (!this.email.trim() || !this.username.trim() || this.password.length < 4) {
          this.errorMsg = 'Please fill all fields. Password must be >= 4 characters.';
          this.loading = false;
          return;
        }
        const success = await this.authService.signup(this.username, this.email, this.password);
        if (success) {
          await this.authService.login(this.username, this.password);
        } else {
          this.errorMsg = 'Signup failed. Choose another username.';
        }
      }
    } catch {
      this.errorMsg = 'An unexpected connection error occurred.';
    } finally {
      this.loading = false;
    }
  }
}

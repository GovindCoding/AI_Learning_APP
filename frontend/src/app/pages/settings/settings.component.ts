import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      <!-- Page header -->
      <div class="pb-4 border-b border-borderBg-light dark:border-borderBg-dark">
        <h2 class="text-xl font-bold">Preferences & Configuration</h2>
        <p class="text-xs text-slate-400">Configure API endpoints, AI keys, study styles, and toggle UI appearance settings.</p>
      </div>

      <form (submit)="handleSaveSettings($event)" class="space-y-6">
        
        <!-- Profile/Roadmap Customization -->
        <app-glass-card customClass="space-y-4">
          <div class="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <app-icon name="sliders" className="w-5 h-5 text-neon-cyan"></app-icon>
            <h3 class="font-bold text-base">Curriculum Preferences</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Learning Goal Path</label>
              <select
                [(ngModel)]="formData.learningGoal"
                name="learningGoal"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              >
                <option value="Generative AI Engineer">Generative AI Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="AI Research Scientist">AI Research Scientist</option>
                <option value="Hobbyist Builder">Hobbyist Builder</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Current Knowledge Level</label>
              <select
                [(ngModel)]="formData.skillLevel"
                name="skillLevel"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Study Time Commitment (Hours/Day)</label>
              <input
                type="number"
                [(ngModel)]="formData.hoursPerDay"
                name="hoursPerDay"
                min="0.5"
                max="8"
                step="0.5"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Learning Style Preference</label>
              <select
                [(ngModel)]="formData.learningStyle"
                name="learningStyle"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              >
                <option value="hands-on projects">Hands-on Projects</option>
                <option value="theory & research papers">Theory & Research Papers</option>
                <option value="video lectures & documentation">Video Lectures & Documentation</option>
              </select>
            </div>

          </div>
        </app-glass-card>

        <!-- API Model Credentials -->
        <app-glass-card customClass="space-y-4">
          <div class="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <app-icon name="key" className="w-5 h-5 text-neon-violet"></app-icon>
            <div>
              <h3 class="font-bold text-base">Model API Keys</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">Activate live LLM prompts for chatbots and customized quiz generation.</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Google Gemini API Key</label>
              <input
                type="password"
                [(ngModel)]="apiKeys.geminiKey"
                name="geminiKey"
                placeholder="AIzaSy..."
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">OpenAI API Key</label>
              <input
                type="password"
                [(ngModel)]="apiKeys.openaiKey"
                name="openaiKey"
                placeholder="sk-proj-..."
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>

            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Anthropic API Key</label>
              <input
                type="password"
                [(ngModel)]="apiKeys.anthropicKey"
                name="anthropicKey"
                placeholder="sk-ant-..."
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>
          </div>
        </app-glass-card>

        <!-- Sync Mode -->
        <app-glass-card customClass="space-y-4">
          <div class="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <app-icon name="database" className="w-5 h-5 text-neon-emerald"></app-icon>
            <div>
              <h3 class="font-bold text-base">Backend Connectivity</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">Toggle between offline mock demonstration and running microservices backend integration.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              (click)="syncMode = 'mock'"
              [class]="'p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 ' + 
                (syncMode === 'mock' 
                  ? 'border-neon-emerald bg-neon-emerald/5 text-neon-emerald' 
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500')"
            >
              <span class="font-bold text-sm">Simulated Fallback Mode</span>
              <span class="text-[10px] text-slate-400 leading-relaxed block mt-1">
                Utilize local mock data structures cached in localstorage. Instant setup, ideal for quick testing.
              </span>
            </button>

            <button
              type="button"
              (click)="syncMode = 'backend'"
              [class]="'p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 ' + 
                (syncMode === 'backend' 
                  ? 'border-neon-emerald bg-neon-emerald/5 text-neon-emerald' 
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500')"
            >
              <span class="font-bold text-sm">Spring Cloud Microservices</span>
              <span class="text-[10px] text-slate-400 leading-relaxed block mt-1">
                Route requests to live gateway APIs running on localhost:8080. Requires database and services online.
              </span>
            </button>
          </div>
        </app-glass-card>

        <!-- Clear Data cache and submit controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between border-t border-borderBg-light dark:border-borderBg-dark pt-6 gap-4">
          <button
            type="button"
            (click)="handleClearCache()"
            class="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors text-xs font-semibold"
          >
            <app-icon name="trash-2" className="w-4 h-4"></app-icon>
            <span>Reset Local Progress Cache</span>
          </button>

          <div class="flex items-center space-x-3 self-end md:self-auto">
            @if (saveSuccess) {
              <span class="text-xs text-neon-emerald font-semibold flex items-center gap-1">
                <app-icon name="shield-check" className="w-4 h-4"></app-icon> Settings Saved!
              </span>
            }
            <button
              type="submit"
              class="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
            >
              <app-icon name="save" className="w-4 h-4"></app-icon>
              <span>Save Configurations</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  `
})
export class SettingsComponent implements OnInit {
  authService = inject(AuthService);

  formData = {
    skillLevel: 'Beginner',
    background: 'Software Engineer',
    learningGoal: 'Generative AI Engineer',
    hoursPerDay: 1.5,
    learningStyle: 'hands-on projects'
  };

  apiKeys = {
    geminiKey: '',
    openaiKey: '',
    anthropicKey: ''
  };

  syncMode: string = 'mock';
  saveSuccess: boolean = false;

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.formData = {
        skillLevel: user.skillLevel || 'Beginner',
        background: user.background || 'Software Engineer',
        learningGoal: user.learningGoal || 'Generative AI Engineer',
        hoursPerDay: user.hoursPerDay || 1.5,
        learningStyle: user.learningStyle || 'hands-on projects'
      };
    }

    this.apiKeys = {
      geminiKey: localStorage.getItem('api_gemini_key') || '',
      openaiKey: localStorage.getItem('api_openai_key') || '',
      anthropicKey: localStorage.getItem('api_anthropic_key') || ''
    };

    this.syncMode = localStorage.getItem('api_sync_mode') || 'mock';
  }

  async handleSaveSettings(e: Event): Promise<void> {
    e.preventDefault();
    this.saveSuccess = false;

    await this.authService.submitOnboarding({
      ...this.formData,
      hoursPerDay: Number(this.formData.hoursPerDay)
    });

    localStorage.setItem('api_gemini_key', this.apiKeys.geminiKey);
    localStorage.setItem('api_openai_key', this.apiKeys.openaiKey);
    localStorage.setItem('api_anthropic_key', this.apiKeys.anthropicKey);
    localStorage.setItem('api_sync_mode', this.syncMode);

    this.saveSuccess = true;
    setTimeout(() => { this.saveSuccess = false; }, 3000);
  }

  handleClearCache(): void {
    if (confirm("Are you sure you want to clear your local dashboard progress data? This resets roadmap statuses, favorites, and streaks.")) {
      localStorage.removeItem('ai_nodes');
      localStorage.removeItem('ai_favs');
      localStorage.removeItem('ai_bookmarks');
      localStorage.removeItem('ai_logs');
      localStorage.removeItem('ai_user');
      localStorage.removeItem('ai_token');
      window.location.reload();
    }
  }
}

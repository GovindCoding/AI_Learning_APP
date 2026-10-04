import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center p-6 radial-bg relative overflow-hidden bg-background-light dark:bg-background-dark">
      <!-- Decorative Orbs -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] animate-pulse-glow" style="animation-delay: 2s;"></div>

      <app-glass-card customClass="w-full max-w-2xl border border-borderBg-light dark:border-borderBg-dark p-8 md:p-12 relative z-10">
        
        <!-- Logo/Branding -->
        <div class="flex items-center justify-center space-x-3 mb-8">
          <div class="p-2 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-xl shadow-neon-cyan">
            <app-icon name="brain" className="w-8 h-8 text-white"></app-icon>
          </div>
          <span class="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent tracking-wider">
            AI TRACKER
          </span>
        </div>

        <!-- Progress Dots -->
        <div class="flex justify-center space-x-2 mb-8">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div
              [class]="'h-2 rounded-full transition-all duration-300 ' + 
                (i === step 
                  ? 'w-8 bg-gradient-to-r from-neon-cyan to-neon-violet shadow-neon-cyan' 
                  : i < step ? 'w-2 bg-neon-cyan/40' : 'w-2 bg-slate-350 dark:bg-slate-700')"
            ></div>
          }
        </div>

        <!-- Step Content -->
        <div class="min-h-[220px] flex flex-col justify-center">
          
          <!-- Step 1 -->
          @if (step === 1) {
            <div class="animate-in fade-in duration-300">
              <h2 class="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <app-icon name="star" className="text-neon-cyan w-6 h-6"></app-icon> What is your current AI knowledge level?
              </h2>
              <p class="text-slate-400 text-sm mb-6">This helps us tailor initial concepts and roadmap difficulty.</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                @for (level of skillLevels; track level) {
                  <button
                    type="button"
                    (click)="formData.skillLevel = level"
                    [class]="'p-4 rounded-xl border text-sm font-semibold transition-all duration-300 ' + 
                      (formData.skillLevel === level
                        ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20')"
                  >
                    {{ level }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 2 -->
          @if (step === 2) {
            <div class="animate-in fade-in duration-300">
              <h2 class="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <app-icon name="graduation-cap" className="text-neon-violet w-6 h-6"></app-icon> What is your professional background?
              </h2>
              <p class="text-slate-400 text-sm mb-6">We will adapt mathematical formulations and coding analogies to your profile.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (bg of backgrounds; track bg) {
                  <button
                    type="button"
                    (click)="formData.background = bg"
                    [class]="'p-4 rounded-xl border text-sm font-semibold text-left transition-all duration-300 ' + 
                      (formData.background === bg
                        ? 'border-neon-violet bg-neon-violet/10 text-neon-violet shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20')"
                  >
                    {{ bg }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 3 -->
          @if (step === 3) {
            <div class="animate-in fade-in duration-300">
              <h2 class="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <app-icon name="target" className="text-neon-emerald w-6 h-6"></app-icon> What is your primary learning goal?
              </h2>
              <p class="text-slate-400 text-sm mb-6">Select the focus domain you want to master.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (goal of goals; track goal) {
                  <button
                    type="button"
                    (click)="formData.learningGoal = goal"
                    [class]="'p-4 rounded-xl border text-sm font-semibold text-left transition-all duration-300 ' + 
                      (formData.learningGoal === goal
                        ? 'border-neon-emerald bg-neon-emerald/10 text-neon-emerald shadow-[0_0_15px_rgba(16,119,81,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20')"
                  >
                    {{ goal }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 4 -->
          @if (step === 4) {
            <div class="animate-in fade-in duration-300">
              <h2 class="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <app-icon name="clock" className="text-orange-500 w-6 h-6"></app-icon> How much study time can you commit daily?
              </h2>
              <p class="text-slate-400 text-sm mb-8">We will structure node durations to keep your goals attainable.</p>
              <div class="px-4">
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  [(ngModel)]="formData.hoursPerDay"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan focus:outline-none"
                />
                <div class="flex justify-between text-xs mt-3 text-slate-400 font-semibold">
                  <span>0.5 Hours (Casual)</span>
                  <span>2.0 Hours (Moderate)</span>
                  <span>4.0 Hours (Intense)</span>
                </div>
                <div class="mt-8 text-center bg-slate-100 dark:bg-slate-900/50 rounded-2xl py-3 border border-borderBg-light dark:border-borderBg-dark">
                  <span class="text-lg font-bold text-neon-cyan">{{ formData.hoursPerDay }} Hours</span>
                  <span class="text-xs text-slate-400 block mt-1">Estimated Roadmap Completion: {{ estimatedWeeks }} weeks</span>
                </div>
              </div>
            </div>
          }

          <!-- Step 5 -->
          @if (step === 5) {
            <div class="animate-in fade-in duration-300">
              <h2 class="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <app-icon name="sparkles" className="text-neon-rose w-6 h-6"></app-icon> Choose your preferred study style:
              </h2>
              <p class="text-slate-400 text-sm mb-6">Select how you ingest learning material best.</p>
              <div class="grid grid-cols-1 gap-3">
                @for (style of learningStyles; track style) {
                  <button
                    type="button"
                    (click)="formData.learningStyle = style"
                    [class]="'p-4 rounded-xl border text-sm font-semibold text-left capitalize transition-all duration-300 ' + 
                      (formData.learningStyle === style
                        ? 'border-neon-rose bg-neon-rose/10 text-neon-rose shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20')"
                  >
                    {{ style }}
                  </button>
                }
              </div>
            </div>
          }

        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between mt-10 border-t border-borderBg-light dark:border-borderBg-dark pt-6">
          <button
            type="button"
            (click)="step = step > 1 ? step - 1 : 1"
            [disabled]="step === 1 || loading"
            class="px-6 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
          >
            Back
          </button>
          
          <button
            type="button"
            (click)="handleNext()"
            [disabled]="loading"
            class="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 text-sm font-semibold"
          >
            <span>{{ loading ? 'Initializing Engine...' : step === 5 ? 'Launch Roadmap' : 'Continue' }}</span>
            @if (!loading) {
              <app-icon name="chevron-right" className="w-4 h-4"></app-icon>
            }
          </button>
        </div>

      </app-glass-card>
    </div>
  `
})
export class OnboardingComponent {
  authService = inject(AuthService);
  learningService = inject(LearningService);

  step: number = 1;
  loading: boolean = false;

  formData = {
    skillLevel: 'Beginner',
    background: 'Software Engineer',
    learningGoal: 'Generative AI Engineer',
    hoursPerDay: 1.5,
    learningStyle: 'hands-on projects'
  };

  readonly skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
  readonly backgrounds = ['Software Engineer', 'Student', 'Data Analyst', 'Product Manager', 'Other'];
  readonly goals = ['Become Expert in Gemini Ecosystem', 'Generative AI Engineer', 'Machine Learning Engineer', 'AI Research Scientist', 'Hobbyist Builder'];
  readonly learningStyles = ['hands-on projects', 'theory & research papers', 'video lectures & documentation'];

  get estimatedWeeks(): number {
    return Math.ceil(60 / (this.formData.hoursPerDay * 5));
  }

  handleNext(): void {
    if (this.step < 5) {
      this.step++;
    } else {
      this.handleSubmit();
    }
  }

  async handleSubmit(): Promise<void> {
    this.loading = true;
    try {
      await this.authService.submitOnboarding(this.formData);
      await this.learningService.generateRoadmap(this.formData);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}

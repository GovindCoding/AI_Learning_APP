import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';

interface HeatmapCell {
  date: string;
  hours: number;
  dayOfWeek: number;
  dateLabel: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Upper Profile Banner -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- User Card -->
        <app-glass-card customClass="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8 relative overflow-hidden">
          <!-- Avatar Icon -->
          <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-neon-cyan to-neon-violet flex items-center justify-center border-2 border-neon-cyan/40 shadow-neon-cyan text-3xl font-extrabold text-white flex-shrink-0 animate-pulse-glow">
            {{ userInitials }}
          </div>

          <div class="flex-1 space-y-4 text-center md:text-left">
            <div>
              <div class="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h3 class="text-2xl font-extrabold">{{ authService.user()?.username || 'Learner' }}</h3>
                <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan text-[10px] font-bold border border-neon-cyan/25 w-max mx-auto md:mx-0">
                  <app-icon name="shield" className="w-3 h-3"></app-icon>
                  <span>Verified Learner</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                <app-icon name="mail" className="w-3.5 h-3.5"></app-icon> {{ authService.user()?.email || 'email@example.com' }}
              </p>
            </div>

            <!-- Sub stats -->
            <div class="grid grid-cols-3 gap-4 pt-2 border-t border-borderBg-light dark:border-borderBg-dark text-xs">
              <div>
                <span class="text-slate-400 block font-semibold">Current Goal</span>
                <span class="font-bold text-neon-cyan truncate block">{{ authService.user()?.learningGoal || 'Generative AI' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block font-semibold">Skill Tier</span>
                <span class="font-bold capitalize text-neon-violet block">{{ authService.user()?.skillLevel || 'Beginner' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block font-semibold">Active Since</span>
                <span class="font-bold block">May 2026</span>
              </div>
            </div>
          </div>
        </app-glass-card>

        <!-- Level Stats Widget -->
        <app-glass-card customClass="flex flex-col justify-between p-8 border-l-4 border-neon-violet">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold tracking-widest text-neon-violet bg-neon-violet/10 px-2.5 py-1 rounded-full border border-neon-violet/20">
                Gamification Stats
              </span>
              <app-icon name="trophy" className="w-5 h-5 text-neon-violet"></app-icon>
            </div>

            <div class="space-y-1">
              <span class="text-xs text-slate-400 font-semibold block">Total Accumulated XP</span>
              <h2 class="text-4xl font-black bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
                {{ authService.user()?.xp || 0 }} XP
              </h2>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-xs font-semibold text-slate-400">
                <span>Level {{ authService.user()?.level || 1 }} progression</span>
                <span>{{ currentLevelXp }} / 1000 XP</span>
              </div>
              <div class="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full shadow-neon-cyan transition-all duration-500"
                  [style.width.%]="levelProgressPercent"
                ></div>
              </div>
            </div>
          </div>

          <div class="flex justify-between text-xs pt-4 border-t border-borderBg-light dark:border-borderBg-dark mt-4">
            <span class="text-slate-400">Streak Record:</span>
            <span class="font-bold text-orange-500 flex items-center gap-0.5">
              <app-icon name="flame" className="w-3.5 h-3.5 fill-current"></app-icon> {{ authService.user()?.maxStreak || 0 }} Days max
            </span>
          </div>
        </app-glass-card>

      </div>

      <!-- Git-Style Heatmap Grid -->
      <app-glass-card customClass="space-y-4">
        <div>
          <h3 class="font-bold text-lg flex items-center gap-2">
            <app-icon name="calendar" className="text-neon-cyan w-5 h-5"></app-icon> Learning Velocity Heatmap
          </h3>
          <p class="text-xs text-slate-400">Daily study duration record over the past 98 days (14 weeks)</p>
        </div>

        <!-- Heatmap Container -->
        <div class="overflow-x-auto pb-2">
          <div class="flex space-x-1.5 min-w-[500px] select-none p-1">
            
            <!-- Week Columns -->
            @for (week of heatmapWeeks; track $index) {
              <div class="flex flex-col space-y-1.5">
                @for (cell of week; track $index) {
                  <div
                    [class]="'w-4 h-4 rounded border transition-all duration-300 relative group cursor-pointer ' + 
                      (cell ? getIntensityColor(cell.hours) : 'bg-transparent border-transparent pointer-events-none')"
                  >
                    <!-- Tooltip on hover -->
                    @if (cell) {
                      <span class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-[9px] text-white px-2 py-1 rounded border border-borderBg-dark opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-50">
                        {{ cell.hours.toFixed(1) }} hrs on {{ cell.dateLabel }}
                      </span>
                    }
                  </div>
                }
              </div>
            }

          </div>
        </div>

        <!-- Intensity Legend -->
        <div class="flex justify-between items-center text-[10px] text-slate-400 border-t border-borderBg-light dark:border-borderBg-dark pt-3">
          <span>98 days ago</span>
          <div class="flex items-center space-x-1">
            <span>Less</span>
            <div class="w-3 h-3 rounded bg-slate-200 dark:bg-slate-900 border border-transparent"></div>
            <div class="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/10"></div>
            <div class="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/20"></div>
            <div class="w-3 h-3 rounded bg-emerald-500/70 border border-emerald-500/40"></div>
            <div class="w-3 h-3 rounded bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </app-glass-card>

      <!-- Badges Shelf Grid -->
      <app-glass-card customClass="space-y-6">
        <div>
          <h3 class="font-bold text-lg flex items-center gap-2">
            <app-icon name="award" className="text-neon-violet w-5 h-5"></app-icon> Modern Milestone Achievements
          </h3>
          <p class="text-xs text-slate-400">XP accomplishments and roadmap completions unlocked badges</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @if (badges.length > 0) {
            @for (badge of badges; track badge.id) {
              <div 
                class="flex items-start space-x-4 p-4 rounded-2xl border border-neon-cyan/15 bg-gradient-to-br from-neon-cyan/5 via-transparent to-transparent shadow-[0_4px_15px_rgba(6,182,212,0.02)] group hover:border-neon-cyan/30 transition-all duration-300"
              >
                <div class="p-3 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  <app-icon name="award" className="w-6 h-6"></app-icon>
                </div>
                <div>
                  <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100">{{ badge.name }}</h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ badge.description }}</p>
                  <span class="text-[9px] font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded mt-3 inline-block uppercase tracking-wider">
                    {{ badge.xpRequirement }} XP Required
                  </span>
                </div>
              </div>
            }
          } @else {
            <div class="text-center py-6 text-slate-400 text-xs col-span-full">
              No badges unlocked yet. Keep studying to gain XP!
            </div>
          }
        </div>
      </app-glass-card>

    </div>
  `
})
export class ProfileComponent {
  authService = inject(AuthService);
  learningService = inject(LearningService);

  get userInitials(): string {
    const user = this.authService.user();
    return user?.username ? user.username.substring(0, 2).toUpperCase() : 'AI';
  }

  get currentLevelXp(): number {
    const user = this.authService.user();
    return user ? user.xp % 1000 : 0;
  }

  get levelProgressPercent(): number {
    return (this.currentLevelXp / 1000) * 100;
  }

  get badges() {
    return this.authService.user()?.badges || [];
  }

  get heatmapData(): HeatmapCell[] {
    const dailyLogs = this.learningService.dailyLogs();
    const today = new Date();
    const cells: HeatmapCell[] = [];
    const totalDays = 98;

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.logDate === dateStr);
      const hours = log ? log.hoursLearned : 0;

      cells.push({
        date: dateStr,
        hours,
        dayOfWeek: d.getDay(),
        dateLabel: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }
    return cells;
  }

  get heatmapWeeks(): (HeatmapCell | null)[][] {
    const data = this.heatmapData;
    const weeks: (HeatmapCell | null)[][] = [];
    let currentWeek: (HeatmapCell | null)[] = [];

    const firstCell = data[0];
    if (firstCell && firstCell.dayOfWeek > 0) {
      for (let padding = 0; padding < firstCell.dayOfWeek; padding++) {
        currentWeek.push(null);
      }
    }

    for (const cell of data) {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }

  getIntensityColor(hours: number | undefined): string {
    if (hours === undefined || hours === 0) return 'bg-slate-200 dark:bg-slate-900 border-transparent';
    if (hours < 1.0) return 'bg-emerald-500/20 border-emerald-500/10';
    if (hours < 2.0) return 'bg-emerald-500/40 border-emerald-500/20';
    if (hours < 4.0) return 'bg-emerald-500/70 border-emerald-500/40';
    return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]';
  }
}

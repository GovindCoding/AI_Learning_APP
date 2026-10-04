import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LearningNode, Tool, NewsArticle } from '../../types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Top Banner Message -->
      <div class="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-neon-cyan/10 via-neon-violet/5 to-transparent border border-neon-cyan/20 shadow-glass">
        <div class="relative z-10 max-w-xl">
          <h2 class="text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, <span class="bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">{{ authService.user()?.username || 'Learner' }}</span>!
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
            Your customized path to becoming a <span class="text-neon-cyan font-bold">{{ authService.user()?.learningGoal || 'Generative AI Engineer' }}</span> is {{ round(analytics.progressPercentage) }}% completed. Keep it up!
          </p>
          @if (nextNode) {
            <button
              (click)="navigateTo('roadmap')"
              class="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-neon-cyan"
            >
              <span>Resume Roadmap</span>
              <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          }
        </div>
        <!-- Glow ball -->
        <div class="absolute top-1/2 right-12 -translate-y-1/2 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <!-- Analytics Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Total Hours -->
        <app-glass-card customClass="flex items-center space-x-4">
          <div class="p-3 bg-neon-cyan/15 text-neon-cyan rounded-2xl border border-neon-cyan/20">
            <app-icon name="clock" className="w-6 h-6"></app-icon>
          </div>
          <div>
            <span class="text-xs text-slate-400 block font-medium">Study Duration</span>
            <h3 class="text-2xl font-extrabold mt-0.5">{{ analytics.totalHours.toFixed(1) }} hrs</h3>
            <span class="text-[10px] text-neon-cyan font-semibold flex items-center gap-0.5 mt-0.5">
              <app-icon name="trending-up" className="w-3 h-3"></app-icon> +1.2 hrs today
            </span>
          </div>
        </app-glass-card>

        <!-- Completed Modules -->
        <app-glass-card customClass="flex items-center space-x-4">
          <div class="p-3 bg-neon-emerald/15 text-neon-emerald rounded-2xl border border-neon-emerald/20">
            <app-icon name="check-circle" className="w-6 h-6"></app-icon>
          </div>
          <div>
            <span class="text-xs text-slate-400 block font-medium">Progress Modules</span>
            <h3 class="text-2xl font-extrabold mt-0.5">{{ analytics.completedNodesCount }} / {{ analytics.totalNodesCount }}</h3>
            <div class="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div 
                class="h-full bg-neon-emerald rounded-full transition-all duration-500" 
                [style.width.%]="analytics.progressPercentage"
              ></div>
            </div>
          </div>
        </app-glass-card>

        <!-- Current Streak -->
        <app-glass-card customClass="flex items-center space-x-4">
          <div class="p-3 bg-orange-500/15 text-orange-500 rounded-2xl border border-orange-500/20">
            <app-icon name="flame" className="w-6 h-6 animate-pulse"></app-icon>
          </div>
          <div>
            <span class="text-xs text-slate-400 block font-medium">Daily Streak</span>
            <h3 class="text-2xl font-extrabold mt-0.5">{{ authService.user()?.streak || 0 }} Days</h3>
            <span class="text-[10px] text-slate-400 mt-0.5 block">Max streak: {{ authService.user()?.maxStreak || 0 }} days</span>
          </div>
        </app-glass-card>

        <!-- AI Readiness Score -->
        <app-glass-card customClass="flex items-center space-x-4">
          <div class="p-3 bg-neon-violet/15 text-neon-violet rounded-2xl border border-neon-violet/20">
            <app-icon name="award" className="w-6 h-6"></app-icon>
          </div>
          <div>
            <span class="text-xs text-slate-400 block font-medium">AI Readiness</span>
            <h3 class="text-2xl font-extrabold mt-0.5">{{ analytics.aiReadinessScore }}%</h3>
            <span class="text-[10px] text-neon-violet font-semibold mt-0.5 block">Based on quiz results</span>
          </div>
        </app-glass-card>

      </div>

      <!-- Charts & Next Module Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Weekly Study Chart -->
        <app-glass-card customClass="lg:col-span-2 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="font-bold text-lg">Study Distribution</h3>
              <p class="text-xs text-slate-400">Your total learning hours recorded daily over the past week</p>
            </div>
            <div class="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-neon-cyan border border-borderBg-light dark:border-borderBg-dark">
              Weekly view
            </div>
          </div>
          
          <!-- Smooth SVG Area Chart matching Recharts -->
          <div class="h-64 w-full relative">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#06b6d4" stop-opacity="0.25" />
                  <stop offset="95%" stop-color="#06b6d4" stop-opacity="0" />
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" stroke-dasharray="3 3" stroke-opacity="0.2" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#334155" stroke-dasharray="3 3" stroke-opacity="0.2" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#334155" stroke-dasharray="3 3" stroke-opacity="0.2" />
              
              <!-- Area Path -->
              <path [attr.d]="svgAreaPath" fill="url(#areaGradient)" />
              
              <!-- Line Path -->
              <path [attr.d]="svgLinePath" fill="none" stroke="#06b6d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              
              <!-- Data Points with hover -->
              @for (point of chartCoordinates; track point.day) {
                <circle 
                  [attr.cx]="point.x" 
                  [attr.cy]="point.y" 
                  r="4" 
                  fill="#06b6d4" 
                  stroke="#ffffff" 
                  stroke-width="2" 
                  class="cursor-pointer transition-transform hover:scale-150"
                  (mouseenter)="activeHoverPoint = point"
                  (mouseleave)="activeHoverPoint = null"
                />
              }
            </svg>

            <!-- Tooltip overlay -->
            @if (activeHoverPoint) {
              <div 
                class="absolute bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-xl border border-white/10 shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full"
                [style.left.%]="activeHoverPoint.pctX"
                [style.top.px]="activeHoverPoint.pxY - 10"
              >
                <span class="font-bold">{{ activeHoverPoint.day }}:</span> {{ activeHoverPoint.hours }} hrs
              </div>
            }

            <!-- X-axis Labels -->
            <div class="flex justify-between text-[11px] text-slate-400 mt-2 px-2">
              @for (item of chartData; track item.name) {
                <span>{{ item.name }}</span>
              }
            </div>
          </div>
        </app-glass-card>

        <!-- Next recommended module widget -->
        <app-glass-card customClass="flex flex-col justify-between border-l-4 border-neon-cyan">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-[10px] uppercase font-bold tracking-widest text-neon-cyan bg-neon-cyan/10 px-2.5 py-1 rounded-full border border-neon-cyan/20">
                Recommended Node
              </span>
              <app-icon name="book-open" className="w-5 h-5 text-slate-400"></app-icon>
            </div>

            @if (nextNode) {
              <h3 class="text-xl font-bold mb-2 leading-snug">{{ nextNode.title }}</h3>
              <p class="text-slate-400 text-xs leading-relaxed mb-4">
                {{ nextNode.description }}
              </p>
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400">Estimated duration:</span>
                  <span class="font-semibold">{{ nextNode.durationHours }} hours</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400">Level:</span>
                  <span class="font-semibold capitalize text-neon-cyan">{{ nextNode.difficulty }}</span>
                </div>
              </div>
            } @else {
              <div class="text-center py-6 text-slate-400 text-xs">
                🎉 All nodes completed! You have finished your current goal. Use the admin panel or settings to launch a new one.
              </div>
            }
          </div>

          @if (nextNode) {
            <button
              (click)="navigateTo('modules')"
              class="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/60 transition-all duration-300 text-sm font-semibold"
            >
              <span>Begin Module Quiz & Materials</span>
              <app-icon name="arrow-right" className="w-4 h-4"></app-icon>
            </button>
          }
        </app-glass-card>

      </div>

      <!-- Lower Row: Trending Tools & News Updates -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Trending AI Tools Widget -->
        <app-glass-card customClass="space-y-4">
          <div class="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <app-icon name="sparkles" className="text-neon-cyan w-5 h-5"></app-icon> Trending AI Tools
            </h3>
            <button 
              (click)="navigateTo('tools')"
              class="text-xs text-neon-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Explore directory <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          </div>

          <div class="space-y-3">
            @for (tool of trendingTools; track tool.id) {
              <div 
                class="flex items-center justify-between p-3 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/20 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-all duration-300"
              >
                <div>
                  <h4 class="font-bold text-sm">{{ tool.name }}</h4>
                  <span class="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block border border-borderBg-light dark:border-borderBg-dark">
                    {{ tool.category }}
                  </span>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <span class="text-xs font-bold text-neon-cyan">{{ tool.popularityScore }}</span>
                    <span class="text-[9px] text-slate-500 block">Popularity</span>
                  </div>
                  <a
                    [href]="tool.websiteLink"
                    target="_blank"
                    rel="noreferrer"
                    class="p-2 bg-slate-150 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-lg transition-colors border border-borderBg-light dark:border-borderBg-dark"
                  >
                    <app-icon name="arrow-up-right" className="w-4 h-4"></app-icon>
                  </a>
                </div>
              </div>
            }
          </div>
        </app-glass-card>

        <!-- Key AI News Articles -->
        <app-glass-card customClass="space-y-4">
          <div class="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <app-icon name="book-open" className="text-neon-violet w-5 h-5"></app-icon> Recent AI Updates
            </h3>
            <button 
              (click)="navigateTo('news')"
              class="text-xs text-neon-violet hover:underline flex items-center gap-1 font-semibold"
            >
              See news feed <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          </div>

          <div class="space-y-3.5">
            @for (article of keyNews; track article.id) {
              <div 
                class="space-y-1.5 p-3 rounded-xl border border-transparent hover:border-neon-violet/10 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-all duration-300 cursor-pointer"
                (click)="navigateTo('news')"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[9px] uppercase font-bold tracking-wider text-neon-violet bg-neon-violet/10 px-2 py-0.5 rounded border border-neon-violet/15">
                    {{ article.category }}
                  </span>
                  <span class="text-[10px] text-slate-400">
                    {{ formatDate(article.publishedDate) }}
                  </span>
                </div>
                <h4 class="font-bold text-sm leading-snug line-clamp-1 hover:text-neon-violet transition-colors">
                  {{ article.title }}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {{ article.summary }}
                </p>
              </div>
            }
          </div>
        </app-glass-card>

      </div>

    </div>
  `
})
export class DashboardComponent {
  @Output() setActivePage = new EventEmitter<string>();

  authService = inject(AuthService);
  learningService = inject(LearningService);

  activeHoverPoint: any = null;

  round = Math.round;

  get analytics() {
    return this.learningService.getAnalyticsSummary();
  }

  get nextNode(): LearningNode | undefined {
    return this.learningService.nodes().find(n => n.status !== 'COMPLETED');
  }

  get chartData() {
    return Object.entries(this.analytics.weeklyDistribution).map(([day, hours]) => ({
      name: day,
      hours: parseFloat(hours.toFixed(1))
    }));
  }

  get trendingTools(): Tool[] {
    return [...this.learningService.tools()]
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 3);
  }

  get keyNews(): NewsArticle[] {
    return this.learningService.news().slice(0, 2);
  }

  get chartCoordinates() {
    const data = this.chartData;
    const maxVal = Math.max(...data.map(d => d.hours), 4);
    const width = 500;
    const height = 180;
    const step = width / (data.length - 1);

    return data.map((d, i) => {
      const x = i * step;
      const y = height - (d.hours / maxVal) * (height - 30) - 10;
      return {
        day: d.name,
        hours: d.hours,
        x,
        y,
        pctX: (x / width) * 100,
        pxY: (y / height) * 200
      };
    });
  }

  get svgLinePath(): string {
    const coords = this.chartCoordinates;
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }

  get svgAreaPath(): string {
    const coords = this.chartCoordinates;
    if (coords.length === 0) return '';
    const line = this.svgLinePath;
    const last = coords[coords.length - 1];
    const first = coords[0];
    return `${line} L ${last.x} 190 L ${first.x} 190 Z`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  navigateTo(page: string): void {
    this.setActivePage.emit(page);
  }
}

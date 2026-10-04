import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { Tool } from '../../types';

@Component({
  selector: 'app-tools-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Top Search & Filter Bar -->
      <app-glass-card customClass="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <app-icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search models, databases, vector stores..."
            class="w-full bg-slate-100 dark:bg-slate-900/50 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>

        <!-- Favorite toggle -->
        <button
          (click)="showOnlyFavs = !showOnlyFavs"
          [class]="'flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-300 ' + 
            (showOnlyFavs 
              ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]' 
              : 'border-borderBg-light dark:border-borderBg-dark hover:border-rose-500/30 hover:text-rose-500')"
        >
          <app-icon name="heart" [className]="'w-4 h-4 ' + (showOnlyFavs ? 'fill-current' : '')"></app-icon>
          <span>My Favorites ({{ learningService.favorites().length }})</span>
        </button>
      </app-glass-card>

      <!-- Tabs / Filter Pills -->
      <div class="space-y-4">
        <!-- Categories -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-2">
          @for (cat of categories; track cat) {
            <button
              (click)="selectedCategory = cat"
              [class]="'text-xs font-semibold px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-300 ' + 
                (selectedCategory === cat
                  ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/50 text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-900/10')"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Pricing Filters -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-2">
          <span class="text-xs text-slate-400 font-semibold pr-2">Pricing:</span>
          @for (p of pricingFilters; track p) {
            <button
              (click)="selectedPricing = p"
              [class]="'text-xs font-medium px-3.5 py-1.5 rounded-xl border capitalize whitespace-nowrap transition-all duration-300 ' + 
                (selectedPricing === p
                  ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/50 text-slate-500 dark:text-slate-400')"
            >
              {{ p.toLowerCase().replace('_', ' ') }}
            </button>
          }
        </div>
      </div>

      <!-- Grid of Tools -->
      @if (filteredTools.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (tool of filteredTools; track tool.id) {
            <app-glass-card 
              customClass="flex flex-col justify-between border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/20 group relative h-full"
            >
              <div>
                
                <!-- Top Header Indicators -->
                <div class="flex items-center justify-between mb-3.5">
                  <span class="text-[10px] font-bold text-neon-cyan uppercase tracking-wider bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded">
                    {{ tool.category }}
                  </span>
                  
                  <!-- Favorite Heart Button -->
                  <button
                    (click)="learningService.toggleToolFavorite(tool.id)"
                    [class]="'p-1.5 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:bg-rose-500/10 transition-colors ' + 
                      (isFav(tool.id) ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-slate-400 hover:text-rose-500')"
                  >
                    <app-icon name="heart" [className]="'w-4 h-4 ' + (isFav(tool.id) ? 'fill-current' : '')"></app-icon>
                  </button>
                </div>

                <!-- Title & Ratings -->
                <div class="flex items-start justify-between mb-1.5">
                  <h3 class="font-bold text-base leading-snug group-hover:text-neon-cyan transition-colors">
                    {{ tool.name }}
                  </h3>
                  
                  @if (tool.popularityScore >= 9.0) {
                    <span class="text-[9px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 animate-pulse">
                      Popular
                    </span>
                  }
                </div>

                <!-- Rating Stars -->
                <div class="flex items-center space-x-1 mb-3">
                  <div class="flex text-amber-500">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <app-icon 
                        name="star" 
                        [className]="'w-3.5 h-3.5 ' + (star <= roundRating(tool.communityRating) ? 'fill-current' : 'opacity-30')"
                      ></app-icon>
                    }
                  </div>
                  <span class="text-xs text-slate-400 font-bold">
                    {{ tool.communityRating.toFixed(1) }}
                  </span>
                </div>

                <!-- Description -->
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {{ tool.description }}
                </p>

                <!-- Features tags if any -->
                @if (tool.features) {
                  <div class="flex flex-wrap gap-1 mb-4">
                    @for (f of getFeaturesList(tool.features); track f) {
                      <span class="text-[9px] font-semibold text-slate-400 bg-slate-100/50 dark:bg-slate-900/30 border border-borderBg-light dark:border-borderBg-dark px-2 py-0.5 rounded-full capitalize">
                        {{ f }}
                      </span>
                    }
                  </div>
                }

              </div>

              <!-- Lower Action Links -->
              <div class="border-t border-borderBg-light dark:border-borderBg-dark pt-4 mt-4 flex items-center justify-between text-xs font-semibold">
                <span class="text-[10px] text-slate-400 bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded border border-borderBg-light dark:border-borderBg-dark">
                  {{ tool.pricing }}
                </span>
                
                <div class="flex items-center space-x-3">
                  
                  <!-- Github link -->
                  @if (tool.githubLink) {
                    <a 
                      [href]="tool.githubLink"
                      target="_blank"
                      rel="noreferrer"
                      class="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-lg transition-colors border border-borderBg-light dark:border-borderBg-dark"
                      title="GitHub Repository"
                    >
                      <app-icon name="code" className="w-3.5 h-3.5"></app-icon>
                    </a>
                  }

                  <!-- API Docs -->
                  @if (tool.apiDocsLink) {
                    <a 
                      [href]="tool.apiDocsLink"
                      target="_blank"
                      rel="noreferrer"
                      class="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-lg transition-colors border border-borderBg-light dark:border-borderBg-dark"
                      title="API Documentation"
                    >
                      <app-icon name="terminal" className="w-3.5 h-3.5"></app-icon>
                    </a>
                  }

                  <!-- Main Website Webpage -->
                  <a 
                    [href]="tool.websiteLink"
                    target="_blank"
                    rel="noreferrer"
                    class="flex items-center space-x-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs px-3.5 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
                  >
                    <span>Visit</span>
                    <app-icon name="external-link" className="w-3.5 h-3.5"></app-icon>
                  </a>

                </div>
              </div>

            </app-glass-card>
          }
        </div>
      } @else {
        <div class="text-center py-16 glass-panel rounded-2xl border border-borderBg-light dark:border-borderBg-dark">
          <p class="text-slate-400 text-sm">No tools matching your search criteria were found.</p>
        </div>
      }

    </div>
  `
})
export class ToolsDirectoryComponent {
  learningService = inject(LearningService);

  searchQuery: string = '';
  selectedCategory: string = 'All';
  selectedPricing: string = 'All';
  showOnlyFavs: boolean = false;

  readonly pricingFilters = ['All', 'FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE'];

  get categories(): string[] {
    const cats = new Set(this.learningService.tools().map(t => t.category));
    return ['All', ...Array.from(cats)];
  }

  get filteredTools(): Tool[] {
    const tools = this.learningService.tools();
    const query = this.searchQuery.toLowerCase();
    const favs = this.learningService.favorites();

    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(query) ||
                            tool.description.toLowerCase().includes(query) ||
                            (tool.tags && tool.tags.toLowerCase().includes(query));
      const matchesCategory = this.selectedCategory === 'All' || tool.category === this.selectedCategory;
      const matchesPricing = this.selectedPricing === 'All' || tool.pricing === this.selectedPricing;
      const matchesFav = !this.showOnlyFavs || favs.includes(tool.id);

      return matchesSearch && matchesCategory && matchesPricing && matchesFav;
    });
  }

  isFav(toolId: number): boolean {
    return this.learningService.favorites().includes(toolId);
  }

  roundRating(rating: number): number {
    return Math.round(rating);
  }

  getFeaturesList(featuresStr: string): string[] {
    return featuresStr.split(',').slice(0, 3).map(f => f.trim());
  }
}

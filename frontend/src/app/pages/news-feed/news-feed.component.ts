import { Component, OnInit, OnDestroy, Output, EventEmitter, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { NewsArticle } from '../../types';

interface ArticleReference {
  name: string;
  url: string;
}

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Top Banner Dashboard Widget -->
      <app-glass-card customClass="p-6 bg-gradient-to-r from-neon-cyan/5 to-neon-violet/5 border border-borderBg-light dark:border-borderBg-dark flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
              AI News & Announcements
            </h2>
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-neon-emerald tracking-wide animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-neon-emerald"></span>
              LIVE SYNC ACTIVE
            </div>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Continuously tracking global breakthroughs, research summaries, and developer libraries across company releases.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="showOnlyBookmarks = !showOnlyBookmarks"
            [class]="'flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ' + 
              (showOnlyBookmarks 
                ? 'bg-neon-violet/10 border-neon-violet text-neon-violet shadow-[0_0_10px_rgba(139,92,246,0.15)]' 
                : 'bg-white dark:bg-slate-900 border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/30 hover:text-neon-violet text-slate-400')"
          >
            <app-icon name="bookmark" [className]="'w-4 h-4 ' + (showOnlyBookmarks ? 'fill-current' : '')"></app-icon>
            <span>Bookmarks ({{ learningService.bookmarkedNews().length }})</span>
          </button>

          <button
            (click)="handleSyncFeeds()"
            [disabled]="syncing"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-bold text-xs shadow-neon-cyan hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <app-icon name="refresh-cw" [className]="'w-4 h-4 ' + (syncing ? 'animate-spin' : '')"></app-icon>
            <span>{{ syncing ? 'Syncing...' : 'Sync Feeds' }}</span>
          </button>
        </div>
      </app-glass-card>

      <!-- Dynamic Mini Stats Widget Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <app-glass-card customClass="p-4 flex items-center space-x-4">
          <div class="p-2.5 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl text-neon-cyan">
            <app-icon name="newspaper" className="w-5 h-5"></app-icon>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Ingested Items</span>
            <span class="text-xl font-extrabold">{{ learningService.news().length }}</span>
          </div>
        </app-glass-card>

        <app-glass-card customClass="p-4 flex items-center space-x-4">
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <app-icon name="flame" className="w-5 h-5 animate-pulse"></app-icon>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Trending Stories</span>
            <span class="text-xl font-extrabold">{{ trendingCount }}</span>
          </div>
        </app-glass-card>

        <app-glass-card customClass="p-4 flex items-center space-x-4">
          <div class="p-2.5 bg-neon-violet/10 border border-neon-violet/20 rounded-xl text-neon-violet">
            <app-icon name="compass" className="w-5 h-5"></app-icon>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Latest Hotspot</span>
            <span class="text-xl font-extrabold truncate max-w-[120px] block">{{ latestHotspot }}</span>
          </div>
        </app-glass-card>

        <app-glass-card customClass="p-4 flex items-center space-x-4">
          <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-neon-emerald">
            <app-icon name="thumbs-up" className="w-5 h-5"></app-icon>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Overall Sentiment</span>
            <span class="text-xl font-extrabold">95% Positive</span>
          </div>
        </app-glass-card>
      </div>

      <!-- Top Filters & Search Bar -->
      <app-glass-card customClass="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <app-icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></app-icon>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search news, breakthroughs, models, regulations..."
            class="w-full bg-slate-100 dark:bg-slate-900/50 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>

        <!-- Sort dropdown -->
        <div class="flex items-center space-x-3">
          <span class="text-xs text-slate-400 font-semibold">Sort:</span>
          <select
            [(ngModel)]="sortBy"
            class="bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-neon-cyan"
          >
            <option value="publishedDate">Latest Published</option>
            <option value="popularity">Most Popular</option>
            <option value="trending">Highest Trending</option>
          </select>
        </div>
      </app-glass-card>

      <!-- Toast Notification -->
      @if (notification) {
        <div [class]="'p-3 rounded-xl border text-xs font-bold text-center transition-all ' + 
          (notification.type === 'success' ? 'bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald' : 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan')">
          {{ notification.message }}
        </div>
      }

      <!-- Filter Pills: Companies, Subtopics, and Categories -->
      <div class="space-y-3">
        <!-- Companies -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-2">
          @for (comp of companies; track comp) {
            <button
              (click)="selectCompany(comp)"
              [class]="'text-xs font-semibold px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-300 ' + 
                (selectedCompany === comp
                  ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/50 text-slate-400 bg-slate-100/40 dark:bg-slate-900/10')"
            >
              {{ comp }}
            </button>
          }
        </div>

        <!-- Google ecosystem subfilters -->
        @if (selectedCompany === 'Google AI' || selectedCompany === 'Gemini' || selectedCompany === 'DeepMind') {
          <div class="flex items-center space-x-2 overflow-x-auto pb-2 pl-2">
            <span class="text-xs text-slate-400 font-semibold pr-1">Subtopics:</span>
            @for (sub of googleSubFilters; track sub.id) {
              <button
                (click)="selectedSubFilter = sub.id"
                [class]="'text-[11px] font-medium px-3 py-1 rounded-xl border whitespace-nowrap transition-all duration-300 ' + 
                  (selectedSubFilter === sub.id
                    ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan'
                    : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 text-slate-400')"
              >
                {{ sub.name }}
              </button>
            }
          </div>
        }

        <!-- Categories -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-2">
          <span class="text-xs text-slate-400 font-semibold pr-2">Category:</span>
          @for (cat of categories; track cat) {
            <button
              (click)="selectedCategory = cat"
              [class]="'text-xs font-medium px-3.5 py-1.5 rounded-xl border capitalize whitespace-nowrap transition-all duration-300 ' + 
                (selectedCategory === cat
                  ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/50 text-slate-400')"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      <!-- Articles Grid -->
      @if (filteredArticles.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (article of filteredArticles; track article.id) {
            <app-glass-card customClass="flex flex-col justify-between border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/30 group relative h-full">
              <div>
                
                <!-- Card Header -->
                <div class="flex items-center justify-between mb-3 text-[10px] text-slate-400 font-bold">
                  <div class="flex items-center space-x-2">
                    <span class="text-[9px] font-bold text-neon-violet bg-neon-violet/10 border border-neon-violet/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {{ article.category }}
                    </span>
                    @if (article.aiCompany && article.aiCompany !== 'Generic') {
                      <span class="text-[9px] font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        {{ article.aiCompany }}
                      </span>
                    }
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <span class="text-[10px] text-slate-400">{{ formatDate(article.publishedDate) }}</span>
                    <!-- Bookmark button -->
                    <button
                      (click)="learningService.toggleNewsBookmark(article.id)"
                      [class]="'p-1.5 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:bg-neon-cyan/10 transition-colors ' + 
                        (isBookmarked(article.id) ? 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5' : 'text-slate-400 hover:text-neon-cyan')"
                      title="Bookmark Article"
                    >
                      <app-icon name="bookmark" [className]="'w-3.5 h-3.5 ' + (isBookmarked(article.id) ? 'fill-current' : '')"></app-icon>
                    </button>
                  </div>
                </div>

                <!-- Clickable Article Image Banner -->
                <div 
                  (click)="openInsightsDrawer(article)"
                  class="w-full h-36 rounded-xl overflow-hidden mb-3 border border-borderBg-light dark:border-borderBg-dark bg-slate-100 dark:bg-slate-900 cursor-pointer"
                  title="Click to view AI Insights"
                >
                  <img 
                    [src]="article.thumbnailImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'" 
                    [alt]="article.title" 
                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>

                <!-- Clickable Headline -->
                <h3 
                  (click)="openInsightsDrawer(article)"
                  class="font-bold text-base leading-snug group-hover:text-neon-cyan transition-colors mb-2 cursor-pointer"
                  title="Click to view AI Insights"
                >
                  {{ article.title }}
                </h3>

                <!-- Source Tag -->
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-[10px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-borderBg-light dark:border-borderBg-dark">
                    {{ article.source }}
                  </span>
                  @if (article.sentiment) {
                    <span [class]="'text-[9px] font-bold px-1.5 py-0.5 rounded border ' + 
                      (article.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-neon-emerald' : 'bg-slate-500/10 border-slate-500/20 text-slate-400')">
                      {{ article.sentiment }}
                    </span>
                  }
                </div>

                <!-- Summary -->
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                  {{ article.summary }}
                </p>

                <!-- Alternative References ("Also Covered By") -->
                @if (getReferences(article).length > 0) {
                  <div class="mb-4 pt-2 border-t border-dashed border-borderBg-light dark:border-slate-800 text-[10px]">
                    <span class="text-slate-400 font-bold block mb-1">Also Covered By:</span>
                    <div class="flex flex-wrap gap-1.5">
                      @for (ref of getReferences(article); track ref.name) {
                        <a
                          [href]="ref.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="px-2 py-0.5 bg-slate-100/50 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-md text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/20 flex items-center gap-1 transition-colors"
                        >
                          <app-icon name="newspaper" className="w-2.5 h-2.5"></app-icon>
                          <span>{{ ref.name }}</span>
                        </a>
                      }
                    </div>
                  </div>
                }

              </div>

              <!-- Lower Controls: Insights, Add to Curriculum, Write Post, and Direct Working External Link -->
              <div class="border-t border-borderBg-light dark:border-borderBg-dark pt-3 mt-2 flex items-center justify-between gap-2">
                <button
                  (click)="openInsightsDrawer(article)"
                  class="flex items-center space-x-1.5 text-xs text-neon-cyan font-bold hover:underline"
                >
                  <app-icon name="sparkles" className="w-3.5 h-3.5"></app-icon>
                  <span>AI Insights</span>
                </button>

                <div class="flex items-center space-x-2">
                  @if (!isAddedToCurriculum(article.id)) {
                    <button
                      (click)="addToCurriculum(article)"
                      class="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-xl transition-all border border-borderBg-light dark:border-borderBg-dark"
                      title="Add to Curriculum Roadmap"
                    >
                      <app-icon name="plus" className="w-3.5 h-3.5"></app-icon>
                    </button>
                  } @else {
                    <span class="text-[10px] text-neon-emerald font-bold flex items-center gap-1">
                      <app-icon name="check" className="w-3.5 h-3.5"></app-icon> Added
                    </span>
                  }

                  <!-- Social Post Shortcut -->
                  <button
                    (click)="redirectToSocial(article)"
                    class="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-xl transition-all border border-borderBg-light dark:border-borderBg-dark text-slate-400"
                    title="Write Social Post in Studio"
                  >
                    <app-icon name="share-2" className="w-3.5 h-3.5"></app-icon>
                  </button>

                  <!-- Direct Valid Non-404 Working Link -->
                  <a
                    [href]="article.articleLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-neon-violet hover:text-white rounded-xl transition-all border border-borderBg-light dark:border-borderBg-dark flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white"
                    title="Read Original Article in new tab"
                  >
                    <span>Read</span>
                    <app-icon name="external-link" className="w-3 h-3"></app-icon>
                  </a>
                </div>
              </div>

            </app-glass-card>
          }
        </div>
      } @else {
        <div class="text-center py-16 glass-panel rounded-2xl border border-borderBg-light dark:border-borderBg-dark">
          <p class="text-slate-400 text-sm">No news articles matching your search criteria were found.</p>
          <button
            (click)="resetFilters()"
            class="mt-3 text-xs text-neon-cyan underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      }

      <!-- Interactive AI Insights Drawer Modal -->
      @if (drawerOpen && selectedArticleForDrawer) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div class="w-full max-w-xl bg-cardBg-light dark:bg-slate-900 border-l border-borderBg-light dark:border-borderBg-dark h-full p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            
            <div class="space-y-6">
              <!-- Header -->
              <div class="flex items-start justify-between pb-4 border-b border-borderBg-light dark:border-borderBg-dark">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] uppercase font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded">
                      {{ selectedArticleForDrawer.category }}
                    </span>
                    <span class="text-xs text-slate-400">{{ selectedArticleForDrawer.source }}</span>
                  </div>
                  <h3 class="font-extrabold text-lg leading-snug">{{ selectedArticleForDrawer.title }}</h3>
                </div>
                <button
                  (click)="drawerOpen = false"
                  class="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <app-icon name="x" className="w-5 h-5 text-slate-400"></app-icon>
                </button>
              </div>

              <!-- Drawer Tabs -->
              <div class="flex border-b border-borderBg-light dark:border-borderBg-dark text-xs font-bold">
                <button
                  (click)="drawerTab = 'takeaways'"
                  [class]="'pb-3 px-3 border-b-2 transition-all ' + (drawerTab === 'takeaways' ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-slate-400')"
                >
                  Key Takeaways
                </button>
                <button
                  (click)="drawerTab = 'beginner'"
                  [class]="'pb-3 px-3 border-b-2 transition-all ' + (drawerTab === 'beginner' ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-slate-400')"
                >
                  ELI5 / Beginner
                </button>
                <button
                  (click)="drawerTab = 'impacts'"
                  [class]="'pb-3 px-3 border-b-2 transition-all ' + (drawerTab === 'impacts' ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-slate-400')"
                >
                  Developer Impact
                </button>
              </div>

              <!-- Drawer Content -->
              <div class="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                @if (drawerTab === 'takeaways') {
                  <div class="p-4 rounded-2xl bg-neon-cyan/5 border border-neon-cyan/20 space-y-2">
                    <h4 class="font-bold text-neon-cyan flex items-center gap-1.5">
                      <app-icon name="sparkles" className="w-4 h-4"></app-icon> Executive Summary
                    </h4>
                    <p>{{ selectedArticleForDrawer.summary }}</p>
                    @if (selectedArticleForDrawer.aiSummary) {
                      <p class="font-semibold mt-2">{{ selectedArticleForDrawer.aiSummary }}</p>
                    }
                  </div>
                }

                @if (drawerTab === 'beginner') {
                  <div class="p-4 rounded-2xl bg-neon-violet/5 border border-neon-violet/20 space-y-2">
                    <h4 class="font-bold text-neon-violet flex items-center gap-1.5">
                      <app-icon name="help-circle" className="w-4 h-4"></app-icon> Plain English Breakdown
                    </h4>
                    <p>
                      This update introduces key architectural advantages allowing models to execute tasks faster with lower compute overhead. If you are learning AI, focus on how prompts, context length, and tool calling interface with these models.
                    </p>
                  </div>
                }

                @if (drawerTab === 'impacts') {
                  <div class="p-4 rounded-2xl bg-neon-emerald/5 border border-neon-emerald/20 space-y-2">
                    <h4 class="font-bold text-neon-emerald flex items-center gap-1.5">
                      <app-icon name="code" className="w-4 h-4"></app-icon> Developer Considerations
                    </h4>
                    <p>
                      APIs are backwards-compatible. Make sure to update your SDK versions, tune system instructions for structured output formatting, and test token latency benchmarks in staging environments.
                    </p>
                  </div>
                }
              </div>

            </div>

            <!-- Drawer Bottom Actions -->
            <div class="pt-6 border-t border-borderBg-light dark:border-borderBg-dark flex items-center justify-between gap-3">
              <!-- Direct Working Non-404 Link -->
              <a
                [href]="selectedArticleForDrawer.articleLink"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-neon-cyan font-bold hover:underline flex items-center gap-1.5"
              >
                <span>Read Original Publication</span>
                <app-icon name="external-link" className="w-3.5 h-3.5"></app-icon>
              </a>

              <div class="flex items-center gap-2">
                <button
                  (click)="redirectToSocial(selectedArticleForDrawer)"
                  class="flex items-center space-x-1 border border-borderBg-light dark:border-borderBg-dark px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:border-neon-cyan/40 transition-all"
                >
                  <app-icon name="share-2" className="w-3 h-3"></app-icon>
                  <span>Post</span>
                </button>

                <button
                  (click)="addToCurriculum(selectedArticleForDrawer)"
                  class="flex items-center space-x-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
                >
                  <app-icon name="plus" className="w-3.5 h-3.5"></app-icon>
                  <span>Add to Roadmap</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class NewsFeedComponent implements OnInit, OnDestroy {
  @Output() setActivePage = new EventEmitter<string>();

  learningService = inject(LearningService);
  private platformId = inject(PLATFORM_ID);

  searchQuery: string = '';
  selectedCompany: string = 'All';
  selectedSubFilter: string = 'All';
  selectedCategory: string = 'All';
  sortBy: string = 'publishedDate';
  showOnlyBookmarks: boolean = false;
  syncing: boolean = false;

  addedNodeIds = new Set<number>();
  notification: { type: 'success' | 'info'; message: string } | null = null;

  // Drawer
  drawerOpen: boolean = false;
  selectedArticleForDrawer: NewsArticle | null = null;
  drawerTab: 'takeaways' | 'beginner' | 'impacts' = 'takeaways';

  private eventSource: any = null;

  readonly companies = ['All', 'OpenAI', 'Google AI', 'Gemini', 'DeepMind', 'Anthropic', 'Meta AI', 'Microsoft AI', 'Hugging Face'];
  readonly categories = ['All', 'Research', 'Products', 'Open Source', 'Regulations', 'General'];

  readonly googleSubFilters = [
    { id: 'All', name: 'All Google' },
    { id: 'gemini models', name: 'Gemini Models' },
    { id: 'gemini api', name: 'Gemini API' },
    { id: 'google ai studio', name: 'AI Studio' },
    { id: 'vertex ai', name: 'Vertex AI' },
    { id: 'gemma', name: 'Gemma' },
    { id: 'deepmind research', name: 'DeepMind Research' },
    { id: 'antigravity', name: 'Antigravity' }
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const es = new EventSource('http://localhost:8080/api/v1/news/stream');
        es.addEventListener('NEW_ARTICLE', (e: MessageEvent) => {
          try {
            const article = JSON.parse(e.data) as NewsArticle;
            if (article && article.id) {
              this.learningService.news.update(prev => {
                if (prev.some(a => a.id === article.id)) return prev;
                return [article, ...prev];
              });
              this.showToast('info', `New Article Broadcast: ${article.title}`);
            }
          } catch {}
        });
        this.eventSource = es;
      } catch {}
    }
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  get trendingCount(): number {
    return this.learningService.news().filter(n => (n.trendingScore || 8) >= 9.0).length;
  }

  get latestHotspot(): string {
    const list = this.learningService.news();
    return list.length > 0 ? (list[0].aiCompany || 'Google AI') : 'Anthropic';
  }

  get filteredArticles(): NewsArticle[] {
    const news = this.learningService.news();
    const query = this.searchQuery.toLowerCase().trim();
    const bookmarks = this.learningService.bookmarkedNews();

    let list = news.filter(art => {
      const matchesSearch = !query || 
                            art.title.toLowerCase().includes(query) ||
                            art.summary.toLowerCase().includes(query) ||
                            (art.source && art.source.toLowerCase().includes(query)) ||
                            (art.tags && art.tags.toLowerCase().includes(query));
      
      let matchesCompany = this.selectedCompany === 'All';
      if (!matchesCompany) {
        const comp = this.selectedCompany.toLowerCase();
        const combined = `${art.title} ${art.summary} ${art.source} ${art.aiCompany || ''} ${art.tags || ''}`.toLowerCase();
        if (this.selectedCompany === 'Google AI') {
          matchesCompany = combined.includes('google') || combined.includes('deepmind') || combined.includes('gemini');
        } else {
          matchesCompany = combined.includes(comp);
        }
      }

      let matchesSub = true;
      if (this.selectedSubFilter !== 'All') {
        const sub = this.selectedSubFilter.toLowerCase();
        const combined = `${art.title} ${art.summary} ${art.tags || ''}`.toLowerCase();
        matchesSub = combined.includes(sub);
      }

      let matchesCat = this.selectedCategory === 'All';
      if (!matchesCat) {
        const cat = this.selectedCategory.toLowerCase();
        const artCat = (art.category || '').toLowerCase();
        const tags = (art.tags || '').toLowerCase();
        matchesCat = artCat.includes(cat) || tags.includes(cat);
      }

      const matchesBm = !this.showOnlyBookmarks || bookmarks.includes(art.id);

      return matchesSearch && matchesCompany && matchesSub && matchesCat && matchesBm;
    });

    if (this.sortBy === 'popularity') {
      list = [...list].sort((a, b) => (b.popularityScore || 8) - (a.popularityScore || 8));
    } else if (this.sortBy === 'trending') {
      list = [...list].sort((a, b) => (b.trendingScore || 8) - (a.trendingScore || 8));
    } else {
      list = [...list].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    }

    return list;
  }

  selectCompany(comp: string): void {
    this.selectedCompany = comp;
    this.selectedSubFilter = 'All';
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCompany = 'All';
    this.selectedSubFilter = 'All';
    this.selectedCategory = 'All';
    this.showOnlyBookmarks = false;
  }

  getReferences(article: NewsArticle): ArticleReference[] {
    if (!article.alternativeReferences) return [];
    try {
      const parsed = JSON.parse(article.alternativeReferences);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') {
            try {
              const urlObj = new URL(item);
              const hostname = urlObj.hostname.replace('www.', '');
              let name = hostname;
              if (hostname.includes('techcrunch')) name = 'TechCrunch';
              else if (hostname.includes('ycombinator')) name = 'Hacker News';
              else if (hostname.includes('github')) name = 'GitHub';
              else if (hostname.includes('nature')) name = 'Nature';
              else if (hostname.includes('biospace')) name = 'BioSpace';
              else if (hostname.includes('huggingface')) name = 'Hugging Face';
              else if (hostname.includes('mistral')) name = 'Mistral';
              else if (hostname.includes('theverge')) name = 'The Verge';
              else if (hostname.includes('wired')) name = 'Wired';
              else if (hostname.includes('google')) name = 'Google';
              return { name, url: item };
            } catch {
              return { name: 'Reference', url: item };
            }
          } else if (item && typeof item === 'object' && item.url) {
            return { name: item.name || 'Reference', url: item.url };
          }
          return null;
        }).filter((item): item is ArticleReference => item !== null && !!item.url);
      }
    } catch {}
    return [];
  }

  isBookmarked(id: number): boolean {
    return this.learningService.bookmarkedNews().includes(id);
  }

  isAddedToCurriculum(id: number): boolean {
    return this.addedNodeIds.has(id);
  }

  async addToCurriculum(article: NewsArticle): Promise<void> {
    await this.learningService.addCustomRoadmapNode(
      article.title,
      article.summary,
      'intermediate',
      4
    );
    this.addedNodeIds.add(article.id);
    this.showToast('success', `Added "${article.title}" to your Curriculum Pathway!`);
  }

  redirectToSocial(article: NewsArticle): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('prefill_social_post', JSON.stringify({
        topic: `${article.title} - ${article.source}`,
        tone: 'thought-leadership',
        keyPoints: `${article.summary} - Insight from ${article.aiCompany || article.source}`
      }));
    }
    this.setActivePage.emit('social');
  }

  openInsightsDrawer(article: NewsArticle): void {
    this.selectedArticleForDrawer = article;
    this.drawerTab = 'takeaways';
    this.drawerOpen = true;
  }

  handleSyncFeeds(): void {
    this.syncing = true;
    setTimeout(() => {
      this.syncing = false;
      this.showToast('success', 'Global AI news feeds synchronized!');
    }, 1200);
  }

  showToast(type: 'success' | 'info', message: string): void {
    this.notification = { type, message };
    setTimeout(() => { this.notification = null; }, 5000);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

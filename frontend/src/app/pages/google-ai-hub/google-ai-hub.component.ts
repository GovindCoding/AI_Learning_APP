import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { Tool, NewsArticle, LearningNode } from '../../types';

@Component({
  selector: 'app-google-ai-hub',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Top Ecosystem Tabs -->
      <div class="flex items-center space-x-3 pb-2 border-b border-borderBg-light dark:border-borderBg-dark overflow-x-auto">
        <button
          (click)="handleTabTransition('google')"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'google'
              ? 'bg-gradient-to-r from-neon-cyan to-blue-600 text-white shadow-neon-cyan'
              : 'border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="sparkles" className="w-4 h-4"></app-icon>
          <span>Google AI Ecosystem</span>
        </button>

        <button
          (click)="handleTabTransition('gemini')"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'gemini'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-violet'
              : 'border border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/40 text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="cpu" className="w-4 h-4"></app-icon>
          <span>Gemini & Gemma Models</span>
        </button>

        <button
          (click)="handleTabTransition('deepmind')"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'deepmind'
              ? 'bg-gradient-to-r from-neon-violet to-neon-rose text-white shadow-neon-violet'
              : 'border border-borderBg-light dark:border-borderBg-dark hover:border-neon-rose/40 text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="atom" className="w-4 h-4"></app-icon>
          <span>DeepMind Frontier Research</span>
        </button>
      </div>

      <!-- Ecosystem Hero Showcase Banner -->
      <div class="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-neon-cyan/15 via-neon-violet/10 to-transparent border border-neon-cyan/25 shadow-glass">
        <div class="relative z-10 max-w-2xl space-y-3">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neon-cyan/15 text-neon-cyan text-[10px] font-bold border border-neon-cyan/25">
            <app-icon name="sparkles" className="w-3.5 h-3.5"></app-icon>
            <span>{{ heroSubtitle }}</span>
          </div>

          <h2 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {{ heroTitle }}
          </h2>

          <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            {{ heroDescription }}
          </p>

          <div class="pt-2 flex flex-wrap gap-3">
            @if (activeTab === 'gemini') {
              <button
                (click)="launchGeminiTrack()"
                class="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
              >
                <span>{{ isGeminiTrackActive ? 'Track Active in Roadmap' : 'Activate 8-Week Gemini Track' }}</span>
                <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
              </button>
            }
            <a
              [href]="heroDocsLink"
              target="_blank"
              rel="noreferrer"
              class="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Explore Official Documentation</span>
              <app-icon name="external-link" className="w-3.5 h-3.5"></app-icon>
            </a>
          </div>
        </div>

        <div class="absolute top-1/2 right-8 -translate-y-1/2 w-48 h-48 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <!-- Gemini Guided Track Pathway (When Tab is Gemini or Active) -->
      @if (activeTab === 'gemini') {
        <app-glass-card customClass="space-y-4 border-l-4 border-neon-cyan">
          <div class="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3">
            <div>
              <h3 class="font-bold text-base flex items-center gap-2">
                <app-icon name="compass" className="w-5 h-5 text-neon-cyan"></app-icon> Gemini Developer Curriculum Track
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Specialized track covering Gemini 1.5 Pro, AI Studio, RAG, Vertex AI, and Antigravity tooling.</p>
            </div>
            <button
              (click)="navigateTo('roadmap')"
              class="text-xs text-neon-cyan font-semibold hover:underline flex items-center gap-1"
            >
              View Full Roadmap <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            @for (node of geminiTrackNodes; track node.title) {
              <div class="p-3 rounded-xl border border-borderBg-light dark:border-borderBg-dark bg-slate-100/30 dark:bg-slate-900/30 space-y-1.5">
                <div class="flex items-center justify-between text-[10px] text-slate-400">
                  <span class="font-bold text-neon-cyan uppercase">{{ node.difficulty }}</span>
                  <span>{{ node.durationHours }}h</span>
                </div>
                <h4 class="font-bold text-xs leading-snug">{{ node.title }}</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{{ node.description }}</p>
              </div>
            }
          </div>
        </app-glass-card>
      }

      <!-- Ecosystem Tools Cards -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <app-icon name="grid" className="w-5 h-5 text-neon-cyan"></app-icon> Featured Ecosystem Tools & APIs
          </h3>
          <span class="text-xs text-slate-400">{{ tabTools.length }} Tools in Catalog</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (tool of tabTools; track tool.id) {
            <app-glass-card customClass="flex flex-col justify-between border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/30 group h-full">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-bold text-neon-cyan uppercase tracking-wider bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded">
                    {{ tool.category }}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-borderBg-light dark:border-borderBg-dark">
                    {{ tool.pricing }}
                  </span>
                </div>

                <h4 class="font-bold text-base group-hover:text-neon-cyan transition-colors leading-snug mb-1">
                  {{ tool.name }}
                </h4>

                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {{ tool.description }}
                </p>
              </div>

              <div class="border-t border-borderBg-light dark:border-borderBg-dark pt-3 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-bold">★ {{ tool.communityRating.toFixed(1) }}</span>
                <a
                  [href]="tool.websiteLink"
                  target="_blank"
                  rel="noreferrer"
                  class="flex items-center space-x-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs px-3.5 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
                >
                  <span>Launch Tool</span>
                  <app-icon name="external-link" className="w-3.5 h-3.5"></app-icon>
                </a>
              </div>
            </app-glass-card>
          }
        </div>
      </div>

      <!-- Ecosystem News Articles -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <app-icon name="newspaper" className="w-5 h-5 text-neon-violet"></app-icon> Latest Ecosystem Announcements & Research
          </h3>
          <button
            (click)="navigateTo('news')"
            class="text-xs text-neon-violet font-semibold hover:underline flex items-center gap-1"
          >
            Explore all news <app-icon name="arrow-up-right" className="w-3.5 h-3.5"></app-icon>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (article of tabNews; track article.id) {
            <app-glass-card customClass="p-4 space-y-2 cursor-pointer hover:border-neon-violet/30 transition-all" (click)="navigateTo('news')">
              <div class="flex items-center justify-between text-[10px]">
                <span class="uppercase font-bold text-neon-violet bg-neon-violet/10 px-2 py-0.5 rounded border border-neon-violet/20">
                  {{ article.category }}
                </span>
                <span class="text-slate-400">{{ formatDate(article.publishedDate) }}</span>
              </div>
              <h4 class="font-bold text-sm leading-snug line-clamp-1 hover:text-neon-violet transition-colors">
                {{ article.title }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {{ article.summary }}
              </p>
            </app-glass-card>
          }
        </div>
      </div>

    </div>
  `
})
export class GoogleAiHubComponent implements OnInit {
  @Output() setActivePage = new EventEmitter<string>();

  learningService = inject(LearningService);

  activeTab: 'google' | 'gemini' | 'deepmind' = 'google';

  readonly geminiTrackNodes = [
    { title: 'Gemini API & Google AI Studio', difficulty: 'beginner', durationHours: 6, description: 'Master rapid prototyping and multimodal system instructions.' },
    { title: 'Prompt Engineering with Gemini', difficulty: 'beginner', durationHours: 8, description: 'Design complex schemas and function calling structures.' },
    { title: 'Gemini Multimodal Processing', difficulty: 'intermediate', durationHours: 10, description: 'Process hours of video, audio, and large codebases natively.' },
    { title: 'RAG with Vertex AI Vector Search', difficulty: 'intermediate', durationHours: 12, description: 'Ground model queries on private enterprise repositories.' },
    { title: 'Gemma Open Models Tuning', difficulty: 'advanced', durationHours: 14, description: 'Run Gemma locally using vLLM and fine-tune using LoRA.' },
    { title: 'Autonomous Gemini Agents', difficulty: 'advanced', durationHours: 16, description: 'Orchestrate autonomous agent networks using LangGraph & CrewAI.' },
    { title: 'On-Device Android AI (Nano)', difficulty: 'advanced', durationHours: 18, description: 'Deploy low-latency local inference on mobile devices.' }
  ];

  ngOnInit(): void {
    const saved = localStorage.getItem('google_ai_active_tab');
    if (saved === 'google' || saved === 'gemini' || saved === 'deepmind') {
      this.activeTab = saved;
    }
  }

  handleTabTransition(tab: 'google' | 'gemini' | 'deepmind'): void {
    this.activeTab = tab;
    localStorage.setItem('google_ai_active_tab', tab);
    const path = tab === 'google' ? '/ai/google' : tab === 'gemini' ? '/ai/gemini' : '/ai/deepmind';
    window.history.pushState(null, '', path);
  }

  get isGeminiTrackActive(): boolean {
    return this.learningService.nodes().some(n => n.title.toLowerCase().includes('gemini'));
  }

  async launchGeminiTrack(): Promise<void> {
    await this.learningService.generateRoadmap({ learningGoal: 'Become Expert in Gemini Ecosystem' });
    this.navigateTo('roadmap');
  }

  get heroSubtitle(): string {
    switch (this.activeTab) {
      case 'google': return 'Google AI Ecosystem';
      case 'gemini': return 'Multimodal Gemini & Gemma Stack';
      case 'deepmind': return 'DeepMind Breakthrough Research';
    }
  }

  get heroTitle(): string {
    switch (this.activeTab) {
      case 'google': return 'Next-Generation AI for Developers & Creators';
      case 'gemini': return 'Native Multimodal Intelligence with 2M+ Context';
      case 'deepmind': return 'Frontier Science, Biology & Creative Video Models';
    }
  }

  get heroDescription(): string {
    switch (this.activeTab) {
      case 'google': return 'Explore AI Studio, NotebookLM, Vertex AI, and Google Search AI integrations built to augment productivity and app development.';
      case 'gemini': return 'Build powerful applications with Gemini 1.5 Pro, Flash, open-weights Gemma models, and Antigravity developer agent orchestration.';
      case 'deepmind': return 'Discover AlphaFold 3 biomolecular mapping, Veo cinematic video generation, Lyria audio modeling, and robotics breakthroughs.';
    }
  }

  get heroDocsLink(): string {
    switch (this.activeTab) {
      case 'google': return 'https://ai.google.dev';
      case 'gemini': return 'https://ai.google.dev/docs';
      case 'deepmind': return 'https://deepmind.google';
    }
  }

  get tabTools(): Tool[] {
    const tools = this.learningService.tools();
    return tools.filter(tool => {
      const nameLower = tool.name.toLowerCase();
      const tagsLower = tool.tags?.toLowerCase() || '';

      if (this.activeTab === 'google') {
        return nameLower.includes('studio') || nameLower.includes('notebooklm') || nameLower.includes('vertex') || nameLower.includes('imagen');
      } else if (this.activeTab === 'gemini') {
        return nameLower.includes('gemini') || nameLower.includes('antigravity');
      } else {
        return nameLower.includes('alphafold') || nameLower.includes('veo') || nameLower.includes('lyria') || tagsLower.includes('deepmind') || tagsLower.includes('biology');
      }
    });
  }

  get tabNews(): NewsArticle[] {
    const news = this.learningService.news();
    return news.filter(article => {
      const titleLower = article.title.toLowerCase();
      const summaryLower = article.summary.toLowerCase();
      const tagsLower = article.tags?.toLowerCase() || '';
      const catLower = article.category?.toLowerCase() || '';
      const content = `${titleLower} ${summaryLower} ${tagsLower} ${catLower}`;

      if (this.activeTab === 'google') {
        return (content.includes('google') || content.includes('studio') || content.includes('search') || content.includes('workspace')) && 
               !content.includes('deepmind') && !content.includes('alphafold') && !content.includes('omni') && !content.includes('antigravity');
      } else if (this.activeTab === 'gemini') {
        return content.includes('gemini') || content.includes('gemma') || content.includes('antigravity') || content.includes('omni') || content.includes('astra');
      } else {
        return content.includes('deepmind') || content.includes('alphafold') || content.includes('biology') || content.includes('veo') || content.includes('lyria');
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  navigateTo(page: string): void {
    this.setActivePage.emit(page);
  }
}

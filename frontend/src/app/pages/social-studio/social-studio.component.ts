import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-social-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Top Studio Tabs -->
      <div class="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-2 overflow-x-auto">
        <button
          (click)="activeTab = 'generator'"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'generator'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan'
              : 'border border-borderBg-light dark:border-borderBg-dark text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="sparkles" className="w-4 h-4"></app-icon>
          <span>AI Post Generator</span>
        </button>

        <button
          (click)="activeTab = 'canvas'; scheduleCanvasRender()"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'canvas'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan'
              : 'border border-borderBg-light dark:border-borderBg-dark text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="palette" className="w-4 h-4"></app-icon>
          <span>Canvas Studio (Banners)</span>
        </button>

        <button
          (click)="activeTab = 'calendar'"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'calendar'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan'
              : 'border border-borderBg-light dark:border-borderBg-dark text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="calendar" className="w-4 h-4"></app-icon>
          <span>Calendar & Drafts ({{ drafts.length }})</span>
        </button>

        <button
          (click)="activeTab = 'analytics'"
          [class]="'flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-300 whitespace-nowrap ' + 
            (activeTab === 'analytics'
              ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan'
              : 'border border-borderBg-light dark:border-borderBg-dark text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="bar-chart-2" className="w-4 h-4"></app-icon>
          <span>Social Analytics</span>
        </button>
      </div>

      <!-- Toast Feedback -->
      @if (copySuccess) {
        <div class="p-3 rounded-xl bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald text-xs font-bold text-center">
          Copied content to clipboard!
        </div>
      }

      <!-- 1. POST GENERATOR TAB -->
      @if (activeTab === 'generator') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Generation Parameters Card -->
          <app-glass-card customClass="space-y-4">
            <h3 class="font-bold text-base flex items-center gap-2">
              <app-icon name="sparkles" className="w-4 h-4 text-neon-cyan"></app-icon> Craft Viral LinkedIn & Twitter Posts
            </h3>

            <!-- Source Type -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Content Source</label>
              <div class="grid grid-cols-2 gap-2">
                @for (type of sourceTypes; track type.id) {
                  <button
                    type="button"
                    (click)="sourceType = type.id"
                    [class]="'p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ' + 
                      (sourceType === type.id 
                        ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' 
                        : 'border-borderBg-light dark:border-borderBg-dark text-slate-400 hover:border-slate-500')"
                  >
                    {{ type.name }}
                  </button>
                }
              </div>
            </div>

            <!-- News Picker if Source is NEWS -->
            @if (sourceType === 'NEWS') {
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400 block">Select AI News Article</label>
                <select
                  [(ngModel)]="selectedNewsId"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-cyan"
                >
                  <option value="">-- Choose an Article --</option>
                  @for (art of learningService.news(); track art.id) {
                    <option [value]="art.id">{{ art.title }} ({{ art.source }})</option>
                  }
                </select>
              </div>
            }

            <!-- Tool Picker if Source is TOOL -->
            @if (sourceType === 'TOOL') {
              <div class="space-y-1">
                <label class="text-xs font-semibold text-slate-400 block">Select AI Tool from Catalog</label>
                <select
                  [(ngModel)]="selectedToolId"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-cyan"
                >
                  <option value="">-- Choose a Tool --</option>
                  @for (t of learningService.tools(); track t.id) {
                    <option [value]="t.id">{{ t.name }} ({{ t.category }})</option>
                  }
                </select>
              </div>
            }

            <!-- Custom Context / Prompt -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Optional Personal Perspective / Notes</label>
              <textarea
                [(ngModel)]="customPrompt"
                rows="3"
                placeholder="Add your unique developer takeaway or project context..."
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl p-3 text-xs focus:outline-none focus:border-neon-cyan"
              ></textarea>
            </div>

            <!-- Writing Tone -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-400 block">Writing Tone</label>
              <div class="flex flex-wrap gap-2">
                @for (tone of tones; track tone) {
                  <button
                    type="button"
                    (click)="selectedTone = tone"
                    [class]="'px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ' + 
                      (selectedTone === tone 
                        ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet' 
                        : 'border-borderBg-light dark:border-borderBg-dark text-slate-400')"
                  >
                    {{ tone }}
                  </button>
                }
              </div>
            </div>

            <!-- Submit Button -->
            <button
              (click)="generatePost()"
              [disabled]="isGenerating"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs shadow-neon-cyan hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <app-icon name="sparkles" className="w-4 h-4"></app-icon>
              <span>{{ isGenerating ? 'Synthesizing Social Post...' : 'Generate AI Post' }}</span>
            </button>
          </app-glass-card>

          <!-- Generated Post Output Preview -->
          <app-glass-card customClass="flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-3">
                <span class="font-bold text-sm">Post Preview</span>
                @if (generatedPost) {
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="copyPostContent()"
                      class="flex items-center space-x-1 text-xs text-neon-cyan font-bold hover:underline"
                    >
                      <app-icon name="copy" className="w-3.5 h-3.5"></app-icon>
                      <span>Copy</span>
                    </button>
                    <button
                      (click)="sendToCanvas()"
                      class="flex items-center space-x-1 text-xs text-neon-violet font-bold hover:underline"
                    >
                      <app-icon name="palette" className="w-3.5 h-3.5"></app-icon>
                      <span>Create Banner</span>
                    </button>
                  </div>
                }
              </div>

              @if (generatedPost) {
                <div class="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  <div class="p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl">
                    <span class="text-[10px] font-bold text-neon-cyan uppercase block mb-1">Headline Hook:</span>
                    <p class="font-bold text-sm leading-snug">{{ generatedPost.hook }}</p>
                  </div>

                  <p class="whitespace-pre-line">{{ generatedPost.fullContent }}</p>

                  <div class="pt-2 text-neon-cyan font-semibold">
                    {{ generatedPost.hashtags }}
                  </div>
                </div>
              } @else {
                <div class="text-center py-20 text-slate-400 space-y-2">
                  <app-icon name="sparkles" className="w-8 h-8 mx-auto text-slate-500"></app-icon>
                  <p class="text-xs">Select your parameters and click "Generate AI Post" to generate LinkedIn hooks, threads, and insights.</p>
                </div>
              }
            </div>

            @if (generatedPost) {
              <div class="pt-4 border-t border-borderBg-light dark:border-borderBg-dark flex items-center justify-end space-x-3">
                <button
                  (click)="saveDraft()"
                  class="px-4 py-2 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Save to Drafts
                </button>
              </div>
            }
          </app-glass-card>

        </div>
      }

      <!-- 2. CANVAS STUDIO TAB -->
      @if (activeTab === 'canvas') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Banner Controls -->
          <app-glass-card customClass="lg:col-span-1 space-y-4">
            <h3 class="font-bold text-base flex items-center gap-2">
              <app-icon name="palette" className="w-4 h-4 text-neon-cyan"></app-icon> Banner Customizer
            </h3>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-slate-400 block">Aspect Ratio</label>
              <select
                [(ngModel)]="bannerSize"
                (change)="renderCanvas()"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
              >
                <option value="linkedin">LinkedIn Banner (1200 x 627)</option>
                <option value="twitter">Twitter / X (1200 x 675)</option>
                <option value="instagram">Instagram Post (1080 x 1080)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-slate-400 block">Gradient Theme</label>
              <select
                [(ngModel)]="bannerBg"
                (change)="renderCanvas()"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
              >
                <option value="Modern AI">Modern AI (Cyan & Indigo)</option>
                <option value="Cyber Navy">Cyber Navy (Deep Slate & Sky)</option>
                <option value="Minimal Violet">Minimal Violet (Purple & Rose)</option>
                <option value="Emerald Glow">Emerald Glow (Mint & Green)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-slate-400 block">Banner Headline</label>
              <input
                type="text"
                [(ngModel)]="bannerTitle"
                (input)="renderCanvas()"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-slate-400 block">Supporting Description</label>
              <textarea
                [(ngModel)]="bannerSummary"
                (input)="renderCanvas()"
                rows="3"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
              ></textarea>
            </div>

            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-slate-400 block">Tag / Category</label>
              <input
                type="text"
                [(ngModel)]="bannerTag"
                (input)="renderCanvas()"
                class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <button
              (click)="downloadBanner()"
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs shadow-neon-cyan hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <app-icon name="download" className="w-4 h-4"></app-icon>
              <span>Download PNG Banner</span>
            </button>
          </app-glass-card>

          <!-- Live Canvas Render Pane -->
          <div class="lg:col-span-2 space-y-4">
            <h3 class="font-bold text-base">Live Preview</h3>
            <div class="glass-panel p-4 rounded-3xl border border-borderBg-light dark:border-borderBg-dark flex items-center justify-center overflow-hidden">
              <canvas #bannerCanvas class="max-w-full rounded-2xl shadow-2xl border border-white/10"></canvas>
            </div>
          </div>

        </div>
      }

      <!-- 3. CALENDAR & DRAFTS TAB -->
      @if (activeTab === 'calendar') {
        <app-glass-card customClass="space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-borderBg-light dark:border-borderBg-dark">
            <h3 class="font-bold text-base flex items-center gap-2">
              <app-icon name="calendar" className="w-5 h-5 text-neon-cyan"></app-icon> Content Pipeline & Scheduled Posts
            </h3>
            <span class="text-xs text-slate-400">{{ drafts.length }} Saved Drafts</span>
          </div>

          <div class="space-y-4">
            @for (draft of drafts; track draft.id) {
              <div class="p-4 rounded-2xl border border-borderBg-light dark:border-borderBg-dark bg-slate-100/20 dark:bg-slate-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] uppercase font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20">
                      {{ draft.platforms }}
                    </span>
                    <span class="text-xs font-bold">{{ draft.title }}</span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-xl">{{ draft.content }}</p>
                </div>
                <div class="flex items-center space-x-2 self-end md:self-auto">
                  <button
                    (click)="copyText(draft.content)"
                    class="p-2 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs hover:text-neon-cyan"
                    title="Copy Text"
                  >
                    <app-icon name="copy" className="w-4 h-4"></app-icon>
                  </button>
                  <button
                    (click)="deleteDraft(draft.id)"
                    class="p-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs"
                    title="Delete Draft"
                  >
                    <app-icon name="trash-2" className="w-4 h-4"></app-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </app-glass-card>
      }

      <!-- 4. SOCIAL ANALYTICS TAB -->
      @if (activeTab === 'analytics') {
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <app-glass-card customClass="space-y-1">
              <span class="text-xs text-slate-400">Total Generated</span>
              <h3 class="text-2xl font-black text-neon-cyan">24</h3>
            </app-glass-card>
            <app-glass-card customClass="space-y-1">
              <span class="text-xs text-slate-400">Shared to LinkedIn</span>
              <h3 class="text-2xl font-black text-neon-violet">18</h3>
            </app-glass-card>
            <app-glass-card customClass="space-y-1">
              <span class="text-xs text-slate-400">Banners Downloaded</span>
              <h3 class="text-2xl font-black text-neon-emerald">12</h3>
            </app-glass-card>
            <app-glass-card customClass="space-y-1">
              <span class="text-xs text-slate-400">Audience Impressions</span>
              <h3 class="text-2xl font-black text-orange-500">4,820</h3>
            </app-glass-card>
          </div>

          <app-glass-card customClass="space-y-4">
            <h3 class="font-bold text-base">Top Performing Hashtags</h3>
            <div class="flex flex-wrap gap-2">
              @for (tag of popularHashtags; track tag) {
                <span class="px-3 py-1.5 rounded-xl border border-neon-cyan/20 bg-neon-cyan/10 text-neon-cyan text-xs font-semibold">
                  {{ tag }}
                </span>
              }
            </div>
          </app-glass-card>
        </div>
      }

    </div>
  `
})
export class SocialStudioComponent implements OnInit, AfterViewInit {
  @ViewChild('bannerCanvas') bannerCanvasRef?: ElementRef<HTMLCanvasElement>;

  authService = inject(AuthService);
  learningService = inject(LearningService);

  activeTab: 'generator' | 'canvas' | 'calendar' | 'analytics' = 'generator';

  sourceType: 'NEWS' | 'TOOL' | 'LEARNING_STREAK' | 'GENERAL' = 'NEWS';
  selectedNewsId: string = '';
  selectedToolId: string = '';
  customPrompt: string = '';
  selectedTone: string = 'Professional';

  isGenerating: boolean = false;
  copySuccess: boolean = false;

  generatedPost: any = null;

  bannerSize: 'linkedin' | 'twitter' | 'instagram' = 'linkedin';
  bannerBg: string = 'Modern AI';
  bannerTitle: string = 'Mastering Modern AI Engineering';
  bannerSummary: string = 'How frontier multimodal models and vector databases are transforming developer architectures.';
  bannerTag: string = 'AI Creator Studio';

  drafts = [
    { id: 1, title: 'Claude 3.5 Sonnet Coding Benchmarks', content: 'Anthropic Claude 3.5 Sonnet is setting new records in coding precision. Here are 3 architectural insights every engineer should know...', platforms: 'LinkedIn', status: 'Draft' },
    { id: 2, title: 'Gemini 1.5 Pro Multimodal Deep Dive', content: 'Processing 2 Million tokens natively changes everything for document intelligence and video comprehension...', platforms: 'Twitter / X', status: 'Scheduled' }
  ];

  readonly sourceTypes = [
    { id: 'NEWS' as const, name: '📰 AI News Breakthrough' },
    { id: 'TOOL' as const, name: '🛠️ Tool Spotlight' },
    { id: 'LEARNING_STREAK' as const, name: '🔥 Study Streak Update' },
    { id: 'GENERAL' as const, name: '💡 General AI Insight' }
  ];

  readonly tones = ['Professional', 'Storytelling', 'Technical', 'Punchy'];
  readonly popularHashtags = ['#ArtificialIntelligence', '#GeminiAI', '#MachineLearning', '#LLM', '#DeepLearning', '#GenerativeAI', '#TechCareers'];

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.bannerTitle = `AI Learning Journey: Lvl ${user.level}`;
    }
  }

  ngAfterViewInit(): void {
    this.scheduleCanvasRender();
  }

  scheduleCanvasRender(): void {
    setTimeout(() => {
      this.renderCanvas();
    }, 100);
  }

  generatePost(): void {
    this.isGenerating = true;

    setTimeout(() => {
      let topic = 'Modern Artificial Intelligence';
      let summary = 'Recent breakthroughs in foundation models are accelerating developer tooling and multi-agent coordination.';

      if (this.sourceType === 'NEWS' && this.selectedNewsId) {
        const art = this.learningService.news().find(n => n.id === Number(this.selectedNewsId));
        if (art) {
          topic = art.title;
          summary = art.summary;
        }
      } else if (this.sourceType === 'TOOL' && this.selectedToolId) {
        const tool = this.learningService.tools().find(t => t.id === Number(this.selectedToolId));
        if (tool) {
          topic = `${tool.name} (${tool.category})`;
          summary = tool.description;
        }
      } else if (this.sourceType === 'LEARNING_STREAK') {
        const streak = this.authService.user()?.streak || 5;
        topic = `${streak}-Day AI Study Streak`;
        summary = `Consistency is key in mastering machine learning. Completed another week of deep dive modules on the AI Tracker!`;
      }

      this.generatedPost = {
        hook: `🚀 ${topic}: What every engineer and creator needs to know right now.`,
        fullContent: `${summary}\n\nKey Developer Insights:\n1. Multimodal context and structured outputs provide deterministic pipeline reliability.\n2. In-context retrieval minimizes fine-tuning overhead.\n3. Real-time developer agents enhance productivity by over 40%.\n\nWhat are your thoughts on this evolution? Let me know in the comments!`,
        hashtags: '#AI #GenerativeAI #MachineLearning #TechInnovation #Developer'
      };

      this.bannerTitle = topic;
      this.bannerSummary = summary.slice(0, 110) + '...';
      this.isGenerating = false;
    }, 700);
  }

  copyPostContent(): void {
    if (!this.generatedPost) return;
    const text = `${this.generatedPost.hook}\n\n${this.generatedPost.fullContent}\n\n${this.generatedPost.hashtags}`;
    this.copyText(text);
  }

  copyText(text: string): void {
    navigator.clipboard.writeText(text);
    this.copySuccess = true;
    setTimeout(() => { this.copySuccess = false; }, 3000);
  }

  sendToCanvas(): void {
    this.activeTab = 'canvas';
    this.scheduleCanvasRender();
  }

  saveDraft(): void {
    if (!this.generatedPost) return;
    const newDraft = {
      id: Date.now(),
      title: this.generatedPost.hook.slice(0, 45) + '...',
      content: this.generatedPost.fullContent,
      platforms: 'LinkedIn',
      status: 'Draft'
    };
    this.drafts.unshift(newDraft);
    this.activeTab = 'calendar';
  }

  deleteDraft(id: number): void {
    this.drafts = this.drafts.filter(d => d.id !== id);
  }

  renderCanvas(): void {
    if (!this.bannerCanvasRef) return;
    const canvas = this.bannerCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1200;
    let height = 627;
    if (this.bannerSize === 'twitter') {
      height = 675;
    } else if (this.bannerSize === 'instagram') {
      width = 1080;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (this.bannerBg === 'Modern AI') {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e1b4b');
      gradient.addColorStop(1, '#0284c7');
    } else if (this.bannerBg === 'Cyber Navy') {
      gradient.addColorStop(0, '#030712');
      gradient.addColorStop(0.6, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
    } else if (this.bannerBg === 'Minimal Violet') {
      gradient.addColorStop(0, '#180828');
      gradient.addColorStop(0.7, '#311042');
      gradient.addColorStop(1, '#6366f1');
    } else {
      gradient.addColorStop(0, '#022c22');
      gradient.addColorStop(0.7, '#064e3b');
      gradient.addColorStop(1, '#059669');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative circle glow
    ctx.beginPath();
    ctx.arc(width - 150, 150, 240, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctx.fill();

    // Inner Glass Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 80, 80, width - 160, height - 160, 24);
    ctx.fill();
    ctx.stroke();

    // Brand tag
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.fillText(this.bannerTag.toUpperCase(), 140, 160);

    // Headline Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Outfit, sans-serif';
    this.wrapText(ctx, this.bannerTitle, 140, 240, width - 280, 64);

    // Summary Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 26px Inter, sans-serif';
    this.wrapText(ctx, this.bannerSummary, 140, 400, width - 280, 38);

    // Watermark footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillText('AI LEARNING TRACKER • STUDIO', 140, height - 130);
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currY);
        line = words[n] + ' ';
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currY);
  }

  downloadBanner(): void {
    if (!this.bannerCanvasRef) return;
    const canvas = this.bannerCanvasRef.nativeElement;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-social-banner-${Date.now()}.png`;
    a.click();
  }
}

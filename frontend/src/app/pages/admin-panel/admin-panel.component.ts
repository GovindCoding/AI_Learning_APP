import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningService } from '../../services/learning.service';
import { AuthService } from '../../services/auth.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { Tool, NewsArticle } from '../../types';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-borderBg-light dark:border-borderBg-dark gap-4">
        <div>
          <h2 class="text-xl font-bold flex items-center gap-2">
            <app-icon name="shield-alert" className="text-neon-cyan w-6 h-6"></app-icon> Administration Control Panel
          </h2>
          <p class="text-xs text-slate-400">Manage curated AI tool directories, broadcast news updates, and monitor microservices health.</p>
        </div>

        <div class="flex items-center space-x-2">
          <button
            (click)="activeSubTab = 'tools'"
            [class]="'text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-300 ' + 
              (activeSubTab === 'tools' 
                ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan' 
                : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500 text-slate-400')"
          >
            Manage Tools
          </button>
          <button
            (click)="activeSubTab = 'news'"
            [class]="'text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-300 ' + 
              (activeSubTab === 'news' 
                ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet' 
                : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500 text-slate-400')"
          >
            Manage Articles
          </button>
          <button
            (click)="activeSubTab = 'system'"
            [class]="'text-xs font-semibold px-4 py-2 rounded-xl border transition-all duration-300 ' + 
              (activeSubTab === 'system' 
                ? 'bg-neon-emerald border-neon-emerald text-white shadow-neon-emerald' 
                : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500 text-slate-400')"
          >
            System Status
          </button>
        </div>
      </div>

      <!-- Save Status Toast -->
      @if (saveStatus) {
        <div class="p-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-bold text-center">
          {{ saveStatus }}
        </div>
      }

      <!-- 1. MANAGE TOOLS SUBTAB -->
      @if (activeSubTab === 'tools') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Add Tool Form -->
          <app-glass-card customClass="lg:col-span-1 space-y-4">
            <h3 class="font-bold text-base flex items-center gap-2">
              <app-icon name="plus" className="w-4 h-4 text-neon-cyan"></app-icon> Add New AI Tool
            </h3>
            
            <form (submit)="handleSubmitTool($event)" class="space-y-3">
              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Tool Name</label>
                <input
                  type="text"
                  [(ngModel)]="newTool.name"
                  name="toolName"
                  required
                  placeholder="e.g. Cursor IDE"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Category</label>
                <select
                  [(ngModel)]="newTool.category"
                  name="toolCategory"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                >
                  <option value="LLMs">LLMs</option>
                  <option value="AI Image Generation">AI Image Generation</option>
                  <option value="AI Video Generation">AI Video Generation</option>
                  <option value="AI Audio Generation">AI Audio Generation</option>
                  <option value="Vector Databases">Vector Databases</option>
                  <option value="RAG Frameworks">RAG Frameworks</option>
                  <option value="AI Agents">AI Agents</option>
                  <option value="AI Deployment">AI Deployment</option>
                  <option value="AI Productivity">AI Productivity</option>
                </select>
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Pricing Tier</label>
                <select
                  [(ngModel)]="newTool.pricing"
                  name="toolPricing"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                >
                  <option value="FREE">FREE</option>
                  <option value="FREEMIUM">FREEMIUM</option>
                  <option value="PAID">PAID</option>
                  <option value="OPEN_SOURCE">OPEN_SOURCE</option>
                </select>
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Description</label>
                <textarea
                  [(ngModel)]="newTool.description"
                  name="toolDescription"
                  rows="3"
                  required
                  placeholder="Explain capabilities and key strengths..."
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                ></textarea>
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Website URL</label>
                <input
                  type="url"
                  [(ngModel)]="newTool.websiteLink"
                  name="toolWebsite"
                  required
                  placeholder="https://..."
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Key Features (comma separated)</label>
                <input
                  type="text"
                  [(ngModel)]="newTool.features"
                  name="toolFeatures"
                  placeholder="Code edits, Agent mode, Chat"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <button
                type="submit"
                class="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs shadow-neon-cyan hover:scale-102 active:scale-98 transition-all mt-2"
              >
                Create Catalog Entry
              </button>
            </form>
          </app-glass-card>

          <!-- Current Tools List -->
          <div class="lg:col-span-2 space-y-3">
            <h3 class="font-bold text-base flex items-center justify-between">
              <span>Catalog Catalog Entries ({{ learningService.tools().length }})</span>
            </h3>
            
            <div class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              @for (tool of learningService.tools(); track tool.id) {
                <div class="flex items-center justify-between p-3.5 glass-panel rounded-xl border border-borderBg-light dark:border-borderBg-dark">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-bold text-sm">{{ tool.name }}</h4>
                      <span class="text-[9px] uppercase font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20">
                        {{ tool.category }}
                      </span>
                      <span class="text-[9px] text-slate-400 border border-borderBg-light dark:border-borderBg-dark px-1.5 py-0.5 rounded">
                        {{ tool.pricing }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{{ tool.description }}</p>
                  </div>
                  <div class="flex items-center space-x-2 text-xs font-bold text-slate-400">
                    <span>★ {{ tool.communityRating.toFixed(1) }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      }

      <!-- 2. MANAGE NEWS SUBTAB -->
      @if (activeSubTab === 'news') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Add News Form -->
          <app-glass-card customClass="lg:col-span-1 space-y-4">
            <h3 class="font-bold text-base flex items-center gap-2">
              <app-icon name="plus" className="w-4 h-4 text-neon-violet"></app-icon> Publish AI News Update
            </h3>
            
            <form (submit)="handleSubmitArticle($event)" class="space-y-3">
              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Article Headline</label>
                <input
                  type="text"
                  [(ngModel)]="newArticle.title"
                  name="artTitle"
                  required
                  placeholder="e.g. OpenAI Releases GPT-5 Preliminary Technical Report"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-violet"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Category</label>
                <select
                  [(ngModel)]="newArticle.category"
                  name="artCategory"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-violet"
                >
                  <option value="Research">Research</option>
                  <option value="Products">Products</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Regulations">Regulations</option>
                  <option value="General AI Updates">General AI Updates</option>
                </select>
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Source Name</label>
                <input
                  type="text"
                  [(ngModel)]="newArticle.source"
                  name="artSource"
                  required
                  placeholder="e.g. TechCrunch, VentureBeat, arXiv"
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-violet"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Article URL</label>
                <input
                  type="url"
                  [(ngModel)]="newArticle.articleLink"
                  name="artLink"
                  required
                  placeholder="https://..."
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-violet"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block">Summary</label>
                <textarea
                  [(ngModel)]="newArticle.summary"
                  name="artSummary"
                  rows="3"
                  required
                  placeholder="Brief synopsis of the update..."
                  class="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-neon-violet"
                ></textarea>
              </div>

              <button
                type="submit"
                class="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-violet to-neon-rose text-white font-semibold text-xs shadow-neon-violet hover:scale-102 active:scale-98 transition-all mt-2"
              >
                Broadcast Update
              </button>
            </form>
          </app-glass-card>

          <!-- Current News Feed List -->
          <div class="lg:col-span-2 space-y-3">
            <h3 class="font-bold text-base">Published News Items ({{ learningService.news().length }})</h3>
            
            <div class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              @for (art of learningService.news(); track art.id) {
                <div class="p-3.5 glass-panel rounded-xl border border-borderBg-light dark:border-borderBg-dark space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-[9px] uppercase font-bold text-neon-violet bg-neon-violet/10 px-2 py-0.5 rounded border border-neon-violet/20">
                      {{ art.category }}
                    </span>
                    <span class="text-[10px] text-slate-400">{{ formatDate(art.publishedDate) }}</span>
                  </div>
                  <h4 class="font-bold text-sm leading-snug">{{ art.title }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{{ art.summary }}</p>
                </div>
              }
            </div>
          </div>

        </div>
      }

      <!-- 3. SYSTEM STATUS SUBTAB -->
      @if (activeSubTab === 'system') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (svc of microservices; track svc.name) {
            <app-glass-card customClass="space-y-3 border-l-4 border-neon-emerald">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sm">{{ svc.name }}</span>
                <span class="text-[10px] text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse"></span> {{ svc.status }}
                </span>
              </div>
              <div class="space-y-1 text-xs text-slate-400">
                <div class="flex justify-between">
                  <span>Port:</span>
                  <span class="font-mono text-neon-cyan font-semibold">{{ svc.port }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Protocol:</span>
                  <span>{{ svc.protocol }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Role:</span>
                  <span>{{ svc.role }}</span>
                </div>
              </div>
            </app-glass-card>
          }
        </div>
      }

    </div>
  `
})
export class AdminPanelComponent {
  learningService = inject(LearningService);
  authService = inject(AuthService);

  activeSubTab: 'tools' | 'news' | 'system' = 'tools';
  saveStatus: string | null = null;

  newTool = {
    name: '',
    category: 'LLMs',
    description: '',
    websiteLink: '',
    playgroundLink: '',
    apiDocsLink: '',
    pricing: 'FREE' as Tool['pricing'],
    features: '',
    tags: '',
    popularityScore: 8.5,
    communityRating: 4.5
  };

  newArticle = {
    title: '',
    summary: '',
    aiSummary: '',
    source: '',
    category: 'General AI Updates',
    articleLink: '',
    tags: ''
  };

  readonly microservices = [
    { name: 'Eureka Discovery Server', port: '8761', protocol: 'HTTP', role: 'Service Registry', status: 'Online' },
    { name: 'API Gateway Service', port: '8080', protocol: 'HTTP / Spring Cloud Gateway', role: 'Reverse Proxy & Routing', status: 'Online' },
    { name: 'Auth Service', port: '8081', protocol: 'HTTP / JWT / Spring Security', role: 'Authentication & Users', status: 'Online' },
    { name: 'Learning Service', port: '8082', protocol: 'HTTP / JPA / Spring Data', role: 'Roadmaps & Quizzes', status: 'Online' },
    { name: 'Tools & News Service', port: '8083', protocol: 'HTTP / JPA / SSE Stream', role: 'Catalog & News Feed', status: 'Online' },
    { name: 'Social Image Service', port: '8084', protocol: 'HTTP / Express / Canvas', role: 'Social Banner Generator', status: 'Online' },
    { name: 'MySQL Database', port: '3306', protocol: 'MySQL Protocol / TCP', role: 'Persistent Storage', status: 'Active' },
    { name: 'Angular Frontend UI', port: '5173 / 4200', protocol: 'HTTP / Modern Angular', role: 'Single Page Application', status: 'Active' }
  ];

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  async handleSubmitTool(e: Event): Promise<void> {
    e.preventDefault();
    this.saveStatus = 'Saving Tool...';

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch('http://localhost:8080/api/v1/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.newTool)
      });
      if (response.ok) {
        this.saveStatus = 'Tool saved to Backend database successfully!';
      } else {
        throw new Error('Backend failed');
      }
    } catch {
      const simulatedTool: Tool = {
        id: this.learningService.tools().length + 1,
        ...this.newTool,
        createdAt: new Date().toISOString()
      };
      this.learningService.tools.update(prev => [simulatedTool, ...prev]);
      this.saveStatus = 'Tool added to client catalog (Simulation Mode).';
    }

    this.newTool = {
      name: '',
      category: 'LLMs',
      description: '',
      websiteLink: '',
      playgroundLink: '',
      apiDocsLink: '',
      pricing: 'FREE',
      features: '',
      tags: '',
      popularityScore: 8.5,
      communityRating: 4.5
    };
    setTimeout(() => { this.saveStatus = null; }, 4000);
  }

  async handleSubmitArticle(e: Event): Promise<void> {
    e.preventDefault();
    this.saveStatus = 'Publishing Update...';

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch('http://localhost:8080/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(this.newArticle)
      });
      if (response.ok) {
        this.saveStatus = 'Article published to backend databases successfully!';
      } else {
        throw new Error('Backend failed');
      }
    } catch {
      const simulatedArticle: NewsArticle = {
        id: this.learningService.news().length + 1,
        ...this.newArticle,
        publishedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      this.learningService.news.update(prev => [simulatedArticle, ...prev]);
      this.saveStatus = 'Update published successfully (Simulation Mode).';
    }

    this.newArticle = {
      title: '',
      summary: '',
      aiSummary: '',
      source: '',
      category: 'General AI Updates',
      articleLink: '',
      tags: ''
    };
    setTimeout(() => { this.saveStatus = null; }, 4000);
  }
}

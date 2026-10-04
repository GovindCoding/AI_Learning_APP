import React, { useState, useEffect, useMemo } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Sparkles, Cpu, Atom, TrendingUp, Share2, Compass, 
  ArrowRight, CheckCircle2, Activity, Award, 
  Terminal, Star, ExternalLink
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface GoogleAIHubProps {
  setActivePage: (page: string) => void;
}

export const GoogleAIHub: React.FC<GoogleAIHubProps> = ({ setActivePage }) => {
  const { tools, news, nodes, generateRoadmap, updateNodeStatus } = useLearning();
  
  // Tab state: 'google' | 'gemini' | 'deepmind'
  const [activeTab, setActiveTab] = useState<'google' | 'gemini' | 'deepmind'>('google');

  // Load initial tab from localStorage or pathname on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('google_ai_active_tab');
    if (savedTab === 'google' || savedTab === 'gemini' || savedTab === 'deepmind') {
      setActiveTab(savedTab);
    } else {
      const path = window.location.pathname;
      if (path === '/ai/gemini') setActiveTab('gemini');
      else if (path === '/ai/deepmind') setActiveTab('deepmind');
      else setActiveTab('google');
    }
  }, []);

  // Listen to popstate tab changes dispatched from App.tsx
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'google' || detail === 'gemini' || detail === 'deepmind') {
        setActiveTab(detail);
      }
    };
    window.addEventListener('google-ai-tab-change', handleTabChange);
    return () => window.removeEventListener('google-ai-tab-change', handleTabChange);
  }, []);

  // Push route state when active tab transitions
  const handleTabTransition = (tab: 'google' | 'gemini' | 'deepmind') => {
    setActiveTab(tab);
    localStorage.setItem('google_ai_active_tab', tab);
    const path = tab === 'google' ? '/ai/google' : tab === 'gemini' ? '/ai/gemini' : '/ai/deepmind';
    window.history.pushState(null, '', path);
  };

  // Filter tools for each ecosystem tab
  const tabTools = useMemo(() => {
    return tools.filter(tool => {
      const nameLower = tool.name.toLowerCase();
      const tagsLower = tool.tags?.toLowerCase() || '';
      
      if (activeTab === 'google') {
        // Google AI Studio, NotebookLM, Vertex AI, Imagen
        return nameLower.includes('studio') || nameLower.includes('notebooklm') || nameLower.includes('vertex') || nameLower.includes('imagen');
      } else if (activeTab === 'gemini') {
        // Gemini App, Gemini API, Antigravity
        return nameLower.includes('gemini') || nameLower.includes('antigravity');
      } else {
        // AlphaFold, Veo, Lyria
        return nameLower.includes('alphafold') || nameLower.includes('veo') || nameLower.includes('lyria') || tagsLower.includes('deepmind') || tagsLower.includes('biology');
      }
    });
  }, [tools, activeTab]);

  // Filter news articles for each ecosystem tab
  const tabNews = useMemo(() => {
    return news.filter(article => {
      const titleLower = article.title.toLowerCase();
      const summaryLower = article.summary.toLowerCase();
      const tagsLower = article.tags?.toLowerCase() || '';
      const catLower = article.category?.toLowerCase() || '';

      const content = `${titleLower} ${summaryLower} ${tagsLower} ${catLower}`;

      if (activeTab === 'google') {
        // Google AI, Studio, Search AI, Workspace
        return (content.includes('google') || content.includes('studio') || content.includes('search') || content.includes('workspace')) && 
               !content.includes('deepmind') && !content.includes('alphafold') && !content.includes('omni') && !content.includes('antigravity');
      } else if (activeTab === 'gemini') {
        // Gemini, Gemma, Antigravity, Omni
        return content.includes('gemini') || content.includes('gemma') || content.includes('antigravity') || content.includes('omni') || content.includes('astra');
      } else {
        // DeepMind, AlphaFold, Biology, Robotics, Veo, Lyria
        return content.includes('deepmind') || content.includes('alphafold') || content.includes('biology') || content.includes('veo') || content.includes('lyria');
      }
    });
  }, [news, activeTab]);

  // Check if Gemini learning track is currently active in roadmap
  const geminiNodes = useMemo(() => {
    return nodes.filter(n => n.title.toLowerCase().includes('gemini') || n.title.toLowerCase().includes('gemma'));
  }, [nodes]);

  const hasGeminiTrack = geminiNodes.length > 0;
  
  const trackProgress = useMemo(() => {
    if (!hasGeminiTrack) return 0;
    const completed = geminiNodes.filter(n => n.status === 'COMPLETED').length;
    return Math.round((completed / geminiNodes.length) * 100);
  }, [geminiNodes, hasGeminiTrack]);

  // Initialize Gemini Roadmap Track
  const handleActivateGeminiTrack = async () => {
    const confirm = window.confirm("This will initialize your AI Curriculum Pathway with the specialized 'Become Expert in Gemini Ecosystem' goal. Continue?");
    if (confirm) {
      await generateRoadmap({
        learningGoal: 'Become Expert in Gemini Ecosystem',
        skillLevel: 'Beginner',
        background: 'Software Engineer',
        hoursPerDay: 1.5,
        learningStyle: 'hands-on projects'
      });
      alert("Gemini Ecosystem learning track has been successfully initialized! Navigate to 'AI Roadmap' or track details below.");
    }
  };

  // Redirect to Social Studio with specific news pre-selected
  const handleShareToSocial = (articleId: number) => {
    localStorage.setItem('social_redirect_news_id', articleId.toString());
    setActivePage('social');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Ecosystem Header Card */}
      <GlassCard className="p-6 md:p-8 border border-neon-cyan/20 relative overflow-hidden bg-gradient-to-r from-slate-900/60 to-slate-950/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-neon-violet/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" /> Google AI Center of Excellence
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
              Ecosystem Hub
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Deep dive into Google's unified AI landscape. Monitor model announcements, deploy cutting-edge tools, track learning tracks, and generate creator insights seamlessly.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleTabTransition('google')}
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'google' 
                  ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 text-slate-300 bg-slate-900/40'
              }`}
            >
              <Cpu className="w-4.5 h-4.5" />
              <span>Google AI & Studio</span>
            </button>
            
            <button 
              onClick={() => handleTabTransition('gemini')}
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'gemini' 
                  ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 text-slate-300 bg-slate-900/40'
              }`}
            >
              <Atom className="w-4.5 h-4.5" />
              <span>Gemini Ecosystem</span>
            </button>
            
            <button 
              onClick={() => handleTabTransition('deepmind')}
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'deepmind' 
                  ? 'bg-neon-emerald border-neon-emerald text-white shadow-neon-emerald'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 text-slate-300 bg-slate-900/40'
              }`}
            >
              <Activity className="w-4.5 h-4.5" />
              <span>DeepMind Research</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid: Hub content + Trending Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sub-Tab Contents */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tab 1: Google AI & Studio */}
          {activeTab === 'google' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <Cpu className="text-neon-cyan w-5.5 h-5.5" /> Google AI & Prototyping
              </h2>
              <p className="text-slate-400 text-xs">
                Explore developer environments like Google AI Studio, production clouds via Vertex AI, and personal productivity clients like NotebookLM.
              </p>
            </div>
          )}

          {/* Tab 2: Gemini Ecosystem */}
          {activeTab === 'gemini' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Specialized Roadmap progress card */}
              <GlassCard className="p-6 border border-neon-violet/30 bg-gradient-to-br from-slate-900/40 to-slate-950/40 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-neon-violet bg-neon-violet/10 border border-neon-violet/20 px-2 py-0.5 rounded">
                      Specialized Track
                    </span>
                    <h3 className="font-bold text-lg text-slate-150">Gemini Ecosystem Learning Pathway</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Follow a structured, 8-stage developer path covering multimodal prompting, vector DB indices, Gemma open models, tool-calling agents, and Android integration.
                    </p>
                  </div>
                  
                  {!hasGeminiTrack && (
                    <button
                      onClick={handleActivateGeminiTrack}
                      className="px-4 py-2 rounded-xl bg-neon-violet hover:bg-neon-violet/80 text-white text-xs font-bold transition-all shadow-neon-violet flex items-center gap-1.5 self-start md:self-auto"
                    >
                      <span>Activate Pathway</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {hasGeminiTrack ? (
                  <div className="space-y-4">
                    {/* Progress Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>Overall Pathway Progress</span>
                        <span className="text-neon-violet">{trackProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full transition-all duration-500 shadow-neon-cyan"
                          style={{ width: `${trackProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Nodes checkmarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {geminiNodes.map((node, i) => (
                        <div 
                          key={node.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-900/30 text-xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-550 min-w-4 text-right">0{i+1}.</span>
                            <span className="font-semibold text-slate-300 truncate" title={node.title}>{node.title}</span>
                          </div>
                          
                          <button
                            onClick={() => updateNodeStatus(node.id, node.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED')}
                            className={`p-1 rounded-lg border transition-all ${
                              node.status === 'COMPLETED'
                                ? 'bg-neon-emerald/10 border-neon-emerald text-neon-emerald'
                                : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-350'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-2">
                      <button 
                        onClick={() => setActivePage('roadmap')}
                        className="text-xs text-neon-cyan hover:underline font-bold flex items-center gap-1 mx-auto"
                      >
                        Open Full Roadmap Tree <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center text-xs text-slate-500">
                    You have not enrolled in this curriculum path yet. Select 'Activate Pathway' to begin your progress tracker.
                  </div>
                )}
              </GlassCard>

              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <Atom className="text-neon-violet w-5.5 h-5.5" /> Gemini Foundation Models & APIs
              </h2>
            </div>
          )}

          {/* Tab 3: DeepMind Research */}
          {activeTab === 'deepmind' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <Atom className="text-neon-emerald w-5.5 h-5.5" /> DeepMind Research & Sciences
              </h2>
              <p className="text-slate-400 text-xs">
                Monitor scientific frontiers including AlphaFold molecular interactions, cinematic video generation with Veo, and audio modeling via Lyria.
              </p>
            </div>
          )}

          {/* Tools Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Ecosystem Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tabTools.length > 0 ? (
                tabTools.map(tool => (
                  <GlassCard key={tool.id} className="p-4 flex flex-col justify-between border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/20 group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-400">
                          {tool.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">{tool.pricing}</span>
                      </div>
                      
                      <h4 className="font-bold text-slate-150 group-hover:text-neon-cyan transition-colors">{tool.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{tool.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900/60">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        <span className="font-bold text-slate-300">{tool.communityRating}</span>
                        <span>({tool.popularityScore})</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {tool.chatbotLink && (
                          <a 
                            href={tool.chatbotLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 rounded-lg border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Compass className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {tool.apiDocsLink && (
                          <a 
                            href={tool.apiDocsLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 rounded-lg border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a 
                          href={tool.websiteLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-1.5 rounded-lg border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/15">
                  No tools found for this tab in mock data. Run migrations or sync feeds to verify.
                </div>
              )}
            </div>
          </div>

          {/* News Feed Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Ecosystem Feed</h3>
            <div className="space-y-4">
              {tabNews.length > 0 ? (
                tabNews.map(article => (
                  <GlassCard key={article.id} className="p-4 border border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/10 group relative flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-400">
                          {article.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(article.publishedDate).toLocaleDateString()}</span>
                      </div>
                      
                      <h4 className="font-bold text-slate-200 group-hover:text-neon-violet transition-colors leading-snug">{article.title}</h4>
                      <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed">{article.summary}</p>
                      
                      {article.tags && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {article.tags.split(',').slice(0, 4).map(t => (
                            <span key={t} className="text-[9px] text-slate-500 bg-slate-100/30 dark:bg-slate-900/10 px-2 py-0.5 rounded border border-slate-800/40">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-end items-center gap-2 min-w-[100px] border-t md:border-t-0 pt-3 md:pt-0 border-slate-900/60">
                      <button
                        onClick={() => handleShareToSocial(article.id)}
                        className="flex items-center justify-center gap-1.5 w-full py-2 px-3.5 rounded-xl border border-neon-cyan/20 hover:border-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/15 text-neon-cyan text-xs font-bold transition-all duration-300"
                        title="Share on LinkedIn"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>
                      
                      <a 
                        href={article.articleLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2 px-3.5 rounded-xl border border-slate-800 hover:border-slate-500 bg-slate-950/20 text-slate-400 hover:text-slate-200 text-xs transition-all duration-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Source</span>
                      </a>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/15">
                  No ecosystem articles logged. Run Feed Sync to inject simulated releases.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Trending Widget */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Comparative Benchmark Widget */}
          <GlassCard className="p-4 md:p-6 border border-neon-cyan/20 bg-gradient-to-b from-slate-950/80 to-slate-950/50">
            <h3 className="font-extrabold text-sm tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-4">
              <TrendingUp className="w-4 h-4 text-neon-cyan" /> Trending Benchmarks
            </h3>
            
            <div className="space-y-4">
              {/* Benchmark Item: MMLU */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-350">MMLU (General Knowledge)</span>
                  <span className="text-[10px] text-slate-500">MMLU 5-shot</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 w-16">GPT-4o</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-slate-500 rounded" style={{ width: '88.7%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 w-8 text-right">88.7%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-neon-cyan w-16">Gemini 1.5 Pro</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded shadow-neon-cyan" style={{ width: '85.9%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-neon-cyan w-8 text-right">85.9%</span>
                  </div>
                </div>
              </div>

              {/* Benchmark Item: GSM8K */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-350">GSM8K (Math & Reasoning)</span>
                  <span className="text-[10px] text-slate-500">GSM8k CoT</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 w-16">GPT-4o</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-slate-500 rounded" style={{ width: '92.0%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 w-8 text-right">92.0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-neon-cyan w-16">Gemini 1.5 Pro</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded shadow-neon-cyan" style={{ width: '91.7%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-neon-cyan w-8 text-right">91.7%</span>
                  </div>
                </div>
              </div>

              {/* Benchmark Item: HumanEval */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-350">HumanEval (Code Generation)</span>
                  <span className="text-[10px] text-slate-500">0-shot Python</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 w-16">GPT-4o</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-slate-500 rounded" style={{ width: '90.2%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 w-8 text-right">90.2%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-neon-cyan w-16">Gemini 1.5 Pro</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded shadow-neon-cyan" style={{ width: '84.1%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-neon-cyan w-8 text-right">84.1%</span>
                  </div>
                </div>
              </div>

              {/* Benchmark Item: Multimodal Video (MMMU) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-350">Multimodal Video (MMMU)</span>
                  <span className="text-[10px] text-neon-emerald font-bold">Gemini Lead</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 w-16">GPT-4o</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-slate-500 rounded" style={{ width: '59.4%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 w-8 text-right">59.4%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-neon-cyan w-16">Gemini 1.5 Pro</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded shadow-neon-cyan" style={{ width: '63.9%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-neon-cyan w-8 text-right">63.9%</span>
                  </div>
                </div>
              </div>

              {/* Benchmark Item: Multimodal Audio (M-Astra) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-350">Multimodal Audio (M-Astra)</span>
                  <span className="text-[10px] text-neon-emerald font-bold">Gemini Lead</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-500 w-16">GPT-4o</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-slate-500 rounded" style={{ width: '85.0%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 w-8 text-right">85.0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-neon-cyan w-16">Gemini 1.5 Pro</span>
                    <div className="flex-1 h-2 rounded bg-slate-850 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded shadow-neon-cyan" style={{ width: '88.2%' }} />
                    </div>
                    <span className="text-[9px] font-bold text-neon-cyan w-8 text-right">88.2%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-slate-900/60 text-[10px] text-slate-550 text-center leading-relaxed">
              Source: Official technical reports. Gemini 1.5 Pro displays industry leadership in native audio, video parsing, and context length (2M tokens).
            </div>
          </GlassCard>

          {/* Trending Releases/Models List widget */}
          <GlassCard className="p-4 md:p-6 border border-slate-800">
            <h3 className="font-bold text-sm tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-4">
              <Award className="w-4 h-4 text-neon-violet" /> Google AI Hotlist
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-900/40 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Gemini 2.5 Flash</h4>
                  <span className="text-[9px] text-slate-500">Low-latency Multimodal API</span>
                </div>
                <span className="text-[10px] text-neon-cyan font-bold">1M Context</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-900/40 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Project Astra</h4>
                  <span className="text-[9px] text-slate-500">Real-time Video Agent API</span>
                </div>
                <span className="text-[10px] text-neon-violet font-bold">Live Stream</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-900/40 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Gemma 2.5 27B</h4>
                  <span className="text-[9px] text-slate-500">Lightweight Open Weights</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Local Host</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-900/40 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">AlphaFold 3 Server</h4>
                  <span className="text-[9px] text-slate-500">Biomolecular 3D Modeling</span>
                </div>
                <span className="text-[10px] text-neon-emerald font-bold">Free Server</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Antigravity Agent</h4>
                  <span className="text-[9px] text-slate-500">Autonomous Coding Engine</span>
                </div>
                <span className="text-[10px] text-neon-rose font-bold">Active CLI</span>
              </div>
            </div>
          </GlassCard>
          
        </div>

      </div>

    </div>
  );
};

export default GoogleAIHub;

import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Newspaper, Grid, Activity, ShieldCheck, 
  Server, RefreshCw, Sparkles, CheckCircle, Database 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import type { Tool, NewsArticle } from '../types';

export const AdminPanel: React.FC = () => {
  const { tools, news } = useLearning();
  const { user } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState<'tools' | 'news' | 'system'>('tools');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // New Tool Form State
  const [newTool, setNewTool] = useState({
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
  });

  // New Article Form State
  const [newArticle, setNewArticle] = useState({
    title: '',
    summary: '',
    aiSummary: '',
    source: '',
    category: 'General AI Updates',
    articleLink: '',
    tags: ''
  });

  const handleToolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTool(prev => ({ ...prev, [name]: value }));
  };

  const handleArticleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewArticle(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitTool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving Tool...');
    
    // In production, we'd fire a POST request to tools-news-service
    // For demo/hybrid fallback, we update local memory list
    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch('http://localhost:8080/api/v1/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTool)
      });
      
      if (response.ok) {
        setSaveStatus('Tool saved to Backend database successfully!');
      } else {
        throw new Error('Backend failed');
      }
    } catch (e) {
      console.warn('Backend offline, simulated tool addition in client scope.', e);
      // Simulate
      const simulatedTool: Tool = {
        id: tools.length + 1,
        ...newTool,
        createdAt: new Date().toISOString()
      };
      tools.unshift(simulatedTool); // prepend
      setSaveStatus('Tool added to client catalog (Simulation Mode).');
    }

    // Reset Form
    setNewTool({
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
    });

    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Publishing Update...');

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch('http://localhost:8080/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newArticle)
      });
      
      if (response.ok) {
        setSaveStatus('Article published to backend databases successfully!');
      } else {
        throw new Error('Backend failed');
      }
    } catch (e) {
      console.warn('Backend offline, simulated article publishing in client scope.', e);
      // Simulate
      const simulatedArticle: NewsArticle = {
        id: news.length + 1,
        ...newArticle,
        publishedDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      news.unshift(simulatedArticle);
      setSaveStatus('Update published successfully (Simulation Mode).');
    }

    // Reset Form
    setNewArticle({
      title: '',
      summary: '',
      aiSummary: '',
      source: '',
      category: 'General AI Updates',
      articleLink: '',
      tags: ''
    });

    setTimeout(() => setSaveStatus(null), 4000);
  };

  // Mock Eureka Server Service Registry Status
  const microservices = [
    { name: 'Discovery Server (Eureka)', status: 'UP', port: 8761, desc: 'Netflix Service Registry' },
    { name: 'Gateway Service (Routing)', status: 'UP', port: 8080, desc: 'API route router' },
    { name: 'Auth Service (Identity & XP)', status: 'UP', port: 8081, desc: 'JWT profiles & gamified logs' },
    { name: 'Learning Service (Roadmaps & Quizzes)', status: 'UP', port: 8082, desc: 'Nodes tracking & quiz evaluations' },
    { name: 'Tools & News Service (Resource Catalog)', status: 'UP', port: 8083, desc: 'Categorized tools registries & news feeds' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-borderBg-light dark:border-borderBg-dark flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Admin Management Hub</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400">Add resources, monitor service registries, and manage catalogs.</p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-neon-cyan/15 text-neon-cyan text-xs font-bold border border-neon-cyan/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized Admin: {user?.username}</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex space-x-3 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('tools')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-300 ${
            activeSubTab === 'tools'
              ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan'
              : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/30 text-slate-500'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Add AI Tool</span>
        </button>
        
        <button
          onClick={() => setActiveSubTab('news')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-300 ${
            activeSubTab === 'news'
              ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet'
              : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/30 text-slate-500'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Publish AI Update</span>
        </button>
        
        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-300 ${
            activeSubTab === 'system'
              ? 'bg-neon-emerald border-neon-emerald text-white shadow-neon-emerald'
              : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-emerald/30 text-slate-500'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Status</span>
        </button>
      </div>

      {saveStatus && (
        <div className="flex items-center space-x-2 p-3 bg-neon-cyan/15 border border-neon-cyan/20 rounded-2xl text-xs text-neon-cyan font-bold max-w-xl animate-in fade-in duration-300">
          <CheckCircle className="w-4.5 h-4.5 animate-pulse" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* SUB PANELS CONTENT */}

      {/* 1. ADD TOOL FORM */}
      {activeSubTab === 'tools' && (
        <GlassCard className="max-w-2xl">
          <form onSubmit={handleSubmitTool} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Tool Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={newTool.name}
                  onChange={handleToolChange}
                  placeholder="e.g. OpenAI GPT-4o"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Category *</label>
                <select
                  name="category"
                  value={newTool.category}
                  onChange={handleToolChange}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                >
                  <option value="LLMs">LLMs</option>
                  <option value="RAG Frameworks">RAG Frameworks</option>
                  <option value="Vector Databases">Vector Databases</option>
                  <option value="AI Agents">AI Agents</option>
                  <option value="AI Image Generation">AI Image Generation</option>
                  <option value="AI Deployment">AI Deployment</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Description *</label>
              <textarea
                name="description"
                required
                rows={3}
                value={newTool.description}
                onChange={handleToolChange}
                placeholder="Brief description of the model features and performance benchmarks."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Pricing Option</label>
                <select
                  name="pricing"
                  value={newTool.pricing}
                  onChange={handleToolChange}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                >
                  <option value="FREE">FREE</option>
                  <option value="FREEMIUM">FREEMIUM</option>
                  <option value="PAID">PAID</option>
                  <option value="OPEN_SOURCE">OPEN_SOURCE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Popularity Score (1-10)</label>
                <input
                  type="number"
                  name="popularityScore"
                  min="1"
                  max="10"
                  step="0.1"
                  value={newTool.popularityScore}
                  onChange={handleToolChange}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Community Rating (1-5)</label>
                <input
                  type="number"
                  name="communityRating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newTool.communityRating}
                  onChange={handleToolChange}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Website Address *</label>
                <input
                  type="url"
                  name="websiteLink"
                  required
                  value={newTool.websiteLink}
                  onChange={handleToolChange}
                  placeholder="https://..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">API Documentation Link</label>
                <input
                  type="url"
                  name="apiDocsLink"
                  value={newTool.apiDocsLink}
                  onChange={handleToolChange}
                  placeholder="https://docs..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Feature Tags (comma separated)</label>
                <input
                  type="text"
                  name="features"
                  value={newTool.features}
                  onChange={handleToolChange}
                  placeholder="Multimodal, High-speed, Function-calling"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Search Keywords (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={newTool.tags}
                  onChange={handleToolChange}
                  placeholder="openai,llm,gpt4"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-borderBg-light dark:border-borderBg-dark">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Save New Tool</span>
              </button>
            </div>

          </form>
        </GlassCard>
      )}

      {/* 2. PUBLISH NEWS FORM */}
      {activeSubTab === 'news' && (
        <GlassCard className="max-w-2xl">
          <form onSubmit={handleSubmitArticle} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Article Title *</label>
              <input
                type="text"
                name="title"
                required
                value={newArticle.title}
                onChange={handleArticleChange}
                placeholder="e.g. Anthropic Releases Claude 3.5 Sonnet Setting New Records"
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Publisher Source *</label>
                <input
                  type="text"
                  name="source"
                  required
                  value={newArticle.source}
                  onChange={handleArticleChange}
                  placeholder="e.g. Anthropic Blog, TechCrunch"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Topic Category *</label>
                <input
                  type="text"
                  name="category"
                  required
                  value={newArticle.category}
                  onChange={handleArticleChange}
                  placeholder="e.g. Google AI Updates, Research announcements"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Brief Overview Summary *</label>
              <textarea
                name="summary"
                required
                rows={3}
                value={newArticle.summary}
                onChange={handleArticleChange}
                placeholder="A couple of sentences introducing the news story."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="space-y-1 bg-neon-cyan/5 border border-neon-cyan/15 p-4 rounded-2xl">
              <label className="text-xs font-semibold text-neon-cyan flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Synthesized core Takeaway (3 sentences max)
              </label>
              <textarea
                name="aiSummary"
                rows={3}
                value={newArticle.aiSummary}
                onChange={handleArticleChange}
                placeholder="Generate a bulleted or brief synthesis explaining the impact, advantages, and availability."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Article Web Address *</label>
                <input
                  type="url"
                  name="articleLink"
                  required
                  value={newArticle.articleLink}
                  onChange={handleArticleChange}
                  placeholder="https://..."
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Tag Keywords (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={newArticle.tags}
                  onChange={handleArticleChange}
                  placeholder="claude,release,coding"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-borderBg-light dark:border-borderBg-dark">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Publish Update</span>
              </button>
            </div>

          </form>
        </GlassCard>
      )}

      {/* 3. SYSTEM REGISTER STATUS */}
      {activeSubTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Microservices list */}
          <GlassCard className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Server className="text-neon-cyan w-5 h-5" /> Netflix Eureka Registry
              </h3>
              <button className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-neon-cyan transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {microservices.map((srv, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{srv.name}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">Port {srv.port}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{srv.desc}</p>
                  </div>
                  
                  <span className="text-xs font-bold text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald inline-block"></span>
                    {srv.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Database Info */}
          <GlassCard className="space-y-4 border-l-4 border-neon-emerald">
            <div className="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
              <Database className="w-5 h-5 text-neon-emerald" />
              <h3 className="font-bold text-base">Schema Databases</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-borderBg-light dark:border-borderBg-dark">
                <span className="font-semibold block text-slate-400">Auth Service Database</span>
                <span className="font-bold font-mono">ai_auth_db</span>
                <span className="text-[10px] text-slate-500 block mt-1">Contains users, roles, badges data</span>
              </div>

              <div className="space-y-1 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-borderBg-light dark:border-borderBg-dark">
                <span className="font-semibold block text-slate-400">Learning Service Database</span>
                <span className="font-bold font-mono">ai_learning_db</span>
                <span className="text-[10px] text-slate-500 block mt-1">Contains roadmaps, nodes, daily logs, quizzes</span>
              </div>

              <div className="space-y-1 p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-borderBg-light dark:border-borderBg-dark">
                <span className="font-semibold block text-slate-400">Tools & News Database</span>
                <span className="font-bold font-mono">ai_tools_news_db</span>
                <span className="text-[10px] text-slate-500 block mt-1">Contains AI tools registry & bookmarked news</span>
              </div>
            </div>
          </GlassCard>

        </div>
      )}

    </div>
  );
};
export default AdminPanel;

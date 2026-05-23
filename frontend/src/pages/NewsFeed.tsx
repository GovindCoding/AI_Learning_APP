import React, { useState, useEffect, useMemo } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Search, Bookmark, ExternalLink, Sparkles, 
  Calendar, Newspaper, RefreshCw, Flame, TrendingUp,
  ThumbsUp, Share2, X,
  ChevronRight, Plus, Activity, ListOrdered, HelpCircle,
  AlertCircle, Check, Compass, ArrowRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import type { NewsArticle } from '../types';

interface NewsFeedProps {
  setActivePage: (page: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ setActivePage }) => {
  const { news, bookmarkedNews, toggleNewsBookmark, addCustomRoadmapNode } = useLearning();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedSubFilter, setSelectedSubFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');

  // Reset subfilter when company changes
  useEffect(() => {
    setSelectedSubFilter('All');
  }, [selectedCompany]);
  
  // Sort States
  const [sortBy, setSortBy] = useState('publishedDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination & Layout States
  const [isInfiniteScroll, setIsInfiniteScroll] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // SSE & New Article Tracker
  const [newArticleIds, setNewArticleIds] = useState<Set<number>>(new Set());

  // Interactive AI Insights Drawer
  const [selectedArticleForDrawer, setSelectedArticleForDrawer] = useState<NewsArticle | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [insights, setInsights] = useState<{
    takeaways: string;
    beginner: string;
    business: string;
    developer: string;
    learning: string;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsTab, setInsightsTab] = useState<'takeaways' | 'beginner' | 'impacts' | 'roadmap'>('takeaways');

  // Keep track of curriculum added nodes locally to prevent multiple additions in session
  const [addedNodes, setAddedNodes] = useState<Set<number>>(new Set());

  // Notification Banner State
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Companies & Categories lists
  const companies = ['All', 'OpenAI', 'Google AI', 'Gemini', 'DeepMind', 'Anthropic', 'Meta AI', 'Microsoft AI', 'xAI', 'Mistral AI', 'Hugging Face'];
  const categories = ['All', 'Research', 'Products', 'Open Source', 'Regulations', 'General', 'Tutorial'];

  const googleSubFilters = [
    { id: 'All', name: 'All Google' },
    { id: 'gemini models', name: 'Gemini Models' },
    { id: 'gemini api', name: 'Gemini API' },
    { id: 'google ai studio', name: 'AI Studio' },
    { id: 'vertex ai', name: 'Vertex AI' },
    { id: 'gemma', name: 'Gemma' },
    { id: 'notebooklm', name: 'NotebookLM' },
    { id: 'google search ai', name: 'Search AI' },
    { id: 'android ai', name: 'Android AI' },
    { id: 'google workspace ai', name: 'Workspace AI' },
    { id: 'deepmind research', name: 'DeepMind Research' },
    { id: 'gemini cli', name: 'Gemini CLI' },
    { id: 'antigravity', name: 'Antigravity' },
    { id: 'veo', name: 'Veo' },
    { id: 'imagen', name: 'Imagen' },
    { id: 'lyria', name: 'Lyria' }
  ];

  // Initial Fetch & Filter changes
  useEffect(() => {
    fetchArticles(0, false);
  }, [selectedCategory, selectedCompany, selectedSubFilter, selectedDateRange, selectedSentiment, sortBy, sortDirection, searchQuery]);

  // SSE Real-time Broadcasting Connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const connectSse = () => {
      try {
        eventSource = new EventSource('http://localhost:8080/api/v1/news/stream');
        
        eventSource.addEventListener('CONNECTED', (e: MessageEvent) => {
          console.log('SSE News stream connected:', e.data);
        });

        eventSource.addEventListener('NEW_ARTICLE', (e: MessageEvent) => {
          try {
            const article = JSON.parse(e.data) as NewsArticle;
            if (article && article.id) {
              setArticles(prev => {
                // Deduplicate check
                if (prev.some(a => a.id === article.id)) return prev;
                return [article, ...prev];
              });
              setNewArticleIds(prev => new Set([...prev, article.id]));
              
              // Trigger notification toast
              showNotification('info', `Breaking AI News: "${article.title}"`);
              
              // Fade glowing border after 7 seconds
              setTimeout(() => {
                setNewArticleIds(prev => {
                  const next = new Set(prev);
                  next.delete(article.id);
                  return next;
                });
              }, 7000);
            }
          } catch (err) {
            console.error('Error parsing real-time article broadcast:', err);
          }
        });

        eventSource.onerror = (e) => {
          console.warn('SSE disconnected. Attempting to reconnect in 10s...', e);
          eventSource?.close();
          setTimeout(connectSse, 10000);
        };
      } catch (err) {
        console.warn('Could not establish SSE broadcasting connection.', err);
      }
    };

    connectSse();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Fetch articles from backend API
  const fetchArticles = async (pageNum = 0, append = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') {
        queryParams.append('category', selectedCategory);
      }
      if (selectedCompany && selectedCompany !== 'All') {
        queryParams.append('company', selectedCompany);
      }
      if (selectedDateRange && selectedDateRange !== 'All') {
        queryParams.append('dateRange', selectedDateRange);
      }
      if (selectedSentiment && selectedSentiment !== 'All') {
        queryParams.append('sentiment', selectedSentiment);
      }
      if (sortBy) {
        queryParams.append('sortBy', sortBy);
      }
      queryParams.append('direction', sortDirection);
      queryParams.append('page', pageNum.toString());
      queryParams.append('size', '12');
      
      let searchVal = searchQuery;
      if (selectedSubFilter && selectedSubFilter !== 'All') {
        searchVal = searchQuery ? `${searchQuery} ${selectedSubFilter}` : selectedSubFilter;
      }
      if (searchVal) {
        queryParams.append('search', searchVal);
      }

      const res = await fetch(`http://localhost:8080/api/v1/news?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const content = data.content || [];
        setArticles(prev => append ? [...prev, ...content] : content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
        setCurrentPage(data.number || 0);
        setIsOffline(false);
      } else {
        throw new Error('Failed to retrieve paginated news');
      }
    } catch (e) {
      console.warn('Backend news service unreachable. Simulating locally via mockData...', e);
      setIsOffline(true);
      runLocalSimulationFilter(pageNum, append);
    } finally {
      setLoading(false);
    }
  };

  // Offline / simulation mode filtering
  const runLocalSimulationFilter = (pageNum = 0, append = false) => {
    let filtered = [...news];

    // Search query
    let searchVal = searchQuery;
    if (selectedSubFilter && selectedSubFilter !== 'All') {
      searchVal = searchQuery ? `${searchQuery} ${selectedSubFilter}` : selectedSubFilter;
    }
    if (searchVal) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.tags && a.tags.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Company filter
    if (selectedCompany && selectedCompany !== 'All') {
      filtered = filtered.filter(a => {
        const company = a.aiCompany || (
          a.title.toLowerCase().includes('openai') || a.tags?.toLowerCase().includes('openai') ? 'OpenAI' :
          a.title.toLowerCase().includes('anthropic') || a.tags?.toLowerCase().includes('anthropic') ? 'Anthropic' :
          a.title.toLowerCase().includes('deepmind') || a.tags?.toLowerCase().includes('deepmind') ? 'DeepMind' :
          a.title.toLowerCase().includes('gemini') || a.tags?.toLowerCase().includes('gemini') ? 'Gemini' :
          a.title.toLowerCase().includes('google') || a.tags?.toLowerCase().includes('google') ? 'Google AI' :
          a.title.toLowerCase().includes('meta') || a.tags?.toLowerCase().includes('meta') ? 'Meta AI' :
          a.title.toLowerCase().includes('hugging') || a.tags?.toLowerCase().includes('hugging') ? 'Hugging Face' :
          a.title.toLowerCase().includes('microsoft') || a.tags?.toLowerCase().includes('microsoft') ? 'Microsoft AI' :
          a.title.toLowerCase().includes('mistral') || a.tags?.toLowerCase().includes('mistral') ? 'Mistral AI' :
          a.title.toLowerCase().includes('xai') || a.tags?.toLowerCase().includes('xai') ? 'xAI' : 'Generic'
        );
        return company.toLowerCase() === selectedCompany.toLowerCase();
      });
    }

    // Date range filter
    if (selectedDateRange && selectedDateRange !== 'All') {
      const now = new Date();
      filtered = filtered.filter(a => {
        const pubDate = new Date(a.publishedDate);
        const diffMs = now.getTime() - pubDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (selectedDateRange === 'TODAY') return diffDays <= 1;
        if (selectedDateRange === 'WEEK') return diffDays <= 7;
        if (selectedDateRange === 'MONTH') return diffDays <= 30;
        if (selectedDateRange === 'TWO_MONTHS') return diffDays <= 60;
        return true;
      });
    }

    // Sentiment filter
    if (selectedSentiment && selectedSentiment !== 'All') {
      filtered = filtered.filter(a => a.sentiment && a.sentiment.toUpperCase() === selectedSentiment.toUpperCase());
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA: any = a.publishedDate;
      let valB: any = b.publishedDate;

      if (sortBy === 'popularityScore') {
        valA = a.popularityScore || 0;
        valB = b.popularityScore || 0;
      } else if (sortBy === 'trendingScore') {
        valA = a.trendingScore || 0;
        valB = b.trendingScore || 0;
      }

      if (valA < valB) return sortDirection === 'desc' ? 1 : -1;
      if (valA > valB) return sortDirection === 'desc' ? -1 : 1;
      return 0;
    });

    const pageSize = 12;
    const paginated = filtered.slice(pageNum * pageSize, (pageNum + 1) * pageSize);
    setArticles(prev => append ? [...prev, ...paginated] : paginated);
    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    setTotalElements(filtered.length);
    setCurrentPage(pageNum);
  };

  // Load more trigger for infinite scroll
  const handleLoadMore = () => {
    if (currentPage < totalPages - 1) {
      fetchArticles(currentPage + 1, true);
    }
  };

  // Manual trigger background sync
  const handleSyncFeeds = async () => {
    setSyncing(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/news/sync', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        showNotification('success', `Sync completed! Ingested ${data.newlyIngestedCount || 0} new articles from RSS and blogs.`);
        fetchArticles(0, false);
      } else {
        throw new Error('Sync endpoint failed');
      }
    } catch (e) {
      console.warn('Sync server offline, simulating sync insertion...', e);
      
      // Simulate sync locally
      const randomCategory = ['Research', 'Products', 'Open Source', 'Regulations'][Math.floor(Math.random() * 4)];
      const randomCompany = ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI', 'Hugging Face'][Math.floor(Math.random() * 5)];
      const randomSentiment = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'][Math.floor(Math.random() * 3)];
      const newArtId = Date.now();
      
      const simulatedArticle: NewsArticle = {
        id: newArtId,
        title: `Breakthrough: ${randomCompany} Releases ${randomCategory} Optimization Framework`,
        summary: `A newly published study outlines training acceleration that improves memory utilization by 40% while preserving benchmark accuracy during multi-agent system loops.`,
        publishedDate: new Date().toISOString(),
        source: 'AI Gazette',
        category: randomCategory,
        articleLink: 'https://github.com',
        aiCompany: randomCompany,
        sentiment: randomSentiment,
        author: 'AI Sync Agent',
        popularityScore: Math.floor(Math.random() * 5) + 5,
        trendingScore: Math.floor(Math.random() * 5) + 5,
        createdAt: new Date().toISOString()
      };
      
      setArticles(prev => [simulatedArticle, ...prev]);
      setNewArticleIds(prev => new Set([...prev, newArtId]));
      showNotification('success', 'Local simulation sync: Ingested 1 new trending article.');
      
      // Fade border glow
      setTimeout(() => {
        setNewArticleIds(prev => {
          const next = new Set(prev);
          next.delete(newArtId);
          return next;
        });
      }, 7000);
    } finally {
      setSyncing(false);
    }
  };

  // Open Sliding drawer and load insights
  const openInsightsDrawer = async (article: NewsArticle) => {
    setSelectedArticleForDrawer(article);
    setDrawerOpen(true);
    setLoadingInsights(true);
    setInsightsTab('takeaways');
    
    try {
      const res = await fetch(`http://localhost:8080/api/v1/news/${article.id}/summary`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      } else {
        throw new Error('Insights fetch failed');
      }
    } catch (e) {
      console.warn('Insights server offline. Simulating insights locally...', e);
      // Run local simulated generator fallback
      const generatedRaw = generateLocalInsights(article.title, article.summary || '', article.category || '');
      setInsights(generatedRaw);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Client-side rule generator for drawer insights fallback
  const generateLocalInsights = (title: string, _summary: string, _category: string) => {
    const titleLower = title.toLowerCase();
    let takeaways = "";
    let beginner = "";
    let business = "";
    let developer = "";
    let learning = "";

    if (titleLower.includes("openai") || titleLower.includes("gpt")) {
      takeaways = "OpenAI updates continue to push boundaries on model speed, cost reduction, and developer API optimization.";
      beginner = "OpenAI released updates or tools to make ChatGPT smarter, faster, or cheaper to use in everyday tasks.";
      business = "Enables businesses to automate customer operations and complex reasoning jobs at significantly lower API costs.";
      developer = "Check your current system prompts. Test if the new gpt models require parameter modifications like temperature changes.";
      learning = "Create a project connecting the OpenAI API to a custom dataset using python and vector databases.";
    } else if (titleLower.includes("claude") || titleLower.includes("anthropic")) {
      takeaways = "Anthropic's latest Claude updates emphasize high reasoning capability, long context windows, and superior coding assistance.";
      beginner = "Claude, the AI assistant by Anthropic, has been upgraded to write better code and understand documents with more accuracy.";
      business = "Reduces developer debugging time and improves quality of code reviews for tech products.";
      developer = "Explore Claude Artifacts or leverage Anthropic's XML-style system prompting guidelines for optimal output formats.";
      learning = "Follow the official Anthropic tutorials on Prompt Design and test API calls in the console workbench.";
    } else if (titleLower.includes("gemini") || titleLower.includes("deepmind") || titleLower.includes("google")) {
      takeaways = "Google continues to lead in native multi-modality and massive context windows (up to 2M tokens) for processing files.";
      beginner = "Google made an AI update that can look at massive amounts of video, audio, or code all at once without getting confused.";
      business = "Supports compliance auditing and big-data synthesis by processing entire codebases or long video logs in one prompt.";
      developer = "Use Google AI Studio to prototype. Implement Gemini SDK using systemInstruction fields and structured JSON schema responses.";
      learning = "Build a video or document search engine by integrating Gemini API with Google Cloud storage.";
    } else if (titleLower.includes("llama") || titleLower.includes("meta") || titleLower.includes("open-source") || titleLower.includes("open source")) {
      takeaways = "Open-weights models like Llama are rapidly closing the gap with closed systems, offering full sovereignty over data.";
      beginner = "Meta or other developers released a powerful AI model that you can download and run on your own PC without paying subscription fees.";
      business = "Bypasses expensive API call limits and guarantees complete data privacy for proprietary corporate databases.";
      developer = "Deploy these models locally using vLLM, Ollama, or llama.cpp. Apply quantization (e.g. GGUF, AWQ) to optimize hardware usage.";
      learning = "Learn to host an open-source model locally using Ollama and build a simple frontend to interact with it.";
    } else if (titleLower.includes("agent") || titleLower.includes("crewai") || titleLower.includes("langgraph") || titleLower.includes("swarm")) {
      takeaways = "The AI paradigm is moving from static chat windows to multi-agent loops that delegate, run code, and execute multi-step workflows.";
      beginner = "AI agents are like virtual employees that can talk to each other, split up a large task, and complete it without manual intervention.";
      business = "Enables end-to-end automation of complex processes like financial auditing, coding features, or researching market trends.";
      developer = "Adopt agent frameworks like LangGraph or CrewAI. Pay close attention to error-handling loops and state serialization.";
      learning = "Build a multi-agent team where one agent searches the web for news, and the other formats it into a neat markdown report.";
    } else if (titleLower.includes("rag") || titleLower.includes("vector") || titleLower.includes("pinecone") || titleLower.includes("retrieval")) {
      takeaways = "Retrieval-Augmented Generation (RAG) remains the industry standard for grounding LLMs with real-time, factual corporate data.";
      beginner = "RAG is a technique that gives the AI a digital library to read before answering your questions, preventing it from making things up.";
      business = "Saves time and money compared to fine-tuning models while offering high factual accuracy on internal company data.";
      developer = "Optimize retrieval with hybrid search (dense + sparse), reranking models (e.g. Cohere), and parent-child document splitting.";
      learning = "Create a local PDF search system using LangChain, ChromaDB, and any lightweight local LLM.";
    } else {
      takeaways = "This new milestone in Artificial Intelligence signifies rapid evolution across model architectures, tooling, or research paradigms.";
      beginner = "Scientists or developers have launched a new tool/research paper that makes AI systems more capable or accessible.";
      business = "Expands the scope of tasks that AI can solve, creating new market opportunities and operational efficiencies.";
      developer = "Keep an eye on the official GitHub repository or API documentation. Monitor community benchmarks for real-world reliability.";
      learning = "Read the documentation, clone the demo repository, and try running the basic quickstart examples.";
    }

    return {
      takeaways,
      beginner,
      business,
      developer,
      learning
    };
  };

  // Redirect to LinkedIn Social Studio
  const handleRedirectToSocial = (article: NewsArticle) => {
    localStorage.setItem('social_redirect_news_id', article.id.toString());
    setActivePage('social');
  };

  // Calculate dynamic stats widget values
  const stats = useMemo(() => {
    const total = totalElements || articles.length;
    const trending = articles.filter(a => (a.trendingScore || 0) > 7.0).length || 5;
    const latestCompany = articles.length > 0 ? articles[0].aiCompany || 'General' : 'OpenAI';
    const pos = articles.filter(a => a.sentiment?.toUpperCase() === 'POSITIVE').length;
    const totalSentiment = articles.filter(a => a.sentiment).length || 1;
    const sentimentPct = Math.round((pos / totalSentiment) * 100) || 82;

    return {
      total,
      trending,
      latestCompany,
      sentimentPct
    };
  }, [articles, totalElements]);

  // Filter bookmarked updates locally
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const displayedArticles = useMemo(() => {
    if (showBookmarksOnly) {
      return articles.filter(a => bookmarkedNews.includes(a.id));
    }
    return articles;
  }, [articles, bookmarkedNews, showBookmarksOnly]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCompany('All');
    setSelectedSubFilter('All');
    setSelectedCategory('All');
    setSelectedDateRange('All');
    setSelectedSentiment('All');
    setSortBy('publishedDate');
    setSortDirection('desc');
    setShowBookmarksOnly(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Floating Status Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-glass text-xs font-semibold animate-in slide-in-from-right-4 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-neon-emerald' 
            : notification.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-neon-rose' 
            : 'bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner Dashboard Widget */}
      <GlassCard className="p-6 bg-gradient-to-r from-neon-cyan/5 to-neon-violet/5 border border-borderBg-light dark:border-borderBg-dark flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
              AI News & Announcements
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-neon-emerald tracking-wide animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald"></span>
              LIVE SYNC ACTIVE
            </div>
            {isOffline && (
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">
                Offline Simulation
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Continuously tracking global breakthroughs, research summaries, and developer libraries across company releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 ${
              showBookmarksOnly 
                ? 'bg-neon-violet/10 border-neon-violet text-neon-violet shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                : 'bg-white dark:bg-slate-900 border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/30 hover:text-neon-violet'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
            <span>Bookmarks ({bookmarkedNews.length})</span>
          </button>

          <button
            onClick={handleSyncFeeds}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-bold text-xs shadow-neon-cyan hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Feeds'}</span>
          </button>
        </div>
      </GlassCard>

      {/* Dynamic Mini Stats Widget Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center space-x-4">
          <div className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl text-neon-cyan">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Ingested Items</span>
            <span className="text-xl font-extrabold">{stats.total}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-4">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Trending Stories</span>
            <span className="text-xl font-extrabold">{stats.trending}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-4">
          <div className="p-2.5 bg-neon-violet/10 border border-neon-violet/20 rounded-xl text-neon-violet">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Latest Hotspot</span>
            <span className="text-xl font-extrabold truncate max-w-[120px] block">{stats.latestCompany}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-4">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-neon-emerald">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Overall Sentiment</span>
            <span className="text-xl font-extrabold">{stats.sentimentPct}% Positive</span>
          </div>
        </GlassCard>
      </div>

      {/* Horizontal Trending Headline Ticker */}
      {articles.length > 0 && (
        <div className="glass-panel py-2 px-4 rounded-2xl flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-shrink-0 text-neon-cyan font-bold text-xs uppercase tracking-wider border-r border-borderBg-light dark:border-borderBg-dark pr-4">
            <TrendingUp className="w-4 h-4 animate-bounce" /> Trending
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            {articles.slice(0, 5).map((a) => (
              <div 
                key={`ticker-${a.id}`} 
                onClick={() => openInsightsDrawer(a)}
                className="flex-shrink-0 flex items-center gap-2 text-xs font-semibold hover:text-neon-cyan cursor-pointer transition-colors bg-slate-100/40 dark:bg-slate-900/40 px-3 py-1 rounded-lg border border-borderBg-light dark:border-borderBg-dark"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan"></span>
                <span>{a.title.length > 50 ? a.title.substring(0, 47) + '...' : a.title}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar filter + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Filter Panel */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit space-y-6">
          <GlassCard className="p-5 border border-borderBg-light dark:border-borderBg-dark space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-borderBg-light dark:border-borderBg-dark">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-neon-cyan" /> Filter & Sort
              </h3>
              <button 
                onClick={clearFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-neon-cyan transition-colors hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Enter keywords..."
                  className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-neon-cyan transition-colors"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Topic / Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(c => (
                  <button
                    key={`cat-${c}`}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      selectedCategory === c
                        ? 'bg-neon-cyan/15 border-neon-cyan text-neon-cyan font-bold'
                        : 'border-borderBg-light dark:border-borderBg-dark bg-slate-50 dark:bg-slate-905 hover:border-slate-400 text-slate-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Company selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Provider</label>
              <div className="flex flex-wrap gap-1.5">
                {companies.map(c => (
                  <button
                    key={`comp-${c}`}
                    onClick={() => setSelectedCompany(c)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      selectedCompany === c
                        ? 'bg-neon-violet/15 border-neon-violet text-neon-violet font-bold'
                        : 'border-borderBg-light dark:border-borderBg-dark bg-slate-50 dark:bg-slate-905 hover:border-slate-400 text-slate-500'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Range</label>
              <select
                value={selectedDateRange}
                onChange={e => setSelectedDateRange(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neon-cyan transition-colors"
              >
                <option value="All">All History</option>
                <option value="TODAY">Last 24 Hours</option>
                <option value="WEEK">Past Week</option>
                <option value="MONTH">Past Month</option>
                <option value="TWO_MONTHS">Past 2 Months</option>
              </select>
            </div>

            {/* Sentiment filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sentiment</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['All', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map(s => (
                  <button
                    key={`sent-${s}`}
                    onClick={() => setSelectedSentiment(s)}
                    className={`text-[10px] py-1.5 rounded-lg border transition-all font-semibold capitalize ${
                      selectedSentiment === s
                        ? 'bg-neon-cyan border-neon-cyan text-white font-bold'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 text-slate-500'
                    }`}
                  >
                    {s.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting controls */}
            <div className="space-y-3 pt-3 border-t border-borderBg-light dark:border-borderBg-dark">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sort Order</label>
              <div className="space-y-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="publishedDate">Release Date</option>
                  <option value="popularityScore">Popularity</option>
                  <option value="trendingScore">Trending Index</option>
                </select>
                
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSortDirection('desc')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border ${sortDirection === 'desc' ? 'bg-slate-200 dark:bg-slate-800 text-neon-cyan border-neon-cyan/20' : 'border-transparent text-slate-400'}`}
                  >
                    Descending
                  </button>
                  <button
                    onClick={() => setSortDirection('asc')}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border ${sortDirection === 'asc' ? 'bg-slate-200 dark:bg-slate-800 text-neon-cyan border-neon-cyan/20' : 'border-transparent text-slate-400'}`}
                  >
                    Ascending
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Toggle */}
            <div className="pt-3 border-t border-borderBg-light dark:border-borderBg-dark flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Infinite Scroll</span>
              <button
                onClick={() => setIsInfiniteScroll(!isInfiniteScroll)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300 relative ${isInfiniteScroll ? 'bg-neon-cyan' : 'bg-slate-350 dark:bg-slate-700'}`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform duration-300 shadow-sm ${isInfiniteScroll ? 'translate-x-4.5' : 'translate-x-0'}`} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right side: News stream Cards */}
        <div className="lg:col-span-9 space-y-6">
          {/* Google Sub-Filters Row */}
          {(selectedCompany === 'Google AI' || selectedCompany === 'Gemini' || selectedCompany === 'DeepMind') && (
            <GlassCard className="p-4 border border-neon-cyan/20 dark:border-neon-cyan/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse" /> Google AI Ecosystem Sub-Filters
                </span>
                {selectedSubFilter !== 'All' && (
                  <button 
                    onClick={() => setSelectedSubFilter('All')} 
                    className="text-[10px] text-neon-cyan hover:underline font-semibold"
                  >
                    Clear Sub-filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {googleSubFilters.map(sf => {
                  const isSel = selectedSubFilter === sf.id;
                  return (
                    <button
                      key={`sub-${sf.id}`}
                      onClick={() => setSelectedSubFilter(sf.id)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-xl border transition-all duration-300 font-semibold ${
                        isSel
                          ? 'bg-neon-cyan/15 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.15)] font-bold scale-102'
                          : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {sf.name}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {displayedArticles.length > 0 ? (
            <div>
              {/* Masonry-like CSS columns layout */}
              <div className="columns-1 md:columns-2 gap-6 [column-fill:_balance]">
                {displayedArticles.map(article => {
                  const isBookmarked = bookmarkedNews.includes(article.id);
                  const isNewEvent = newArticleIds.has(article.id);

                  // Extract and parse alternative references JSON
                  let refList: Array<{ name: string; url: string }> = [];
                  if (article.alternativeReferences) {
                    try {
                      refList = JSON.parse(article.alternativeReferences);
                    } catch (e) {
                      refList = article.alternativeReferences.split(',').map(r => ({ name: r.trim(), url: '#' }));
                    }
                  }

                  return (
                    <div 
                      key={`article-${article.id}`}
                      className="break-inside-avoid mb-6"
                    >
                      <GlassCard 
                        className={`flex flex-col border transition-all duration-300 bg-cardBg-light dark:bg-cardBg-dark/80 ${
                          isNewEvent 
                            ? 'border-emerald-500/70 ring-2 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.01]' 
                            : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/30 hover:shadow-glass-hover'
                        }`}
                      >
                        {/* Meta Category Row */}
                        <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-400 font-bold mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-bold text-neon-violet bg-neon-violet/10 border border-neon-violet/15 px-2 py-0.5 rounded uppercase tracking-wider">
                              {article.category}
                            </span>
                            {article.aiCompany && article.aiCompany !== 'Generic' && (
                              <span className="text-[9px] font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/15 px-2 py-0.5 rounded uppercase tracking-wider">
                                {article.aiCompany}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-3.5">
                            <span className="flex items-center gap-1 font-semibold">
                              <Calendar className="w-3 h-3 text-slate-400" /> 
                              {new Date(article.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            
                            {/* Bookmark Action */}
                            <button
                              onClick={() => toggleNewsBookmark(article.id)}
                              className={`p-1.5 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:bg-neon-violet/10 transition-colors ${
                                isBookmarked ? 'text-neon-violet border-neon-violet/20 bg-neon-violet/5' : 'text-slate-400 hover:text-neon-violet'
                              }`}
                              title={isBookmarked ? 'Bookmarked' : 'Add Bookmark'}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Article Image Banner (if available) */}
                        {article.thumbnailImage && (
                          <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-borderBg-light dark:border-borderBg-dark bg-slate-100 dark:bg-slate-900">
                            <img 
                              src={article.thumbnailImage} 
                              alt={article.title} 
                              className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" 
                            />
                          </div>
                        )}

                        {/* Headline Title */}
                        <h4 
                          onClick={() => openInsightsDrawer(article)}
                          className="font-bold text-base mb-2 leading-snug hover:text-neon-cyan cursor-pointer transition-colors"
                        >
                          {article.title}
                        </h4>

                        {/* Paragraph Summary */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                          {article.summary}
                        </p>

                        {/* Deduplication coverage / Alternative References */}
                        {refList.length > 0 && (
                          <div className="mb-4 pt-2.5 border-t border-dashed border-borderBg-light dark:border-slate-800 text-[10px]">
                            <span className="text-slate-400 font-bold block mb-1">Also Covered By:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {refList.map((ref, idx) => (
                                <a
                                  key={`ref-${idx}-${ref.name}`}
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 bg-slate-100/50 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-md text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/20 flex items-center gap-1 transition-colors"
                                >
                                  <Newspaper className="w-2.5 h-2.5" />
                                  <span>{ref.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sentiment and Score badges */}
                        <div className="flex items-center gap-2.5 mb-4 text-[10px] font-bold">
                          {article.sentiment && (
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                              article.sentiment.toUpperCase() === 'POSITIVE'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-neon-emerald'
                                : article.sentiment.toUpperCase() === 'NEGATIVE'
                                ? 'bg-rose-500/10 border-rose-500/20 text-neon-rose'
                                : 'bg-slate-100 dark:bg-slate-800 border-borderBg-light dark:border-borderBg-dark text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                article.sentiment.toUpperCase() === 'POSITIVE'
                                  ? 'bg-neon-emerald'
                                  : article.sentiment.toUpperCase() === 'NEGATIVE'
                                  ? 'bg-neon-rose'
                                  : 'bg-slate-400'
                              }`}></span>
                              <span className="capitalize">{article.sentiment.toLowerCase()}</span>
                            </div>
                          )}

                          {article.trendingScore && article.trendingScore > 0 ? (
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded-full">
                              <Flame className="w-3 h-3 fill-current" /> {article.trendingScore.toFixed(1)} Index
                            </span>
                          ) : null}
                          
                          {article.popularityScore && article.popularityScore > 0 ? (
                            <span className="flex items-center gap-0.5 text-neon-cyan font-bold bg-neon-cyan/10 border border-neon-cyan/15 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3" /> {article.popularityScore.toFixed(0)} Popularity
                            </span>
                          ) : null}
                        </div>

                        {/* Action buttons row */}
                        <div className="flex items-center justify-between border-t border-borderBg-light dark:border-borderBg-dark pt-3 mt-auto">
                          <button
                            onClick={() => openInsightsDrawer(article)}
                            className="flex items-center gap-1.5 text-xs text-neon-cyan hover:underline font-bold"
                          >
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>AI Insights</span>
                          </button>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleRedirectToSocial(article)}
                              className="p-1.5 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/35 text-slate-400 hover:text-neon-cyan flex items-center gap-1 transition-colors"
                              title="Generate LinkedIn Post"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">Write Post</span>
                            </button>

                            <a
                              href={article.articleLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/35 text-slate-450 hover:text-neon-violet flex items-center gap-1.5 transition-all text-[10px] font-bold"
                            >
                              <span>Read</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {loading && isInfiniteScroll && (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="w-6 h-6 text-neon-cyan animate-spin" />
                </div>
              )}

              {isInfiniteScroll ? (
                currentPage < totalPages - 1 && !loading && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 bg-white/40 dark:bg-slate-900/40 text-xs font-bold transition-all"
                    >
                      Load More Articles
                    </button>
                  </div>
                )
              ) : (
                /* Standard Page-Based Pagination */
                totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-borderBg-light dark:border-borderBg-dark">
                    <div className="text-xs text-slate-400 font-medium">
                      Showing page <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage + 1}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{totalPages}</span> ({totalElements} articles total)
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchArticles(currentPage - 1, false)}
                        disabled={currentPage === 0 || loading}
                        className="p-2 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-bold transition-all"
                      >
                        Prev
                      </button>

                      {/* Render page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageIdx = i;
                        // Center pages around current page if totalPages is large
                        if (totalPages > 5 && currentPage > 2) {
                          pageIdx = currentPage - 2 + i;
                          if (pageIdx + (5 - i) > totalPages) {
                            pageIdx = totalPages - 5 + i;
                          }
                        }
                        return (
                          <button
                            key={`page-${pageIdx}`}
                            onClick={() => fetchArticles(pageIdx, false)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                              currentPage === pageIdx
                                ? 'bg-neon-cyan border-neon-cyan text-white'
                                : 'border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {pageIdx + 1}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => fetchArticles(currentPage + 1, false)}
                        disabled={currentPage === totalPages - 1 || loading}
                        className="p-2 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-bold transition-all"
                      >
                        Next
                      </button>

                      {/* Jump to page */}
                      {totalPages > 5 && (
                        <select
                          value={currentPage}
                          onChange={(e) => fetchArticles(Number(e.target.value), false)}
                          className="bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-lg px-2 py-1 text-xs focus:outline-none"
                        >
                          {Array.from({ length: totalPages }, (_, idx) => (
                            <option key={`opt-p-${idx}`} value={idx}>Page {idx + 1}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-20 glass-panel rounded-3xl border border-borderBg-light dark:border-borderBg-dark flex flex-col items-center justify-center space-y-4">
              <Newspaper className="w-12 h-12 text-slate-350 dark:text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <p className="text-slate-405 font-bold text-sm">No articles match your search filter criteria.</p>
                <p className="text-slate-400 text-xs">Try clearing your filters or click "Sync Feeds" to fetch breaking news.</p>
              </div>
              <button 
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs font-bold hover:text-neon-cyan transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Right Side Drawer Overlay */}
      {drawerOpen && selectedArticleForDrawer && (
        <>
          {/* Semi-transparent Backdrop with fade-in */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer container with slide-in from right */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200/50 dark:border-slate-800/50 z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-borderBg-light dark:border-borderBg-dark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
                <h3 className="font-bold text-base">AI Synthesized Insights</h3>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200" />
              </button>
            </div>
            
            {/* Target Article Title Info */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-b border-borderBg-light dark:border-borderBg-dark">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-bold text-neon-violet bg-neon-violet/10 border border-neon-violet/15 px-2 py-0.5 rounded uppercase tracking-wider">
                  {selectedArticleForDrawer.category}
                </span>
                {selectedArticleForDrawer.aiCompany && selectedArticleForDrawer.aiCompany !== 'Generic' && (
                  <span className="text-[9px] font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/15 px-2 py-0.5 rounded uppercase tracking-wider">
                    {selectedArticleForDrawer.aiCompany}
                  </span>
                )}
              </div>
              
              <h4 className="font-bold text-sm leading-snug">{selectedArticleForDrawer.title}</h4>
              <p className="text-[10px] text-slate-400 mt-2">
                Published via {selectedArticleForDrawer.source} • Edited by {selectedArticleForDrawer.author || 'AI Editor'}
              </p>
            </div>
            
            {/* Navigation Tabs within Drawer */}
            <div className="flex border-b border-borderBg-light dark:border-borderBg-dark bg-slate-100/40 dark:bg-slate-900/20 px-2">
              {(['takeaways', 'beginner', 'impacts', 'roadmap'] as const).map(tab => (
                <button
                  key={`tab-${tab}`}
                  onClick={() => setInsightsTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all capitalize ${
                    insightsTab === tab
                      ? 'border-neon-cyan text-neon-cyan'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {tab === 'takeaways' ? 'Takeaways' : tab === 'beginner' ? 'Simple Explain' : tab === 'impacts' ? 'Impacts' : 'Roadmap Node'}
                </button>
              ))}
            </div>
            
            {/* Drawer Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto">
              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <RefreshCw className="w-8 h-8 text-neon-cyan animate-spin" />
                  <span className="text-xs text-slate-500">Formulating AI insights...</span>
                </div>
              ) : insights ? (
                <div className="space-y-5 text-xs animate-in fade-in duration-200">
                  
                  {/* TAB: Takeaways */}
                  {insightsTab === 'takeaways' && (
                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <ListOrdered className="w-3.5 h-3.5 text-neon-cyan" /> Core Takeaways
                      </h5>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                        {insights.takeaways}
                      </div>
                    </div>
                  )}
                  
                  {/* TAB: Beginner explanation */}
                  {insightsTab === 'beginner' && (
                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <HelpCircle className="w-3.5 h-3.5 text-neon-cyan" /> Explained for Beginners
                      </h5>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                        {insights.beginner || "A simplified summary is being generated."}
                      </div>
                    </div>
                  )}
                  
                  {/* TAB: Impacts */}
                  {insightsTab === 'impacts' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark space-y-2">
                        <h6 className="font-extrabold text-[10px] text-neon-cyan uppercase tracking-wider flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> Strategic Business Impact
                        </h6>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {insights.business || "Business deployment strategic assessment is pending."}
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark space-y-2">
                        <h6 className="font-extrabold text-[10px] text-neon-violet uppercase tracking-wider flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" /> Technical Developer Impact
                        </h6>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {insights.developer || "Developer api and library updates validation is pending."}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* TAB: Roadmap Integration */}
                  {insightsTab === 'roadmap' && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-neon-cyan/5 to-neon-violet/5 p-4 rounded-xl border border-neon-cyan/15 space-y-2.5">
                        <h6 className="font-bold text-[10px] text-neon-cyan uppercase tracking-wider flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5" /> Recommended Study Actions
                        </h6>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {insights.learning || "We recommend allocating study time to review official coding logs."}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark space-y-4">
                        <div>
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            Topic: Practice {selectedArticleForDrawer.title.length > 40 ? selectedArticleForDrawer.title.substring(0, 37) + '...' : selectedArticleForDrawer.title}
                          </h6>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            Adding this topic creates a new custom lesson in your personal tracker curriculum, allowing you to study, log learning hours, and test your knowledge.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-borderBg-light dark:border-borderBg-dark">
                            <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">Difficulty</span>
                            <span className="font-bold capitalize text-neon-violet">
                              {selectedArticleForDrawer.category === 'Research' ? 'advanced' : 'intermediate'}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-borderBg-light dark:border-borderBg-dark">
                            <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">Study Duration</span>
                            <span className="font-bold text-neon-cyan">8 Hours</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            const difficulty = selectedArticleForDrawer.category === 'Research' ? 'advanced' : 'intermediate';
                            addCustomRoadmapNode(
                              `Practice: ${selectedArticleForDrawer.title}`,
                              insights.learning || `Review code repositories and API configurations for: ${selectedArticleForDrawer.summary}`,
                              difficulty,
                              8
                            );
                            setAddedNodes(prev => new Set([...prev, selectedArticleForDrawer.id]));
                            showNotification('success', 'Custom topic added to your AI Curriculum!');
                          }}
                          disabled={addedNodes.has(selectedArticleForDrawer.id)}
                          className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                            addedNodes.has(selectedArticleForDrawer.id)
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-neon-emerald cursor-default'
                              : 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan hover:scale-102 active:scale-98'
                          }`}
                        >
                          {addedNodes.has(selectedArticleForDrawer.id) ? (
                            <>
                              <Check className="w-4 h-4" /> Added to Curriculum
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Add Topic to My Roadmap
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Redirection from Drawer option */}
                  <div className="pt-4 border-t border-borderBg-light dark:border-borderBg-dark flex items-center justify-between">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        handleRedirectToSocial(selectedArticleForDrawer);
                      }}
                      className="flex items-center gap-1 text-neon-cyan hover:underline font-bold text-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Write LinkedIn Post</span>
                    </button>

                    <a
                      href={selectedArticleForDrawer.articleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-400 hover:text-neon-violet text-[11px] font-semibold"
                    >
                      <span>Read Original Source</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Failed to load AI insights.
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default NewsFeed;

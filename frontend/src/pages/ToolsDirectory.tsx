import React, { useState, useMemo } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Search, Star, Heart, ExternalLink, 
  Terminal, Code 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export const ToolsDirectory: React.FC = () => {
  const { tools, favorites, toggleToolFavorite } = useLearning();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

  // Extract all unique categories
  const categories = useMemo(() => {
    const cats = new Set(tools.map(t => t.category));
    return ['All', ...Array.from(cats)];
  }, [tools]);

  const pricingFilters = ['All', 'FREE', 'FREEMIUM', 'PAID', 'OPEN_SOURCE'];

  // Filter tools based on searches
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (tool.tags && tool.tags.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesPricing = selectedPricing === 'All' || tool.pricing === selectedPricing;
      const matchesFav = !showOnlyFavs || favorites.includes(tool.id);

      return matchesSearch && matchesCategory && matchesPricing && matchesFav;
    });
  }, [tools, searchQuery, selectedCategory, selectedPricing, showOnlyFavs, favorites]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Search & Filter Bar */}
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search models, databases, vector stores..."
            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>

        {/* Favorite toggle */}
        <button
          onClick={() => setShowOnlyFavs(!showOnlyFavs)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            showOnlyFavs 
              ? 'bg-rose-500/10 border-rose-550 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
              : 'border-borderBg-light dark:border-borderBg-dark hover:border-rose-500/30 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${showOnlyFavs ? 'fill-current' : ''}`} />
          <span>My Favorites ({favorites.length})</span>
        </button>
      </GlassCard>

      {/* Tabs / Filter Pills */}
      <div className="space-y-4">
        {/* Categories */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-neon-cyan border-neon-cyan text-white shadow-neon-cyan'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/50 text-slate-500 dark:text-slate-400 bg-slate-100/40 dark:bg-slate-900/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pricing Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold pr-2">Pricing:</span>
          {pricingFilters.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPricing(p)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-xl border capitalize whitespace-nowrap transition-all duration-300 ${
                selectedPricing === p
                  ? 'bg-neon-violet border-neon-violet text-white shadow-neon-violet'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/50 text-slate-500 dark:text-slate-400'
              }`}
            >
              {p.toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => {
            const isFav = favorites.includes(tool.id);
            const isPopular = tool.popularityScore >= 9.0;
            
            return (
              <GlassCard 
                key={tool.id} 
                className="flex flex-col justify-between border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/20 group relative"
              >
                <div>
                  
                  {/* Top Header Indicators */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded">
                      {tool.category}
                    </span>
                    
                    {/* Favorite Heart Button */}
                    <button
                      onClick={() => toggleToolFavorite(tool.id)}
                      className={`p-1.5 rounded-lg border border-borderBg-light dark:border-borderBg-dark hover:bg-rose-500/10 transition-colors ${
                        isFav ? 'text-rose-500 border-rose-500/20 bg-rose-500/5' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title & Ratings */}
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-bold text-base leading-snug group-hover:text-neon-cyan transition-colors">
                      {tool.name}
                    </h3>
                    
                    {isPopular && (
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 animate-pulse">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(tool.communityRating) ? 'fill-current' : 'opacity-30'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {tool.communityRating.toFixed(1)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* Features tags if any */}
                  {tool.features && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.features.split(',').slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[9px] font-semibold text-slate-400 bg-slate-100/50 dark:bg-slate-900/30 border border-borderBg-light dark:border-borderBg-dark px-2 py-0.5 rounded-full capitalize">
                          {f.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* Lower Action Links */}
                <div className="border-t border-borderBg-light dark:border-borderBg-dark pt-4 mt-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[10px] text-slate-400 bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded border border-borderBg-light dark:border-borderBg-dark">
                    {tool.pricing}
                  </span>
                  
                  <div className="flex items-center space-x-3">
                    
                    {/* Github link */}
                    {tool.githubLink && (
                      <a 
                        href={tool.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-lg transition-colors border border-borderBg-light dark:border-borderBg-dark"
                        title="GitHub Repository"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* API Docs */}
                    {tool.apiDocsLink && (
                      <a 
                        href={tool.apiDocsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-lg transition-colors border border-borderBg-light dark:border-borderBg-dark"
                        title="API Documentation"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Main Website Webpage */}
                    <a 
                      href={tool.websiteLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs px-3.5 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                  </div>
                </div>

              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border border-borderBg-light dark:border-borderBg-dark">
          <p className="text-slate-400 text-sm">No tools matching your search criteria were found.</p>
        </div>
      )}

    </div>
  );
};
export default ToolsDirectory;

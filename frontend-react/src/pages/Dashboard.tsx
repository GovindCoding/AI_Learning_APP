import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Clock, CheckCircle, Flame, Award, ArrowRight,
  TrendingUp, Sparkles, BookOpen, ArrowUpRight
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export const Dashboard: React.FC<{ setActivePage: (page: string) => void }> = ({ setActivePage }) => {
  const { user } = useAuth();
  const { nodes, tools, news, getAnalyticsSummary } = useLearning();

  const analytics = getAnalyticsSummary();

  // Next pending node to study
  const nextNode = nodes.find(n => n.status !== 'COMPLETED');

  // Format Recharts study distribution data
  const chartData = Object.entries(analytics.weeklyDistribution).map(([day, hours]) => ({
    name: day,
    hours: parseFloat(hours.toFixed(1))
  }));

  // Limit listings for dashboard widgets
  const trendingTools = [...tools]
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 3);

  const keyNews = news.slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Message */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-neon-cyan/10 via-neon-violet/5 to-transparent border border-neon-cyan/20 shadow-glass">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, <span className="bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">{user?.username || 'Learner'}</span>!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
            Your customized path to becoming a <span className="text-neon-cyan font-bold">{user?.learningGoal || 'Generative AI Engineer'}</span> is {Math.round(analytics.progressPercentage)}% completed. Keep it up!
          </p>
          {nextNode && (
            <button
              onClick={() => setActivePage('roadmap')}
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-neon-cyan"
            >
              <span>Resume Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Glow ball */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Hours */}
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-neon-cyan/15 text-neon-cyan rounded-2xl border border-neon-cyan/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Study Duration</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{analytics.totalHours.toFixed(1)} hrs</h3>
            <span className="text-[10px] text-neon-cyan font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +1.2 hrs today
            </span>
          </div>
        </GlassCard>

        {/* Completed Modules */}
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-neon-emerald/15 text-neon-emerald rounded-2xl border border-neon-emerald/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Progress Modules</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{analytics.completedNodesCount} / {analytics.totalNodesCount}</h3>
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-neon-emerald rounded-full transition-all duration-500" 
                style={{ width: `${analytics.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </GlassCard>

        {/* Current Streak */}
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-orange-500/15 text-orange-500 rounded-2xl border border-orange-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Daily Streak</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{user?.streak || 0} Days</h3>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Max streak: {user?.maxStreak || 0} days</span>
          </div>
        </GlassCard>

        {/* AI Readiness Score */}
        <GlassCard className="flex items-center space-x-4">
          <div className="p-3 bg-neon-violet/15 text-neon-violet rounded-2xl border border-neon-violet/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">AI Readiness</span>
            <h3 className="text-2xl font-extrabold mt-0.5">{analytics.aiReadinessScore}%</h3>
            <span className="text-[10px] text-neon-violet font-semibold mt-0.5 block">Based on quiz results</span>
          </div>
        </GlassCard>

      </div>

      {/* Charts & Next Module Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Study Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Study Distribution</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400">Your total learning hours recorded daily over the past week</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-neon-cyan border border-borderBg-light dark:border-borderBg-dark">
              Weekly view
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="hours" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Next recommended module widget */}
        <GlassCard className="flex flex-col justify-between border-l-4 border-neon-cyan">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neon-cyan bg-neon-cyan/10 px-2.5 py-1 rounded-full border border-neon-cyan/20">
                Recommended Node
              </span>
              <BookOpen className="w-5 h-5 text-slate-400" />
            </div>

            {nextNode ? (
              <>
                <h3 className="text-xl font-bold mb-2 leading-snug">{nextNode.title}</h3>
                <p className="text-slate-450 dark:text-slate-450 text-xs leading-relaxed mb-4">
                  {nextNode.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Estimated duration:</span>
                    <span className="font-semibold">{nextNode.durationHours} hours</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Level:</span>
                    <span className="font-semibold capitalize text-neon-cyan">{nextNode.difficulty}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                🎉 All nodes completed! You have finished your current goal. Use the admin panel or settings to launch a new one.
              </div>
            )}
          </div>

          {nextNode && (
            <button
              onClick={() => setActivePage('modules')}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/15 hover:border-neon-cyan/60 transition-all duration-300 text-sm font-semibold"
            >
              <span>Begin Module Quiz & Materials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </GlassCard>

      </div>

      {/* Lower Row: Trending Tools & News Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trending AI Tools Widget */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="text-neon-cyan w-5 h-5" /> Trending AI Tools
            </h3>
            <button 
              onClick={() => setActivePage('tools')}
              className="text-xs text-neon-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Explore directory <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trendingTools.map(tool => (
              <div 
                key={tool.id}
                className="flex items-center justify-between p-3 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/20 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-all duration-300"
              >
                <div>
                  <h4 className="font-bold text-sm">{tool.name}</h4>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block border border-borderBg-light dark:border-borderBg-dark">
                    {tool.category}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-neon-cyan">{tool.popularityScore}</span>
                    <span className="text-[9px] text-slate-500 block">Popularity</span>
                  </div>
                  <a
                    href={tool.websiteLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-150 dark:bg-slate-800 hover:bg-neon-cyan hover:text-white rounded-lg transition-colors border border-borderBg-light dark:border-borderBg-dark"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Key AI News Articles */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="text-neon-violet w-5 h-5" /> Recent AI Updates
            </h3>
            <button 
              onClick={() => setActivePage('news')}
              className="text-xs text-neon-violet hover:underline flex items-center gap-1 font-semibold"
            >
              See news feed <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {keyNews.map(article => (
              <div 
                key={article.id}
                className="space-y-1.5 p-3 rounded-xl border border-transparent hover:border-neon-violet/10 hover:bg-slate-100/30 dark:hover:bg-slate-800/10 transition-all duration-300 cursor-pointer"
                onClick={() => setActivePage('news')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-neon-violet bg-neon-violet/10 px-2 py-0.5 rounded border border-neon-violet/15">
                    {article.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(article.publishedDate).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-sm leading-snug line-clamp-1 hover:text-neon-violet transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default Dashboard;

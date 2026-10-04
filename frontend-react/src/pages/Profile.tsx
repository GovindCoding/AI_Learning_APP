import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { 
  Award, Flame, Trophy, Calendar, 
  Shield, Mail 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { dailyLogs } = useLearning();

  // Generate Git-style study heatmap data for the past 14 weeks (98 days)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const cells = [];
    
    // We want a grid of 14 columns (weeks) by 7 rows (days: Sun to Sat)
    // Total cells = 98 days
    const totalDays = 98;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Find logs for this date
      const log = dailyLogs.find(l => l.logDate === dateStr);
      const hours = log ? log.hoursLearned : 0;
      
      cells.push({
        date: dateStr,
        hours,
        dayOfWeek: d.getDay(),
        dateLabel: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }
    return cells;
  }, [dailyLogs]);

  // Group heatmap cells into columns (weeks) for rendering
  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    
    // Fill leading empty slots if the first date isn't a Sunday (index 0)
    const firstCell = heatmapData[0];
    if (firstCell && firstCell.dayOfWeek > 0) {
      for (let padding = 0; padding < firstCell.dayOfWeek; padding++) {
        currentWeek.push(null);
      }
    }

    for (const cell of heatmapData) {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      // Pad end of last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [heatmapData]);

  // Color key generator based on hours studied
  const getIntensityColor = (hours: number | undefined) => {
    if (hours === undefined || hours === 0) return 'bg-slate-200 dark:bg-slate-900 border-transparent';
    if (hours < 1.0) return 'bg-emerald-500/20 border-emerald-500/10';
    if (hours < 2.0) return 'bg-emerald-500/40 border-emerald-500/20';
    if (hours < 4.0) return 'bg-emerald-500/70 border-emerald-500/40';
    return 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]'; // glowing intensity for heavy learning
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Upper Profile Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Card */}
        <GlassCard className="lg:col-span-2 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8 relative overflow-hidden">
          {/* Avatar Icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-neon-cyan to-neon-violet flex items-center justify-center border-2 border-neon-cyan/40 shadow-neon-cyan text-3xl font-extrabold text-white flex-shrink-0 animate-pulse-glow">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AI'}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h3 className="text-2xl font-extrabold">{user?.username || 'Learner'}</h3>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan text-[10px] font-bold border border-neon-cyan/25 w-max mx-auto md:mx-0">
                  <Shield className="w-3 h-3" />
                  <span>Verified Learner</span>
                </span>
              </div>
              <p className="text-xs text-slate-450 dark:text-slate-450 mt-1 flex items-center justify-center md:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email || 'email@example.com'}
              </p>
            </div>

            {/* Sub stats */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-borderBg-light dark:border-borderBg-dark text-xs">
              <div>
                <span className="text-slate-450 dark:text-slate-400 block font-semibold">Current Goal</span>
                <span className="font-bold text-neon-cyan truncate block">{user?.learningGoal || 'Generative AI'}</span>
              </div>
              <div>
                <span className="text-slate-450 dark:text-slate-400 block font-semibold">Skill Tier</span>
                <span className="font-bold capitalize text-neon-violet block">{user?.skillLevel || 'Beginner'}</span>
              </div>
              <div>
                <span className="text-slate-450 dark:text-slate-400 block font-semibold">Active Since</span>
                <span className="font-bold block">May 2026</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Level Stats Widget */}
        <GlassCard className="flex flex-col justify-between p-8 border-l-4 border-neon-violet">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neon-violet bg-neon-violet/10 px-2.5 py-1 rounded-full border border-neon-violet/20">
                Gamification Stats
              </span>
              <Trophy className="w-5 h-5 text-neon-violet" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-semibold block">Total Accumulated XP</span>
              <h2 className="text-4xl font-black bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
                {user?.xp || 0} XP
              </h2>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Level {user?.level || 1} progression</span>
                <span>{(user ? user.xp % 1000 : 0)} / 1000 XP</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full shadow-neon-cyan transition-all duration-500"
                  style={{ width: `${user ? (user.xp % 1000) / 10 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-xs pt-4 border-t border-borderBg-light dark:border-borderBg-dark mt-4">
            <span className="text-slate-400">Streak Record:</span>
            <span className="font-bold text-orange-500 flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-current" /> {user?.maxStreak || 0} Days max
            </span>
          </div>
        </GlassCard>

      </div>

      {/* Git-Style Heatmap Grid */}
      <GlassCard className="space-y-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="text-neon-cyan w-5 h-5" /> Learning Velocity Heatmap
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400">Daily study duration record over the past 98 days (14 weeks)</p>
        </div>

        {/* Heatmap Container */}
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-1.5 min-w-[500px] select-none p-1">
            
            {/* Week Columns */}
            {heatmapWeeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col space-y-1.5">
                {week.map((cell, dIndex) => (
                  <div
                    key={dIndex}
                    className={`w-4 h-4 rounded border transition-all duration-300 relative group cursor-pointer ${
                      cell ? getIntensityColor(cell.hours) : 'bg-transparent border-transparent pointer-events-none'
                    }`}
                  >
                    {/* Tooltip on hover */}
                    {cell && (
                      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-[9px] text-white px-2 py-1 rounded border border-borderBg-dark opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-50">
                        {cell.hours.toFixed(1)} hrs on {cell.dateLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}

          </div>
        </div>

        {/* Intensity Legend */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-borderBg-light dark:border-borderBg-dark pt-3">
          <span>98 days ago</span>
          <div className="flex items-center space-x-1">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-900 border border-transparent"></div>
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/10"></div>
            <div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/20"></div>
            <div className="w-3 h-3 rounded bg-emerald-500/70 border border-emerald-500/40"></div>
            <div className="w-3 h-3 rounded bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]"></div>
            <span>More</span>
          </div>
          <span>Today</span>
        </div>
      </GlassCard>

      {/* Badges Shelf Grid */}
      <GlassCard className="space-y-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Award className="text-neon-violet w-5 h-5" /> Earned Milestone Achievements
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400">XP accomplishments and roadmap completions unlocked badges</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.badges && user.badges.length > 0 ? (
            user.badges.map(badge => (
              <div 
                key={badge.id}
                className="flex items-start space-x-4 p-4 rounded-2xl border border-neon-cyan/15 bg-gradient-to-br from-neon-cyan/5 via-transparent to-transparent shadow-[0_4px_15px_rgba(6,182,212,0.02)] group hover:border-neon-cyan/30 transition-all duration-300"
              >
                <div className="p-3 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100">{badge.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                  <span className="text-[9px] font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded mt-3 inline-block uppercase tracking-wider">
                    {badge.xpRequirement} XP Required
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs col-span-full">
              No badges unlocked yet. Keep studying to gain XP!
            </div>
          )}
        </div>
      </GlassCard>

    </div>
  );
};
export default Profile;

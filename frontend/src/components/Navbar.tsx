import React, { useState } from 'react';
import { Sun, Moon, Flame, Bell, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic XP progress bar calculation: User level unlocks every 1000 XP
  const nextLevelXp = 1000;
  const currentXpInLevel = user ? user.xp % nextLevelXp : 0;
  const progressPercent = Math.min((currentXpInLevel / nextLevelXp) * 100, 100);

  const notifications = [
    { id: 1, text: '🎉 New Roadmap Generated for ' + (user?.learningGoal || 'Generative AI') },
    { id: 2, text: '🔥 5 Day Streak reached! Keep it up!' },
    { id: 3, text: '💡 Suggestion: Check out Claude 3.5 Sonnet in Tools!' }
  ];

  return (
    <header className="fixed top-0 right-0 left-64 h-20 glass-panel border-b border-borderBg-light dark:border-borderBg-dark flex items-center justify-between px-8 z-20">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          {pageTitle}
        </h1>
      </div>

      {/* User Stats & Actions */}
      <div className="flex items-center space-x-6">
        
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 font-semibold text-sm shadow-[0_0_10px_rgba(249,115,22,0.1)]">
          <Flame className="w-5 h-5 fill-current animate-pulse" />
          <span>{user?.streak || 0} Days</span>
        </div>

        {/* Level & XP Progress bar */}
        <div className="flex flex-col w-48 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-neon-cyan flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Level {user?.level || 1}
            </span>
            <span className="text-slate-400">{currentXpInLevel}/{nextLevelXp} XP</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full transition-all duration-500 shadow-neon-cyan"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-850 transition-all duration-300 text-slate-500 hover:text-neon-cyan"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:bg-slate-100 dark:hover:bg-slate-850 transition-all duration-300 text-slate-500 hover:text-neon-cyan relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 border border-borderBg-light dark:border-borderBg-dark shadow-2xl z-55">
              <div className="flex items-center justify-between pb-3 border-b border-borderBg-light dark:border-borderBg-dark mb-2">
                <span className="font-semibold text-sm">Notifications</span>
                <Sparkles className="w-4 h-4 text-neon-cyan" />
              </div>
              <div className="space-y-2">
                {notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-xs transition-colors duration-300 cursor-pointer border border-transparent hover:border-neon-cyan/10"
                  >
                    {notif.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
export default Navbar;

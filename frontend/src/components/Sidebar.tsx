import React from 'react';
import { 
  LayoutDashboard, Map, Grid, Newspaper, 
  BookOpen, User, ShieldAlert, Settings, Brain, LogOut, Share2, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles.some(r => r.name === 'ROLE_ADMIN') || user?.username === 'AIElora'; // mock admin trigger

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', name: 'AI Roadmap', icon: Map },
    { id: 'tools', name: 'Tools Directory', icon: Grid },
    { id: 'news', name: 'AI News Feed', icon: Newspaper },
    { id: 'google-ai', name: 'Google AI Hub', icon: Sparkles },
    { id: 'social', name: 'AI Social Studio', icon: Share2 },
    { id: 'modules', name: 'Learning Modules', icon: BookOpen },
    { id: 'profile', name: 'Profile & Stats', icon: User },
    ...(isAdmin ? [{ id: 'admin', name: 'Admin Panel', icon: ShieldAlert }] : []),
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-panel border-r border-borderBg-light dark:border-borderBg-dark flex flex-col z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-borderBg-light dark:border-borderBg-dark flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-xl shadow-neon-cyan">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
          AI TRACKER
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-neon-cyan/10 to-neon-violet/10 border-l-4 border-neon-cyan text-neon-cyan font-medium' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-neon-cyan' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-borderBg-light dark:border-borderBg-dark flex flex-col space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-cyan/20 to-neon-violet/20 flex items-center justify-center border border-neon-cyan/30 text-neon-cyan font-bold">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AI'}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-semibold truncate">{user?.username || 'Guest Learner'}</h4>
            <span className="text-xs text-slate-500 truncate block">Lvl {user?.level || 1} • {user?.xp || 0} XP</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-300 text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;

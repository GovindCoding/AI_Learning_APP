import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningProvider } from './context/LearningContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';

// Pages
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import RoadmapPage from './pages/RoadmapPage';
import ToolsDirectory from './pages/ToolsDirectory';
import NewsFeed from './pages/NewsFeed';
import LearningModules from './pages/LearningModules';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import SocialStudio from './pages/SocialStudio';
import GoogleAIHub from './pages/GoogleAIHub';

import { Brain, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import GlassCard from './components/GlassCard';

const LoginScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(username, password);
        if (!success) {
          setErrorMsg('Invalid credentials. Password must be >= 4 characters.');
        }
      } else {
        if (!email.trim() || !username.trim() || password.length < 4) {
          setErrorMsg('Please fill all fields. Password must be >= 4 characters.');
          setLoading(false);
          return;
        }
        const success = await signup(username, email, password);
        if (success) {
          // Auto login after signup
          await login(username, password);
        } else {
          setErrorMsg('Signup failed. Choose another username.');
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 radial-bg relative overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      <GlassCard className="w-full max-w-md p-8 relative z-10 border border-borderBg-light dark:border-borderBg-dark">
        {/* Branding */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <div className="p-2.5 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-2xl shadow-neon-cyan animate-bounce">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent tracking-widest mt-2">
            AI TRACKER
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personalized Learning & Productivity Dashboard</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-neon-rose font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="AIElora"
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-sm shadow-neon-cyan hover:scale-102 active:scale-98 transition-all disabled:opacity-50 mt-6"
          >
            <span>{loading ? 'Authenticating...' : isLogin ? 'Access Account' : 'Register Account'}</span>
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="text-xs text-neon-cyan hover:underline font-semibold"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Log In'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = React.useState('dashboard');

  // Sync History API path
  React.useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/ai/google' || path === '/ai/gemini' || path === '/ai/deepmind') {
        setActivePage('google-ai');
        localStorage.setItem('google_ai_active_tab', path === '/ai/google' ? 'google' : path === '/ai/gemini' ? 'gemini' : 'deepmind');
        // Dispatch custom event to notify GoogleAIHub tab selection
        window.dispatchEvent(new CustomEvent('google-ai-tab-change', { detail: path === '/ai/google' ? 'google' : path === '/ai/gemini' ? 'gemini' : 'deepmind' }));
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  React.useEffect(() => {
    if (activePage !== 'google-ai') {
      const path = window.location.pathname;
      if (path.startsWith('/ai/')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activePage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center text-neon-cyan font-bold text-sm">
        <Sparkles className="w-6 h-6 animate-spin mr-2" /> Initializing AI Engines...
      </div>
    );
  }

  // 1. Not logged in: Show Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  // 2. Logged in but Onboarding Questionnaire not completed: Show Onboarding questionnaire
  if (!user.onboardingDone) {
    return <Onboarding />;
  }

  // Helper for navbar headers
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Learning Dashboard';
      case 'roadmap': return 'AI Curriculum Pathway';
      case 'tools': return 'Centralized AI Tools';
      case 'news': return 'AI Aggregated News Feed';
      case 'google-ai': return 'Google AI Ecosystem Hub';
      case 'social': return 'AI Social Creator Studio';
      case 'modules': return 'Quizzes & Study materials';
      case 'profile': return 'User Progress & Badges';
      case 'settings': return 'System Configuration';
      case 'admin': return 'Catalog Hub Administration';
      default: return 'AI Learning Tracker';
    }
  };

  // Render sub page depending on state selection
  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'roadmap':
        return <RoadmapPage setActivePage={setActivePage} />;
      case 'tools':
        return <ToolsDirectory />;
      case 'news':
        return <NewsFeed setActivePage={setActivePage} />;
      case 'google-ai':
        return <GoogleAIHub setActivePage={setActivePage} />;
      case 'social':
        return <SocialStudio />;
      case 'modules':
        return <LearningModules />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans relative overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main container with fixed offsets */}
      <div className="pl-64 min-h-screen flex flex-col">
        
        {/* Navbar */}
        <Navbar pageTitle={getPageTitle()} />

        {/* Content Pane */}
        <main className="flex-1 mt-20 p-8 overflow-y-auto radial-bg">
          {renderPageContent()}
        </main>
      </div>

      {/* Floating Chatbot Assistant */}
      <ChatBot />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LearningProvider>
          <AppContent />
        </LearningProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

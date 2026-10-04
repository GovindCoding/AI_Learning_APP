import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Key, Database, 
  Save, Trash2, Sliders 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export const Settings: React.FC = () => {
  const { user, submitOnboarding } = useAuth();


  // Local state for settings form
  const [formData, setFormData] = useState({
    skillLevel: user?.skillLevel || 'Beginner',
    background: user?.background || 'Software Engineer',
    learningGoal: user?.learningGoal || 'Generative AI Engineer',
    hoursPerDay: user?.hoursPerDay || 1.5,
    learningStyle: user?.learningStyle || 'hands-on projects'
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    geminiKey: localStorage.getItem('api_gemini_key') || '',
    openaiKey: localStorage.getItem('api_openai_key') || '',
    anthropicKey: localStorage.getItem('api_anthropic_key') || ''
  });

  // Database / Mode Sync State
  const [syncMode, setSyncMode] = useState(() => {
    return localStorage.getItem('api_sync_mode') || 'mock';
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    
    // Save onboarding customization
    await submitOnboarding({
      ...formData,
      hoursPerDay: Number(formData.hoursPerDay)
    });

    // Save API keys to local storage
    localStorage.setItem('api_gemini_key', apiKeys.geminiKey);
    localStorage.setItem('api_openai_key', apiKeys.openaiKey);
    localStorage.setItem('api_anthropic_key', apiKeys.anthropicKey);

    // Save sync mode
    localStorage.setItem('api_sync_mode', syncMode);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to clear your local dashboard progress data? This resets roadmap statuses, favorites, and streaks.")) {
      localStorage.removeItem('ai_nodes');
      localStorage.removeItem('ai_favs');
      localStorage.removeItem('ai_bookmarks');
      localStorage.removeItem('ai_logs');
      localStorage.removeItem('ai_user');
      localStorage.removeItem('ai_token');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Page header */}
      <div className="pb-4 border-b border-borderBg-light dark:border-borderBg-dark">
        <h2 className="text-xl font-bold">Preferences & Configuration</h2>
        <p className="text-xs text-slate-450 dark:text-slate-400">Configure API endpoints, AI keys, study styles, and toggle UI appearance settings.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Profile/Roadmap Customization */}
        <GlassCard className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <Sliders className="w-5 h-5 text-neon-cyan" />
            <h3 className="font-bold text-base">Curriculum Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Learning Goal Path</label>
              <select
                name="learningGoal"
                value={formData.learningGoal}
                onChange={handleTextChange}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              >
                <option value="Generative AI Engineer">Generative AI Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="AI Research Scientist">AI Research Scientist</option>
                <option value="Hobbyist Builder">Hobbyist Builder</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Current Knowledge Level</label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleTextChange}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Study Time Commitment (Hours/Day)</label>
              <input
                type="number"
                name="hoursPerDay"
                min="0.5"
                max="8"
                step="0.5"
                value={formData.hoursPerDay}
                onChange={handleTextChange}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Learning Style Preference</label>
              <select
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleTextChange}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan"
              >
                <option value="hands-on projects">Hands-on Projects</option>
                <option value="theory & research papers">Theory & Research Papers</option>
                <option value="video lectures & documentation">Video Lectures & Documentation</option>
              </select>
            </div>

          </div>
        </GlassCard>

        {/* API Model Credentials */}
        <GlassCard className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <Key className="w-5 h-5 text-neon-violet" />
            <div>
              <h3 className="font-bold text-base">Model API Keys</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Activate live LLM prompts for chatbots and customized quiz generation.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Google Gemini API Key</label>
              <input
                type="password"
                name="geminiKey"
                value={apiKeys.geminiKey}
                onChange={handleKeyChange}
                placeholder="AIzaSy..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">OpenAI API Key</label>
              <input
                type="password"
                name="openaiKey"
                value={apiKeys.openaiKey}
                onChange={handleKeyChange}
                placeholder="sk-proj-..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">Anthropic API Key</label>
              <input
                type="password"
                name="anthropicKey"
                value={apiKeys.anthropicKey}
                onChange={handleKeyChange}
                placeholder="sk-ant-..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-cyan font-mono"
              />
            </div>
          </div>
        </GlassCard>

        {/* Sync Mode */}
        <GlassCard className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-borderBg-light dark:border-borderBg-dark pb-3 mb-2">
            <Database className="w-5 h-5 text-neon-emerald" />
            <div>
              <h3 className="font-bold text-base">Backend Connectivity</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Toggle between offline mock demonstration and running microservices backend integration.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSyncMode('mock')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 ${
                syncMode === 'mock'
                  ? 'border-neon-emerald bg-neon-emerald/5 text-neon-emerald'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500'
              }`}
            >
              <span className="font-bold text-sm">Simulated Fallback Mode</span>
              <span className="text-[10px] text-slate-400 leading-relaxed block mt-1">
                Utilize local mock data structures cached in localstorage. Instant setup, ideal for quick testing.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSyncMode('backend')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all duration-300 ${
                syncMode === 'backend'
                  ? 'border-neon-emerald bg-neon-emerald/5 text-neon-emerald'
                  : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-500'
              }`}
            >
              <span className="font-bold text-sm">Spring Cloud Microservices</span>
              <span className="text-[10px] text-slate-400 leading-relaxed block mt-1">
                Route requests to live gateway APIs running on localhost:8080. Requires database and services online.
              </span>
            </button>
          </div>
        </GlassCard>

        {/* Clear Data cache and submit controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-borderBg-light dark:border-borderBg-dark pt-6 gap-4">
          <button
            type="button"
            onClick={handleClearCache}
            className="flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 transition-colors text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Local Progress Cache</span>
          </button>

          <div className="flex items-center space-x-3 self-end md:self-auto">
            {saveSuccess && (
              <span className="text-xs text-neon-emerald font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
            >
              <Save className="w-4 h-4" />
              <span>Save Configurations</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
export default Settings;

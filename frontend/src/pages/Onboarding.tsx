import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { Brain, Star, Clock, Target, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export const Onboarding: React.FC = () => {
  const { submitOnboarding } = useAuth();
  const { generateRoadmap } = useLearning();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    skillLevel: 'Beginner',
    background: 'Software Engineer',
    learningGoal: 'Generative AI Engineer',
    hoursPerDay: 1.5,
    learningStyle: 'hands-on projects'
  });
  const [loading, setLoading] = useState(false);

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const backgrounds = ['Software Engineer', 'Student', 'Data Analyst', 'Product Manager', 'Other'];
  const goals = ['Become Expert in Gemini Ecosystem', 'Generative AI Engineer', 'Machine Learning Engineer', 'AI Research Scientist', 'Hobbyist Builder'];
  const learningStyles = ['hands-on projects', 'theory & research papers', 'video lectures & documentation'];

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Submit onboarding response
      await submitOnboarding(formData);
      // 2. Generate roadmap nodes matching preferences
      await generateRoadmap(formData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 radial-bg relative overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      <GlassCard className="w-full max-w-2xl border border-borderBg-light dark:border-borderBg-dark p-8 md:p-12 relative z-10">
        
        {/* Logo/Branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-neon-cyan to-neon-violet rounded-xl shadow-neon-cyan">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent tracking-wider">
            AI TRACKER
          </span>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step 
                  ? 'w-8 bg-gradient-to-r from-neon-cyan to-neon-violet shadow-neon-cyan' 
                  : i < step ? 'w-2 bg-neon-cyan/40' : 'w-2 bg-slate-350 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[220px] flex flex-col justify-center">
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <Star className="text-neon-cyan w-6 h-6" /> What is your current AI knowledge level?
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mb-6">This helps us tailor initial concepts and roadmap difficulty.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {skillLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, skillLevel: level })}
                    className={`p-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                      formData.skillLevel === level
                        ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <GraduationCap className="text-neon-violet w-6 h-6" /> What is your professional background?
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mb-6">We will adapt mathematical formulations and coding analogies to your profile.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {backgrounds.map(bg => (
                  <button
                    key={bg}
                    onClick={() => setFormData({ ...formData, background: bg })}
                    className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all duration-300 ${
                      formData.background === bg
                        ? 'border-neon-violet bg-neon-violet/10 text-neon-violet shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <Target className="text-neon-emerald w-6 h-6" /> What is your primary learning goal?
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mb-6">Select the focus domain you want to master.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => setFormData({ ...formData, learningGoal: goal })}
                    className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all duration-300 ${
                      formData.learningGoal === goal
                        ? 'border-neon-emerald bg-neon-emerald/10 text-neon-emerald shadow-[0_0_15px_rgba(16,119,81,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <Clock className="text-orange-500 w-6 h-6" /> How much study time can you commit daily?
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mb-8">We will structure node durations to keep your goals attainable.</p>
              <div className="px-4">
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={formData.hoursPerDay}
                  onChange={e => setFormData({ ...formData, hoursPerDay: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan focus:outline-none"
                />
                <div className="flex justify-between text-xs mt-3 text-slate-400 font-semibold">
                  <span>0.5 Hours (Casual)</span>
                  <span>2.0 Hours (Moderate)</span>
                  <span>4.0 Hours (Intense)</span>
                </div>
                <div className="mt-8 text-center bg-slate-100 dark:bg-slate-900/50 rounded-2xl py-3 border border-borderBg-light dark:border-borderBg-dark">
                  <span className="text-lg font-bold text-neon-cyan">{formData.hoursPerDay} Hours</span>
                  <span className="text-xs text-slate-400 block mt-1">Estimated Roadmap Completion: {Math.ceil(60 / (formData.hoursPerDay * 5))} weeks</span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="text-neon-rose w-6 h-6" /> Choose your preferred study style:
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm mb-6">Select how you ingest learning material best.</p>
              <div className="grid grid-cols-1 gap-3">
                {learningStyles.map(style => (
                  <button
                    key={style}
                    onClick={() => setFormData({ ...formData, learningStyle: style })}
                    className={`p-4 rounded-xl border text-sm font-semibold text-left capitalize transition-all duration-300 ${
                      formData.learningStyle === style
                        ? 'border-neon-rose bg-neon-rose/10 text-neon-rose shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400 dark:hover:border-slate-500 bg-white/20 dark:bg-slate-900/20'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-10 border-t border-borderBg-light dark:border-borderBg-dark pt-6">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1 || loading}
            className="px-6 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors duration-300"
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white shadow-neon-cyan hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 text-sm font-semibold"
          >
            <span>{loading ? 'Initializing Engine...' : step === 5 ? 'Launch Roadmap' : 'Continue'}</span>
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

      </GlassCard>
    </div>
  );
};
export default Onboarding;

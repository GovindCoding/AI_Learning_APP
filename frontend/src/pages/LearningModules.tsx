import React, { useState, useEffect } from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  BookOpen, HelpCircle, ArrowRight, Award, CheckCircle, 
  XCircle, Award as Medal, RefreshCw, Layers 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import type { Quiz } from '../types';

export const LearningModules: React.FC = () => {
  const { nodes, getQuizzesForNode, submitQuiz } = useLearning();
  
  const [activeTab, setActiveTab] = useState<'quizzes' | 'flashcards'>('quizzes');
  
  // Quiz states
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Quiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean; xpGained: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Flashcards deck
  const flashcards = [
    { id: 1, term: 'Transformer Model', definition: 'A deep learning architecture relying on self-attention mechanisms, processing sequences in parallel. Introduced in "Attention Is All You Need" (2017). Forms the basis of modern LLMs.' },
    { id: 2, term: 'Quantization', definition: 'The process of reducing model weights from high precision (like float32) to lower precision (like int8). This reduces model size and speeds up execution, crucial for local deployment.' },
    { id: 3, term: 'Vector Embeddings', definition: 'High-dimensional mathematical vector representations of tokens, words, or documents that capture semantic relationships. Points closer together in vector space share similar meanings.' },
    { id: 4, term: 'Temperature', definition: 'A hyperparameter controlling the randomness of LLM text generation. Lower values (e.g., 0.1) force deterministic, factual responses; higher values (e.g., 0.9) increase creativity/randomness.' },
    { id: 5, term: 'LoRA (Low-Rank Adaptation)', definition: 'A Parameter-Efficient Fine-Tuning (PEFT) method that freezes pre-trained model weights and injects trainable rank-decomposition matrices, drastically cutting GPU memory usage.' }
  ];
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load quizzes when selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId) {
      const loadQuiz = async () => {
        const q = await getQuizzesForNode(selectedNodeId);
        setQuizQuestions(q);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizResult(null);
      };
      loadQuiz();
    }
  }, [selectedNodeId]);

  const handleAnswerSelect = (option: string) => {
    if (quizQuestions.length === 0) return;
    const qId = quizQuestions[currentQuestionIndex].id;
    setUserAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedNodeId) return;
    setSubmitting(true);
    try {
      const result = await submitQuiz(selectedNodeId, userAnswers);
      setQuizResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResult(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Tabs */}
      <div className="flex border-b border-borderBg-light dark:border-borderBg-dark">
        <button
          onClick={() => { setActiveTab('quizzes'); setSelectedNodeId(null); }}
          className={`flex items-center space-x-2 pb-4 px-6 border-b-2 font-bold text-sm transition-all duration-300 ${
            activeTab === 'quizzes'
              ? 'border-neon-cyan text-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5" />
          <span>Interactive Quizzes</span>
        </button>
        <button
          onClick={() => { setActiveTab('flashcards'); setIsFlipped(false); }}
          className={`flex items-center space-x-2 pb-4 px-6 border-b-2 font-bold text-sm transition-all duration-300 ${
            activeTab === 'flashcards'
              ? 'border-neon-cyan text-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          <span>Study Flashcards</span>
        </button>
      </div>

      {/* QUIZ SECTION */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {!selectedNodeId ? (
            <>
              {/* Module selection grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map(node => {
                  const isCompleted = node.status === 'COMPLETED';
                  const isInProgress = node.status === 'IN_PROGRESS';
                  
                  return (
                    <GlassCard 
                      key={node.id} 
                      className={`flex flex-col justify-between border ${
                        isCompleted 
                          ? 'border-neon-emerald/20 hover:border-neon-emerald/30 shadow-[0_4px_20px_rgba(16,185,129,0.04)]'
                          : isInProgress 
                            ? 'border-neon-cyan/20 hover:border-neon-cyan/35 shadow-[0_4px_20px_rgba(6,182,212,0.06)]'
                            : 'border-borderBg-light dark:border-borderBg-dark'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            node.difficulty === 'advanced' 
                              ? 'bg-rose-500/10 text-neon-rose border-neon-rose/20' 
                              : node.difficulty === 'intermediate'
                                ? 'bg-neon-violet/10 text-neon-violet border-neon-violet/20'
                                : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                          }`}>
                            {node.difficulty}
                          </span>
                          <span className={`text-[10px] font-semibold ${
                            isCompleted ? 'text-neon-emerald' : isInProgress ? 'text-neon-cyan' : 'text-slate-400'
                          }`}>
                            {node.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="font-bold text-base leading-snug mb-2">{node.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {node.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedNodeId(node.id)}
                        className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/30 text-xs font-semibold hover:text-neon-cyan transition-all duration-300"
                      >
                        <span>Start Module Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </GlassCard>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Back button */}
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-slate-400 hover:text-neon-cyan font-semibold flex items-center gap-1 mb-6"
              >
                ← Back to Modules
              </button>

              {quizQuestions.length === 0 ? (
                <GlassCard className="text-center py-12">
                  <p className="text-slate-400 text-sm mb-4">Generating or loading questions for this module...</p>
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold"
                  >
                    Go Back
                  </button>
                </GlassCard>
              ) : !quizResult ? (
                /* Interactive Quiz Question Card */
                <GlassCard className="space-y-6">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Question */}
                  <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 leading-snug">
                    {quizQuestions[currentQuestionIndex].question}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optText = (quizQuestions[currentQuestionIndex] as any)[`option${opt}`];
                      const qId = quizQuestions[currentQuestionIndex].id;
                      const isSelected = userAnswers[qId] === opt;

                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswerSelect(opt)}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-300 flex items-start space-x-3 ${
                            isSelected
                              ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                              : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-450 dark:hover:border-slate-700 bg-slate-100/10 dark:bg-slate-900/10'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5 ${
                            isSelected ? 'bg-neon-cyan text-white border-neon-cyan' : 'border-slate-400 text-slate-400'
                          }`}>
                            {opt}
                          </span>
                          <span className="leading-relaxed">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer control */}
                  <div className="flex justify-end pt-4 border-t border-borderBg-light dark:border-borderBg-dark">
                    <button
                      onClick={handleNextQuestion}
                      disabled={!userAnswers[quizQuestions[currentQuestionIndex].id] || submitting}
                      className="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-neon-cyan"
                    >
                      <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Submit Answers' : 'Next Question'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </GlassCard>
              ) : (
                /* Quiz Results Panel */
                <GlassCard className="text-center p-8 space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="flex justify-center">
                    <div className={`p-4 rounded-full border-2 ${
                      quizResult.passed 
                        ? 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-rose-500/10 text-neon-rose border-neon-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                    }`}>
                      {quizResult.passed ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold">
                      {quizResult.passed ? 'Congratulations!' : 'Quiz Not Passed'}
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400">
                      Required passing score: 70%. Your score: <strong>{quizResult.score}%</strong>
                    </p>
                  </div>

                  {quizResult.passed ? (
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-neon-cyan/15 to-neon-violet/15 border border-neon-cyan/20 px-4 py-2.5 rounded-2xl text-xs text-neon-cyan font-bold">
                      <Medal className="w-4 h-4 text-neon-violet" />
                      <span>Earned +{quizResult.xpGained} XP! Roadmap Node Updated.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 px-8 leading-relaxed">
                      Don't worry! Review the materials or check in with your AI assistant chatbot on the bottom right to clarify concepts.
                    </p>
                  )}

                  <div className="flex items-center justify-center space-x-4 pt-4 border-t border-borderBg-light dark:border-borderBg-dark">
                    <button
                      onClick={handleResetQuiz}
                      className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                    <button
                      onClick={() => setSelectedNodeId(null)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      )}

      {/* FLASHCARD SECTION */}
      {activeTab === 'flashcards' && (
        <div className="max-w-md mx-auto space-y-8 py-4">
          
          {/* Flipped Card Component */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer relative perspective-1000 group"
          >
            {/* Inner Flip Wrapper */}
            <div className={`w-full h-full duration-500 transform-style-3d relative ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              
              {/* CARD FRONT */}
              <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl border border-borderBg-light dark:border-borderBg-dark p-8 flex flex-col justify-between items-center text-center shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-neon-cyan/15 flex items-center justify-center text-neon-cyan border border-neon-cyan/25">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Term Definition</span>
                  <h3 className="text-2xl font-extrabold text-slate-850 dark:text-white tracking-wide">
                    {flashcards[currentFlashcardIndex].term}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-bold group-hover:text-neon-cyan transition-colors">
                  Click card to reveal definition
                </span>
              </div>

              {/* CARD BACK */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel rounded-3xl border border-neon-violet/30 p-8 flex flex-col justify-between items-center text-center shadow-2xl bg-gradient-to-br from-neon-violet/5 via-transparent to-transparent">
                <div className="w-12 h-12 rounded-2xl bg-neon-violet/15 flex items-center justify-center text-neon-violet border border-neon-violet/25">
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-300 font-medium px-4">
                  {flashcards[currentFlashcardIndex].definition}
                </p>
                <span className="text-[10px] text-slate-500 font-bold">
                  Click card to flip back
                </span>
              </div>

            </div>
          </div>

          {/* Flashcard navigation controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsFlipped(false);
                setTimeout(() => {
                  setCurrentFlashcardIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
                }, 150);
              }}
              className="px-4 py-2 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400 font-bold">
              {currentFlashcardIndex + 1} / {flashcards.length}
            </span>
            <button
              onClick={() => {
                setIsFlipped(false);
                setTimeout(() => {
                  setCurrentFlashcardIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
                }, 150);
              }}
              className="px-4 py-2 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
export default LearningModules;

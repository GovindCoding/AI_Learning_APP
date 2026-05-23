import React from 'react';
import { useLearning } from '../context/LearningContext';
import { 
  Play, CheckCircle, Lock, Award, AlertCircle, 
  ChevronRight 
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface RoadmapPageProps {
  setActivePage: (page: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ setActivePage }) => {
  const { nodes, updateNodeStatus } = useLearning();

  const handleStartNode = async (nodeId: number) => {
    await updateNodeStatus(nodeId, 'IN_PROGRESS');
  };

  const handleCompleteNode = async (nodeId: number) => {
    // Alternatively can redirect to quiz
    await updateNodeStatus(nodeId, 'COMPLETED');
  };

  // Sort nodes in order of sequence
  const sortedNodes = [...nodes].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  // Helper to determine if a node is locked (i.e. parent node is not completed yet)
  const isNodeLocked = (node: typeof sortedNodes[0]) => {
    if (!node.parentNodeId) return false;
    const parent = nodes.find(n => n.id === node.parentNodeId);
    return parent ? parent.status !== 'COMPLETED' : false;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-borderBg-light dark:border-borderBg-dark gap-4">
        <div>
          <h2 className="text-xl font-bold">Your Curriculum Pathway</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400">Complete nodes sequentially, take quizzes, and earn XP to level up.</p>
        </div>
        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-emerald shadow-neon-emerald inline-block"></span>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-neon-cyan inline-block"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-350 dark:bg-slate-700 inline-block"></span>
            <span>Locked / Pending</span>
          </div>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="relative max-w-3xl mx-auto px-4 py-8">
        
        {/* Continuous Connecting Line */}
        <div className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 z-0"></div>

        {/* Dynamic Nodes timeline */}
        <div className="space-y-12 relative z-10">
          {sortedNodes.map((node, index) => {
            const locked = isNodeLocked(node);
            const isCompleted = node.status === 'COMPLETED';
            const isInProgress = node.status === 'IN_PROGRESS';
            
            // Layout alignment (Alternating left/right on desktop)
            const isEven = index % 2 === 0;

            let statusColor = 'bg-slate-300 dark:bg-slate-800 text-slate-400 border-slate-400/20';
            let pulseEffect = '';
            if (isCompleted) {
              statusColor = 'bg-neon-emerald/20 text-neon-emerald border-neon-emerald/45 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
            } else if (isInProgress) {
              statusColor = 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/45 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
              pulseEffect = 'animate-pulse';
            } else if (!locked) {
              statusColor = 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500';
            }

            return (
              <div 
                key={node.id} 
                className={`flex flex-col md:flex-row items-start ${
                  isEven ? 'md:flex-row-reverse' : ''
                } relative`}
              >
                
                {/* Timeline Center Bullet Indicator */}
                <div className="absolute left-[39px] md:left-1/2 top-6 -translate-x-1/2 z-20 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${statusColor} ${pulseEffect}`}>
                    {locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-4 h-4 fill-current" />
                    ) : (
                      <span className="text-xs font-bold">{node.sequenceOrder}</span>
                    )}
                  </div>
                </div>

                {/* Left/Right empty spacer container for desk alignment */}
                <div className="hidden md:block w-1/2"></div>

                {/* Content Card Container */}
                <div className="w-full md:w-[calc(50%-40px)] pl-16 md:pl-0">
                  <GlassCard 
                    className={`transition-all duration-300 relative border ${
                      isCompleted 
                        ? 'border-neon-emerald/20 hover:border-neon-emerald/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' 
                        : isInProgress 
                          ? 'border-neon-cyan/30 hover:border-neon-cyan/50 shadow-[0_4px_20px_rgba(6,182,212,0.08)]'
                          : 'border-borderBg-light dark:border-borderBg-dark'
                    } ${locked ? 'opacity-60 hover:shadow-none' : ''}`}
                    hoverGlow={!locked}
                  >
                    
                    {/* Top Row: Difficulty & Time stats */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full border ${
                        node.difficulty === 'advanced'
                          ? 'bg-rose-500/10 text-neon-rose border-neon-rose/20'
                          : node.difficulty === 'intermediate'
                            ? 'bg-neon-violet/10 text-neon-violet border-neon-violet/20'
                            : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
                      }`}>
                        {node.difficulty}
                      </span>
                      <span className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                        {node.durationHours} hours
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`font-bold text-lg mb-2 leading-tight ${isCompleted ? 'text-slate-500 dark:text-slate-400 line-through' : ''}`}>
                      {node.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                      {node.description}
                    </p>

                    {/* Quiz Scores Shelf */}
                    {isCompleted && node.quizScore !== undefined && (
                      <div className="mb-4 flex items-center space-x-2 bg-neon-emerald/5 border border-neon-emerald/10 px-3 py-1.5 rounded-xl text-xs text-neon-emerald">
                        <Award className="w-4 h-4" />
                        <span>Quiz score: <strong>{node.quizScore}%</strong> (Passed)</span>
                      </div>
                    )}

                    {/* Locked notification banner */}
                    {locked && (
                      <div className="flex items-center space-x-2 text-[10px] bg-slate-100 dark:bg-slate-900/50 p-2 rounded-xl text-slate-450 dark:text-slate-400 mb-2 border border-borderBg-light dark:border-borderBg-dark">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Prerequisite node needs completion first.</span>
                      </div>
                    )}

                    {/* Node Actions Row */}
                    {!locked && (
                      <div className="flex items-center justify-between border-t border-borderBg-light dark:border-borderBg-dark pt-4 mt-2">
                        {isCompleted ? (
                          <span className="text-xs text-neon-emerald font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : isInProgress ? (
                          <>
                            <button
                              onClick={() => handleCompleteNode(node.id)}
                              className="text-xs text-neon-emerald hover:underline font-semibold"
                            >
                              Direct Complete
                            </button>
                            <button
                              onClick={() => setActivePage('modules')}
                              className="flex items-center space-x-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs font-semibold px-3 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
                            >
                              <span>Take Quiz</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartNode(node.id)}
                            className="flex items-center space-x-1 text-neon-cyan hover:underline text-xs font-semibold"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Start learning</span>
                          </button>
                        )}
                      </div>
                    )}

                  </GlassCard>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
export default RoadmapPage;

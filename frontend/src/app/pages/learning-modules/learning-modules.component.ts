import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { Quiz, LearningNode } from '../../types';

@Component({
  selector: 'app-learning-modules',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Page Tabs -->
      <div class="flex border-b border-borderBg-light dark:border-borderBg-dark">
        <button
          (click)="setActiveTab('quizzes')"
          [class]="'flex items-center space-x-2 pb-4 px-6 border-b-2 font-bold text-sm transition-all duration-300 ' + 
            (activeTab === 'quizzes'
              ? 'border-neon-cyan text-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="help-circle" className="w-4.5 h-4.5"></app-icon>
          <span>Interactive Quizzes</span>
        </button>
        <button
          (click)="setActiveTab('flashcards')"
          [class]="'flex items-center space-x-2 pb-4 px-6 border-b-2 font-bold text-sm transition-all duration-300 ' + 
            (activeTab === 'flashcards'
              ? 'border-neon-cyan text-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200')"
        >
          <app-icon name="layers" className="w-4.5 h-4.5"></app-icon>
          <span>Study Flashcards</span>
        </button>
      </div>

      <!-- QUIZ SECTION -->
      @if (activeTab === 'quizzes') {
        <div class="space-y-6">
          @if (!selectedNodeId) {
            <!-- Module selection grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (node of learningService.nodes(); track node.id) {
                <app-glass-card 
                  [customClass]="'flex flex-col justify-between border h-full ' + 
                    (node.status === 'COMPLETED' 
                      ? 'border-neon-emerald/20 hover:border-neon-emerald/30 shadow-[0_4px_20px_rgba(16,185,129,0.04)]'
                      : node.status === 'IN_PROGRESS' 
                        ? 'border-neon-cyan/20 hover:border-neon-cyan/35 shadow-[0_4px_20px_rgba(6,182,212,0.06)]'
                        : 'border-borderBg-light dark:border-borderBg-dark')"
                >
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <span [class]="'text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ' + 
                        (node.difficulty === 'advanced' 
                          ? 'bg-rose-500/10 text-neon-rose border-neon-rose/20' 
                          : node.difficulty === 'intermediate'
                            ? 'bg-neon-violet/10 text-neon-violet border-neon-violet/20'
                            : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20')">
                        {{ node.difficulty }}
                      </span>
                      <span [class]="'text-[10px] font-semibold ' + 
                        (node.status === 'COMPLETED' ? 'text-neon-emerald' : node.status === 'IN_PROGRESS' ? 'text-neon-cyan' : 'text-slate-400')">
                        {{ node.status.replace('_', ' ') }}
                      </span>
                    </div>

                    <h3 class="font-bold text-base leading-snug mb-2">{{ node.title }}</h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {{ node.description }}
                    </p>
                  </div>

                  <button
                    (click)="selectModuleForQuiz(node.id)"
                    class="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/30 text-xs font-semibold hover:text-neon-cyan transition-all duration-300"
                  >
                    <span>Start Module Quiz</span>
                    <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
                  </button>
                </app-glass-card>
              }
            </div>
          } @else {
            <div class="max-w-2xl mx-auto">
              <!-- Back button -->
              <button
                (click)="selectedNodeId = null"
                class="text-xs text-slate-400 hover:text-neon-cyan font-semibold flex items-center gap-1 mb-6"
              >
                ← Back to Modules
              </button>

              @if (quizQuestions.length === 0) {
                <app-glass-card customClass="text-center py-12">
                  <p class="text-slate-400 text-sm mb-4">Generating or loading questions for this module...</p>
                  <button 
                    (click)="selectedNodeId = null"
                    class="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold"
                  >
                    Go Back
                  </button>
                </app-glass-card>
              } @else if (!quizResult) {
                <!-- Interactive Quiz Question Card -->
                <app-glass-card customClass="space-y-6">
                  <!-- Progress bar -->
                  <div class="space-y-2">
                    <div class="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Question {{ currentQuestionIndex + 1 }} of {{ quizQuestions.length }}</span>
                      <span>{{ round(((currentQuestionIndex + 1) / quizQuestions.length) * 100) }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-neon-cyan to-neon-violet rounded-full transition-all duration-300"
                        [style.width.%]="((currentQuestionIndex + 1) / quizQuestions.length) * 100"
                      ></div>
                    </div>
                  </div>

                  <!-- Question -->
                  <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {{ currentQuestion.question }}
                  </h3>

                  <!-- Options List -->
                  <div class="space-y-3">
                    @for (opt of ['A', 'B', 'C', 'D']; track opt) {
                      <button
                        (click)="handleAnswerSelect(opt)"
                        [class]="'w-full text-left p-4 rounded-xl border text-sm transition-all duration-300 flex items-start space-x-3 ' + 
                          (userAnswers[currentQuestion.id] === opt
                            ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                            : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-450 dark:hover:border-slate-700 bg-slate-100/10 dark:bg-slate-900/10')"
                      >
                        <span [class]="'w-5 h-5 rounded-md border flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5 ' + 
                          (userAnswers[currentQuestion.id] === opt ? 'bg-neon-cyan text-white border-neon-cyan' : 'border-slate-400 text-slate-400')">
                          {{ opt }}
                        </span>
                        <span class="leading-relaxed">{{ getOptionText(currentQuestion, opt) }}</span>
                      </button>
                    }
                  </div>

                  <!-- Footer control -->
                  <div class="flex justify-end pt-4 border-t border-borderBg-light dark:border-borderBg-dark">
                    <button
                      (click)="handleNextQuestion()"
                      [disabled]="!userAnswers[currentQuestion.id] || submitting"
                      class="flex items-center space-x-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-neon-cyan"
                    >
                      <span>{{ currentQuestionIndex === quizQuestions.length - 1 ? 'Submit Answers' : 'Next Question' }}</span>
                      <app-icon name="arrow-right" className="w-3.5 h-3.5"></app-icon>
                    </button>
                  </div>
                </app-glass-card>
              } @else {
                <!-- Quiz Results Panel -->
                <app-glass-card customClass="text-center p-8 space-y-6 animate-in zoom-in-95 duration-300">
                  <div class="flex justify-center">
                    <div [class]="'p-4 rounded-full border-2 ' + 
                      (quizResult.passed 
                        ? 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-rose-500/10 text-neon-rose border-neon-rose/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]')">
                      @if (quizResult.passed) {
                        <app-icon name="check-circle" className="w-12 h-12"></app-icon>
                      } @else {
                        <app-icon name="x-circle" className="w-12 h-12"></app-icon>
                      }
                    </div>
                  </div>

                  <div class="space-y-2">
                    <h3 class="text-2xl font-extrabold">
                      {{ quizResult.passed ? 'Congratulations!' : 'Quiz Not Passed' }}
                    </h3>
                    <p class="text-xs text-slate-400">
                      Required passing score: 70%. Your score: <strong>{{ quizResult.score }}%</strong>
                    </p>
                  </div>

                  @if (quizResult.passed) {
                    <div class="inline-flex items-center space-x-2 bg-gradient-to-r from-neon-cyan/15 to-neon-violet/15 border border-neon-cyan/20 px-4 py-2.5 rounded-2xl text-xs text-neon-cyan font-bold">
                      <app-icon name="award" className="w-4 h-4 text-neon-violet"></app-icon>
                      <span>Earned +{{ quizResult.xpGained }} XP! Roadmap Node Updated.</span>
                    </div>
                  } @else {
                    <p class="text-xs text-slate-400 px-8 leading-relaxed">
                      Don't worry! Review the materials or check in with your AI assistant chatbot on the bottom right to clarify concepts.
                    </p>
                  }

                  <div class="flex items-center justify-center space-x-4 pt-4 border-t border-borderBg-light dark:border-borderBg-dark">
                    <button
                      (click)="handleResetQuiz()"
                      class="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <app-icon name="refresh-cw" className="w-3.5 h-3.5"></app-icon>
                      <span>Retake Quiz</span>
                    </button>
                    <button
                      (click)="selectedNodeId = null"
                      class="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </app-glass-card>
              }
            </div>
          }
        </div>
      }

      <!-- FLASHCARD SECTION -->
      @if (activeTab === 'flashcards') {
        <div class="max-w-md mx-auto space-y-8 py-4">
          
          <!-- Flipped Card Component -->
          <div 
            (click)="isFlipped = !isFlipped"
            class="w-full h-80 cursor-pointer relative perspective-1000 group"
          >
            <!-- Inner Flip Wrapper -->
            <div [class]="'w-full h-full duration-500 transform-style-3d relative ' + (isFlipped ? 'rotate-y-180' : '')">
              
              <!-- CARD FRONT -->
              <div class="absolute inset-0 backface-hidden glass-panel rounded-3xl border border-borderBg-light dark:border-borderBg-dark p-8 flex flex-col justify-between items-center text-center shadow-2xl">
                <div class="w-12 h-12 rounded-2xl bg-neon-cyan/15 flex items-center justify-center text-neon-cyan border border-neon-cyan/25">
                  <app-icon name="book-open" className="w-6 h-6"></app-icon>
                </div>
                <div class="space-y-2">
                  <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400">Term Definition</span>
                  <h3 class="text-2xl font-extrabold text-slate-800 dark:text-white tracking-wide">
                    {{ flashcards[currentFlashcardIndex].term }}
                  </h3>
                </div>
                <span class="text-[10px] text-slate-500 font-bold group-hover:text-neon-cyan transition-colors">
                  Click card to reveal definition
                </span>
              </div>

              <!-- CARD BACK -->
              <div class="absolute inset-0 backface-hidden rotate-y-180 glass-panel rounded-3xl border border-neon-violet/30 p-8 flex flex-col justify-between items-center text-center shadow-2xl bg-gradient-to-br from-neon-violet/5 via-transparent to-transparent">
                <div class="w-12 h-12 rounded-2xl bg-neon-violet/15 flex items-center justify-center text-neon-violet border border-neon-violet/25">
                  <app-icon name="award" className="w-6 h-6 animate-pulse"></app-icon>
                </div>
                <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium px-4">
                  {{ flashcards[currentFlashcardIndex].definition }}
                </p>
                <span class="text-[10px] text-slate-500 font-bold">
                  Click card to flip back
                </span>
              </div>

            </div>
          </div>

          <!-- Flashcard navigation controls -->
          <div class="flex items-center justify-between">
            <button
              (click)="previousFlashcard()"
              class="px-4 py-2 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <span class="text-xs text-slate-400 font-bold">
              {{ currentFlashcardIndex + 1 }} / {{ flashcards.length }}
            </span>
            <button
              (click)="nextFlashcard()"
              class="px-4 py-2 border border-borderBg-light dark:border-borderBg-dark rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>

        </div>
      }

    </div>
  `
})
export class LearningModulesComponent {
  learningService = inject(LearningService);

  activeTab: 'quizzes' | 'flashcards' = 'quizzes';
  selectedNodeId: number | null = null;
  quizQuestions: Quiz[] = [];
  currentQuestionIndex: number = 0;
  userAnswers: Record<number, string> = {};
  quizResult: { score: number; passed: boolean; xpGained: number } | null = null;
  submitting: boolean = false;

  readonly flashcards = [
    { id: 1, term: 'Transformer Model', definition: 'A deep learning architecture relying on self-attention mechanisms, processing sequences in parallel. Introduced in "Attention Is All You Need" (2017). Forms the basis of modern LLMs.' },
    { id: 2, term: 'Quantization', definition: 'The process of reducing model weights from high precision (like float32) to lower precision (like int8). This reduces model size and speeds up execution, crucial for local deployment.' },
    { id: 3, term: 'Vector Embeddings', definition: 'High-dimensional mathematical vector representations of tokens, words, or documents that capture semantic relationships. Points closer together in vector space share similar meanings.' },
    { id: 4, term: 'Temperature', definition: 'A hyperparameter controlling the randomness of LLM text generation. Lower values (e.g., 0.1) force deterministic, factual responses; higher values (e.g., 0.9) increase creativity/randomness.' },
    { id: 5, term: 'LoRA (Low-Rank Adaptation)', definition: 'A Parameter-Efficient Fine-Tuning (PEFT) method that freezes pre-trained model weights and injects trainable rank-decomposition matrices, drastically cutting GPU memory usage.' }
  ];
  currentFlashcardIndex: number = 0;
  isFlipped: boolean = false;

  round = Math.round;

  get currentQuestion(): Quiz {
    return this.quizQuestions[this.currentQuestionIndex];
  }

  setActiveTab(tab: 'quizzes' | 'flashcards'): void {
    this.activeTab = tab;
    if (tab === 'quizzes') {
      this.selectedNodeId = null;
    } else {
      this.isFlipped = false;
    }
  }

  async selectModuleForQuiz(nodeId: number): Promise<void> {
    this.selectedNodeId = nodeId;
    this.quizQuestions = await this.learningService.getQuizzesForNode(nodeId);
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.quizResult = null;
  }

  handleAnswerSelect(option: string): void {
    if (this.quizQuestions.length === 0) return;
    const qId = this.currentQuestion.id;
    this.userAnswers[qId] = option;
  }

  getOptionText(question: Quiz, opt: string): string {
    return (question as any)[`option${opt}`] || '';
  }

  async handleNextQuestion(): Promise<void> {
    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      await this.handleSubmitQuiz();
    }
  }

  async handleSubmitQuiz(): Promise<void> {
    if (!this.selectedNodeId) return;
    this.submitting = true;
    try {
      this.quizResult = await this.learningService.submitQuiz(this.selectedNodeId, this.userAnswers);
    } catch (e) {
      console.error(e);
    } finally {
      this.submitting = false;
    }
  }

  handleResetQuiz(): void {
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.quizResult = null;
  }

  previousFlashcard(): void {
    this.isFlipped = false;
    setTimeout(() => {
      this.currentFlashcardIndex = this.currentFlashcardIndex > 0 ? this.currentFlashcardIndex - 1 : this.flashcards.length - 1;
    }, 150);
  }

  nextFlashcard(): void {
    this.isFlipped = false;
    setTimeout(() => {
      this.currentFlashcardIndex = this.currentFlashcardIndex < this.flashcards.length - 1 ? this.currentFlashcardIndex + 1 : 0;
    }, 150);
  }
}

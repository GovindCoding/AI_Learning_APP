import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { GlassCardComponent } from '../../components/glass-card/glass-card.component';
import { IconComponent } from '../../components/icon/icon.component';
import { LearningNode } from '../../types';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, IconComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-300">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-borderBg-light dark:border-borderBg-dark gap-4">
        <div>
          <h2 class="text-xl font-bold">Your Curriculum Pathway</h2>
          <p class="text-xs text-slate-400">Complete nodes sequentially, take quizzes, and earn XP to level up.</p>
        </div>
        <div class="flex items-center space-x-6 text-xs text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-neon-emerald shadow-neon-emerald inline-block"></span>
            <span>Completed</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-neon-cyan inline-block"></span>
            <span>In Progress</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span>
            <span>Locked / Pending</span>
          </div>
        </div>
      </div>

      <!-- Timeline Layout -->
      <div class="relative max-w-3xl mx-auto px-4 py-8">
        
        <!-- Continuous Connecting Line -->
        <div class="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 z-0"></div>

        <!-- Dynamic Nodes timeline -->
        <div class="space-y-12 relative z-10">
          @for (node of sortedNodes; track node.id; let index = $index) {
            <div 
              [class]="'flex flex-col md:flex-row items-start relative ' + (index % 2 === 0 ? 'md:flex-row-reverse' : '')"
            >
              
              <!-- Timeline Center Bullet Indicator -->
              <div class="absolute left-[39px] md:left-1/2 top-6 -translate-x-1/2 z-20 flex items-center justify-center">
                <div [class]="'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ' + getNodeStatusBulletClass(node)">
                  @if (isNodeLocked(node)) {
                    <app-icon name="lock" className="w-3.5 h-3.5"></app-icon>
                  } @else if (node.status === 'COMPLETED') {
                    <app-icon name="check-circle" className="w-4 h-4 fill-current"></app-icon>
                  } @else {
                    <span class="text-xs font-bold">{{ node.sequenceOrder }}</span>
                  }
                </div>
              </div>

              <!-- Left/Right empty spacer container for desk alignment -->
              <div class="hidden md:block w-1/2"></div>

              <!-- Content Card Container -->
              <div class="w-full md:w-[calc(50%-40px)] pl-16 md:pl-0">
                <app-glass-card 
                  [hoverGlow]="!isNodeLocked(node)"
                  [customClass]="'transition-all duration-300 relative border ' + 
                    (node.status === 'COMPLETED'
                      ? 'border-neon-emerald/20 hover:border-neon-emerald/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)] '
                      : node.status === 'IN_PROGRESS'
                        ? 'border-neon-cyan/30 hover:border-neon-cyan/50 shadow-[0_4px_20px_rgba(6,182,212,0.08)] '
                        : 'border-borderBg-light dark:border-borderBg-dark ') + 
                    (isNodeLocked(node) ? 'opacity-60 hover:shadow-none' : '')"
                >
                  
                  <!-- Top Row: Difficulty & Time stats -->
                  <div class="flex items-center justify-between mb-3.5">
                    <span [class]="'text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full border ' + 
                      (node.difficulty === 'advanced'
                        ? 'bg-rose-500/10 text-neon-rose border-neon-rose/20'
                        : node.difficulty === 'intermediate'
                          ? 'bg-neon-violet/10 text-neon-violet border-neon-violet/20'
                          : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20')">
                      {{ node.difficulty }}
                    </span>
                    <span class="text-xs text-slate-400 font-medium">
                      {{ node.durationHours }} hours
                    </span>
                  </div>

                  <!-- Title -->
                  <h3 [class]="'font-bold text-lg mb-2 leading-tight ' + (node.status === 'COMPLETED' ? 'text-slate-400 line-through' : '')">
                    {{ node.title }}
                  </h3>
                  
                  <!-- Description -->
                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                    {{ node.description }}
                  </p>

                  <!-- Quiz Scores Shelf -->
                  @if (node.status === 'COMPLETED' && node.quizScore !== undefined) {
                    <div class="mb-4 flex items-center space-x-2 bg-neon-emerald/5 border border-neon-emerald/10 px-3 py-1.5 rounded-xl text-xs text-neon-emerald">
                      <app-icon name="award" className="w-4 h-4"></app-icon>
                      <span>Quiz score: <strong>{{ node.quizScore }}%</strong> (Passed)</span>
                    </div>
                  }

                  <!-- Locked notification banner -->
                  @if (isNodeLocked(node)) {
                    <div class="flex items-center space-x-2 text-[10px] bg-slate-100 dark:bg-slate-900/50 p-2 rounded-xl text-slate-400 mb-2 border border-borderBg-light dark:border-borderBg-dark">
                      <app-icon name="alert-circle" className="w-3.5 h-3.5"></app-icon>
                      <span>Prerequisite node needs completion first.</span>
                    </div>
                  }

                  <!-- Node Actions Row -->
                  @if (!isNodeLocked(node)) {
                    <div class="flex items-center justify-between border-t border-borderBg-light dark:border-borderBg-dark pt-4 mt-2">
                      @if (node.status === 'COMPLETED') {
                        <span class="text-xs text-neon-emerald font-semibold flex items-center gap-1">
                          <app-icon name="check-circle" className="w-3.5 h-3.5"></app-icon> Completed
                        </span>
                      } @else if (node.status === 'IN_PROGRESS') {
                        <button
                          (click)="handleCompleteNode(node.id)"
                          class="text-xs text-neon-emerald hover:underline font-semibold"
                        >
                          Direct Complete
                        </button>
                        <button
                          (click)="navigateTo('modules')"
                          class="flex items-center space-x-1.5 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs font-semibold px-3 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon-cyan"
                        >
                          <span>Take Quiz</span>
                          <app-icon name="chevron-right" className="w-3 h-3"></app-icon>
                        </button>
                      } @else {
                        <button
                          (click)="handleStartNode(node.id)"
                          class="flex items-center space-x-1 text-neon-cyan hover:underline text-xs font-semibold"
                        >
                          <app-icon name="play" className="w-3 h-3 fill-current"></app-icon>
                          <span>Start learning</span>
                        </button>
                      }
                    </div>
                  }

                </app-glass-card>
              </div>

            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class RoadmapPageComponent {
  @Output() setActivePage = new EventEmitter<string>();

  learningService = inject(LearningService);

  get sortedNodes(): LearningNode[] {
    return [...this.learningService.nodes()].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }

  isNodeLocked(node: LearningNode): boolean {
    if (!node.parentNodeId) return false;
    const parent = this.learningService.nodes().find(n => n.id === node.parentNodeId);
    return parent ? parent.status !== 'COMPLETED' : false;
  }

  getNodeStatusBulletClass(node: LearningNode): string {
    const locked = this.isNodeLocked(node);
    if (node.status === 'COMPLETED') {
      return 'bg-neon-emerald/20 text-neon-emerald border-neon-emerald/45 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    }
    if (node.status === 'IN_PROGRESS') {
      return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/45 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse';
    }
    if (!locked) {
      return 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500';
    }
    return 'bg-slate-300 dark:bg-slate-800 text-slate-400 border-slate-400/20';
  }

  async handleStartNode(nodeId: number): Promise<void> {
    await this.learningService.updateNodeStatus(nodeId, 'IN_PROGRESS');
  }

  async handleCompleteNode(nodeId: number): Promise<void> {
    await this.learningService.updateNodeStatus(nodeId, 'COMPLETED');
  }

  navigateTo(page: string): void {
    this.setActivePage.emit(page);
  }
}

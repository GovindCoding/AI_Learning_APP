import { Injectable, signal, inject, PLATFORM_ID, effect, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LearningNode, Tool, NewsArticle, DailyLog, Quiz } from '../types';
import { defaultRoadmapNodes, mockTools, mockNews, mockDailyLogs, mockQuizzes } from '../utils/mock-data';
import { AuthService } from './auth.service';

const API_BASE_URL = 'http://localhost:8080/api/v1';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  readonly nodes = signal<LearningNode[]>([]);
  readonly tools = signal<Tool[]>(mockTools);
  readonly news = signal<NewsArticle[]>(mockNews);
  readonly dailyLogs = signal<DailyLog[]>(mockDailyLogs);
  readonly favorites = signal<number[]>([]);
  readonly bookmarkedNews = signal<number[]>([]);
  readonly loading = signal<boolean>(true);

  constructor() {
    this.initLearningData();

    let lastFetchedUserId: number | null = null;
    // Re-fetch backend data if user changes and is logged in
    effect(() => {
      const user = this.authService.user();
      if (user && isPlatformBrowser(this.platformId)) {
        if (lastFetchedUserId !== user.id) {
          lastFetchedUserId = user.id;
          untracked(() => {
            this.fetchBackendData(user.id);
          });
        }
      }
    });
  }

  private initLearningData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.nodes.set(defaultRoadmapNodes);
      this.loading.set(false);
      return;
    }

    const savedNodes = localStorage.getItem('ai_nodes');
    const savedFavs = localStorage.getItem('ai_favs');
    const savedBookmarks = localStorage.getItem('ai_bookmarks');
    const savedLogs = localStorage.getItem('ai_logs');

    if (savedNodes) {
      try { this.nodes.set(JSON.parse(savedNodes)); }
      catch { this.nodes.set(defaultRoadmapNodes); }
    } else {
      this.nodes.set(defaultRoadmapNodes);
      localStorage.setItem('ai_nodes', JSON.stringify(defaultRoadmapNodes));
    }

    if (savedFavs) {
      try { this.favorites.set(JSON.parse(savedFavs)); } catch {}
    }
    if (savedBookmarks) {
      try { this.bookmarkedNews.set(JSON.parse(savedBookmarks)); } catch {}
    }

    if (savedLogs) {
      try { this.dailyLogs.set(JSON.parse(savedLogs)); }
      catch { this.dailyLogs.set(mockDailyLogs); }
    } else {
      this.dailyLogs.set(mockDailyLogs);
      localStorage.setItem('ai_logs', JSON.stringify(mockDailyLogs));
    }

    this.loading.set(false);
  }

  private async fetchBackendData(userId: number): Promise<void> {
    try {
      const token = localStorage.getItem('ai_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Roadmap
      const rRes = await fetch(`${API_BASE_URL}/learning/roadmap?userId=${userId}`, { headers });
      if (rRes.ok) {
        const rData = await rRes.json();
        if (rData && rData.nodes) {
          this.nodes.set(rData.nodes);
          localStorage.setItem('ai_nodes', JSON.stringify(rData.nodes));
        }
      }

      // Fetch Tools
      const tRes = await fetch(`${API_BASE_URL}/tools`);
      if (tRes.ok) {
        const tData = await tRes.json();
        this.tools.set(tData);
      }

      // Fetch News
      const nRes = await fetch(`${API_BASE_URL}/news`);
      if (nRes.ok) {
        const nData = await nRes.json();
        this.news.set(Array.isArray(nData) ? nData : (nData.content || []));
      }

      // Fetch Favorites
      const favsRes = await fetch(`${API_BASE_URL}/tools/favorites?userId=${userId}`, { headers });
      if (favsRes.ok) {
        const favsData = await favsRes.json();
        this.favorites.set(favsData.map((t: Tool) => t.id));
      }

      // Fetch News Bookmarks
      const bRes = await fetch(`${API_BASE_URL}/news/bookmarks?userId=${userId}`, { headers });
      if (bRes.ok) {
        const bData = await bRes.json();
        this.bookmarkedNews.set(bData.map((na: NewsArticle) => na.id));
      }

      // Fetch Logs
      const logsRes = await fetch(`${API_BASE_URL}/learning/analytics/logs?userId=${userId}`, { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        this.dailyLogs.set(logsData);
      }
    } catch (e) {
      console.warn('Backend server is offline, continuing in simulation mode.', e);
    }
  }

  async generateRoadmap(answers: any): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch(`${API_BASE_URL}/learning/roadmap/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, ...answers })
      });
      if (response.ok) {
        const data = await response.json();
        this.nodes.set(data.nodes);
        localStorage.setItem('ai_nodes', JSON.stringify(data.nodes));
        return;
      }
    } catch (e) {
      console.warn('Backend roadmap generation error, simulating...', e);
    }

    // Simulation
    const simulatedNodes: LearningNode[] = [
      {
        id: 1,
        roadmapId: 1,
        title: 'AI & Machine Learning Fundamentals',
        description: 'Learn core definitions, supervised/unsupervised learning, algorithms, and evaluation metrics.',
        difficulty: 'beginner',
        durationHours: 5,
        status: 'NOT_STARTED',
        sequenceOrder: 1
      },
      {
        id: 2,
        roadmapId: 1,
        title: 'Python & Math Foundations for AI',
        description: 'Master NumPy, Pandas, linear algebra, calculus, and basic probability required for model modeling.',
        difficulty: 'beginner',
        durationHours: 8,
        status: 'NOT_STARTED',
        sequenceOrder: 2
      }
    ];

    const goal = (answers.learningGoal || '').toLowerCase();

    if (goal.includes('gemini') || goal.includes('google')) {
      simulatedNodes.push(
        {
          id: 3,
          roadmapId: 1,
          title: 'Gemini API & Google AI Studio',
          description: 'Master Gemini API integration and build rapid prototypes using Google AI Studio.',
          difficulty: 'beginner',
          durationHours: 6,
          status: 'NOT_STARTED',
          sequenceOrder: 3,
          parentNodeId: 2
        },
        {
          id: 4,
          roadmapId: 1,
          title: 'Prompt Engineering with Gemini',
          description: 'Design complex system instructions, structured JSON schemas, and multi-shot prompts using Gemini.',
          difficulty: 'beginner',
          durationHours: 8,
          status: 'NOT_STARTED',
          sequenceOrder: 4,
          parentNodeId: 3
        },
        {
          id: 5,
          roadmapId: 1,
          title: 'Gemini Multimodal AI (Video, Audio, Images)',
          description: 'Utilize Gemini\'s native multimodal capabilities to analyze and search video, audio, and documents.',
          difficulty: 'intermediate',
          durationHours: 10,
          status: 'NOT_STARTED',
          sequenceOrder: 5,
          parentNodeId: 4
        },
        {
          id: 6,
          roadmapId: 1,
          title: 'RAG with Gemini & Vertex AI Vector Search',
          description: 'Integrate Gemini with Vertex AI Vector Search and vector databases for retrieval-augmented generation.',
          difficulty: 'intermediate',
          durationHours: 12,
          status: 'NOT_STARTED',
          sequenceOrder: 6,
          parentNodeId: 5
        },
        {
          id: 7,
          roadmapId: 1,
          title: 'Gemini SDK Integration & Workflows',
          description: 'Connect Gemini SDK in Python, Java, or JavaScript and set up structured tool calling.',
          difficulty: 'intermediate',
          durationHours: 10,
          status: 'NOT_STARTED',
          sequenceOrder: 7,
          parentNodeId: 6
        },
        {
          id: 8,
          roadmapId: 1,
          title: 'Gemma Open-Source Models',
          description: 'Download, run, and fine-tune Gemma open-source models locally using vLLM or Ollama.',
          difficulty: 'advanced',
          durationHours: 14,
          status: 'NOT_STARTED',
          sequenceOrder: 8,
          parentNodeId: 7
        },
        {
          id: 9,
          roadmapId: 1,
          title: 'Gemini Agents & Tool Calling',
          description: 'Orchestrate autonomous agent networks using Gemini and frameworks like LangGraph and CrewAI.',
          difficulty: 'advanced',
          durationHours: 16,
          status: 'NOT_STARTED',
          sequenceOrder: 9,
          parentNodeId: 8
        },
        {
          id: 10,
          roadmapId: 1,
          title: 'Android AI Integration & Vertex AI Deployment',
          description: 'Embed on-device AI using Gemini Nano on Android, and deploy production endpoints on Google Cloud Vertex AI.',
          difficulty: 'advanced',
          durationHours: 18,
          status: 'NOT_STARTED',
          sequenceOrder: 10,
          parentNodeId: 9
        }
      );
    } else if (goal.includes('generative') || goal.includes('builder') || goal.includes('prompt')) {
      simulatedNodes.push(
        {
          id: 3,
          roadmapId: 1,
          title: 'Introduction to LLMs & Prompt Engineering',
          description: 'Study tokenization, model parameters, zero-shot/few-shot prompting, and chain-of-thought engineering.',
          difficulty: 'intermediate',
          durationHours: 10,
          status: 'NOT_STARTED',
          sequenceOrder: 3,
          parentNodeId: 2
        },
        {
          id: 4,
          roadmapId: 1,
          title: 'Vector Databases & Semantic Search',
          description: 'Learn about embeddings, indexing, and querying vectors in Pinecone, Milvus, and ChromaDB.',
          difficulty: 'intermediate',
          durationHours: 8,
          status: 'NOT_STARTED',
          sequenceOrder: 4,
          parentNodeId: 3
        },
        {
          id: 5,
          roadmapId: 1,
          title: 'Retrieval-Augmented Generation (RAG) Systems',
          description: 'Integrate LLMs with vector stores to create Q&A systems over private knowledge documents.',
          difficulty: 'advanced',
          durationHours: 18,
          status: 'NOT_STARTED',
          sequenceOrder: 5,
          parentNodeId: 4
        },
        {
          id: 6,
          roadmapId: 1,
          title: 'Autonomous AI Agents',
          description: 'Deploy multi-agent teams using CrewAI or LangGraph for autonomous task execution.',
          difficulty: 'advanced',
          durationHours: 15,
          status: 'NOT_STARTED',
          sequenceOrder: 6,
          parentNodeId: 5
        }
      );
    } else {
      simulatedNodes.push(
        {
          id: 3,
          roadmapId: 1,
          title: 'Deep Learning & Neural Networks',
          description: 'Understand perceptrons, backpropagation, activation functions, and training with PyTorch.',
          difficulty: 'intermediate',
          durationHours: 15,
          status: 'NOT_STARTED',
          sequenceOrder: 3,
          parentNodeId: 2
        },
        {
          id: 4,
          roadmapId: 1,
          title: 'Model Deployment & MLOps',
          description: 'Learn to track experiments (MLflow), containerize models (Docker), and deploy to AWS/GCP.',
          difficulty: 'advanced',
          durationHours: 20,
          status: 'NOT_STARTED',
          sequenceOrder: 4,
          parentNodeId: 3
        }
      );
    }

    this.nodes.set(simulatedNodes);
    localStorage.setItem('ai_nodes', JSON.stringify(simulatedNodes));
  }

  async updateNodeStatus(nodeId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch(`${API_BASE_URL}/learning/node/${nodeId}/status?userId=${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const rRes = await fetch(`${API_BASE_URL}/learning/roadmap?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (rRes.ok) {
          const rData = await rRes.json();
          this.nodes.set(rData.nodes);
          localStorage.setItem('ai_nodes', JSON.stringify(rData.nodes));
        }
        return;
      }
    } catch (e) {
      console.warn('Backend node update status error, simulating...', e);
    }

    // Simulated update
    const currentNodes = this.nodes();
    const updated = currentNodes.map(node => {
      if (node.id === nodeId) {
        const prevStatus = node.status;
        const updatedNode = { ...node, status };
        if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
          updatedNode.completedAt = new Date().toISOString();
          this.authService.gainXp(200);

          const todayStr = new Date().toISOString().split('T')[0];
          const prevLogs = this.dailyLogs();
          const existing = prevLogs.find(l => l.logDate === todayStr);
          let nextLogs: DailyLog[];

          if (existing) {
            nextLogs = prevLogs.map(l => l.logDate === todayStr ? {
              ...l,
              hoursLearned: l.hoursLearned + node.durationHours,
              nodesCompleted: l.nodesCompleted + 1,
              xpGained: l.xpGained + 200
            } : l);
          } else {
            nextLogs = [...prevLogs, {
              id: prevLogs.length + 1,
              userId: user.id,
              logDate: todayStr,
              hoursLearned: node.durationHours,
              nodesCompleted: 1,
              xpGained: 200,
              notes: `Completed: ${node.title}`
            }];
          }
          this.dailyLogs.set(nextLogs);
          localStorage.setItem('ai_logs', JSON.stringify(nextLogs));
        }
        return updatedNode;
      }
      return node;
    });

    this.nodes.set(updated);
    localStorage.setItem('ai_nodes', JSON.stringify(updated));
  }

  async getQuizzesForNode(nodeId: number): Promise<Quiz[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/learning/node/${nodeId}/quiz`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend quiz retrieval error, falling back to mock quizzes.', e);
    }

    return mockQuizzes[nodeId] || [
      {
        id: 999,
        nodeId,
        question: 'What is a typical challenge when building systems using Large Language Models?',
        optionA: 'Model weights are written in binary format.',
        optionB: 'Hallucinations and lack of real-time factual grounding.',
        optionC: 'High-speed loading of CPU memories.',
        optionD: 'Lack of support for standard English syntax.',
        correctOption: 'B'
      }
    ];
  }

  async submitQuiz(nodeId: number, answers: Record<number, string>): Promise<{ score: number; passed: boolean; xpGained: number }> {
    const user = this.authService.user();
    if (!user) return { score: 0, passed: false, xpGained: 0 };

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch(`${API_BASE_URL}/learning/node/${nodeId}/quiz/submit?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.passed) {
          this.authService.gainXp(300);
          const rRes = await fetch(`${API_BASE_URL}/learning/roadmap?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            this.nodes.set(rData.nodes);
            localStorage.setItem('ai_nodes', JSON.stringify(rData.nodes));
          }
        }
        return { score: data.score, passed: data.passed, xpGained: data.passed ? 300 : 0 };
      }
    } catch (e) {
      console.warn('Backend quiz submit error, simulating...', e);
    }

    // Simulated quiz scoring
    const quizzes = mockQuizzes[nodeId] || [];
    let correct = 0;

    quizzes.forEach(q => {
      const answer = answers[q.id];
      if (answer && answer === q.correctOption) {
        correct++;
      }
    });

    const score = quizzes.length > 0 ? Math.round((correct / quizzes.length) * 100) : 100;
    const passed = score >= 70;
    const xpGained = passed ? 300 : 0;

    if (passed) {
      await this.authService.gainXp(xpGained);

      const currentNodes = this.nodes();
      const updatedNodes = currentNodes.map(n => {
        if (n.id === nodeId) {
          const wasCompleted = n.status === 'COMPLETED';
          const completedAt = wasCompleted ? n.completedAt : new Date().toISOString();

          if (!wasCompleted) {
            const todayStr = new Date().toISOString().split('T')[0];
            const prevLogs = this.dailyLogs();
            const existing = prevLogs.find(l => l.logDate === todayStr);
            let nextLogs: DailyLog[];

            if (existing) {
              nextLogs = prevLogs.map(l => l.logDate === todayStr ? {
                ...l,
                nodesCompleted: l.nodesCompleted + 1,
                xpGained: l.xpGained + 300
              } : l);
            } else {
              nextLogs = [...prevLogs, {
                id: prevLogs.length + 1,
                userId: user.id,
                logDate: todayStr,
                hoursLearned: n.durationHours,
                nodesCompleted: 1,
                xpGained: 300,
                notes: `Passed Quiz & Completed: ${n.title}`
              }];
            }
            this.dailyLogs.set(nextLogs);
            localStorage.setItem('ai_logs', JSON.stringify(nextLogs));
          }

          return { ...n, status: 'COMPLETED' as const, quizScore: score, completedAt };
        }
        return n;
      });

      this.nodes.set(updatedNodes);
      localStorage.setItem('ai_nodes', JSON.stringify(updatedNodes));
    }

    return { score, passed, xpGained };
  }

  async toggleToolFavorite(toolId: number): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch(`${API_BASE_URL}/tools/${toolId}/favorite?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.favorited) {
          this.favorites.update(prev => {
            const next = [...prev, toolId];
            localStorage.setItem('ai_favs', JSON.stringify(next));
            return next;
          });
        } else {
          this.favorites.update(prev => {
            const next = prev.filter(id => id !== toolId);
            localStorage.setItem('ai_favs', JSON.stringify(next));
            return next;
          });
        }
        return;
      }
    } catch (e) {
      console.warn('Backend favorite error, simulating...', e);
    }

    this.favorites.update(prev => {
      const exists = prev.includes(toolId);
      const next = exists ? prev.filter(id => id !== toolId) : [...prev, toolId];
      localStorage.setItem('ai_favs', JSON.stringify(next));
      return next;
    });
  }

  async toggleNewsBookmark(newsId: number): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch(`${API_BASE_URL}/news/${newsId}/bookmark?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.bookmarked) {
          this.bookmarkedNews.update(prev => {
            const next = [...prev, newsId];
            localStorage.setItem('ai_bookmarks', JSON.stringify(next));
            return next;
          });
        } else {
          this.bookmarkedNews.update(prev => {
            const next = prev.filter(id => id !== newsId);
            localStorage.setItem('ai_bookmarks', JSON.stringify(next));
            return next;
          });
        }
        return;
      }
    } catch (e) {
      console.warn('Backend bookmark news error, simulating...', e);
    }

    this.bookmarkedNews.update(prev => {
      const exists = prev.includes(newsId);
      const next = exists ? prev.filter(id => id !== newsId) : [...prev, newsId];
      localStorage.setItem('ai_bookmarks', JSON.stringify(next));
      return next;
    });
  }

  async addCustomRoadmapNode(title: string, description: string, difficulty: string, durationHours: number): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    try {
      const token = localStorage.getItem('ai_token');
      const response = await fetch(`${API_BASE_URL}/learning/roadmap/custom-node`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, title, description, difficulty, durationHours })
      });
      if (response.ok) {
        const data = await response.json();
        this.nodes.set(data.nodes);
        localStorage.setItem('ai_nodes', JSON.stringify(data.nodes));
        return;
      }
    } catch (e) {
      console.warn('Backend custom-node creation error, simulating...', e);
    }

    this.nodes.update(prev => {
      const nextId = prev.length > 0 ? Math.max(...prev.map(n => n.id)) + 1 : 1;
      const sequenceOrder = prev.length > 0 ? Math.max(...prev.map(n => n.sequenceOrder)) + 1 : 1;
      const newNode: LearningNode = {
        id: nextId,
        roadmapId: 1,
        title,
        description,
        difficulty,
        durationHours,
        status: 'NOT_STARTED',
        sequenceOrder
      };
      const next = [...prev, newNode];
      localStorage.setItem('ai_nodes', JSON.stringify(next));
      return next;
    });
  }

  getAnalyticsSummary(): {
    totalHours: number;
    completedNodesCount: number;
    totalNodesCount: number;
    progressPercentage: number;
    totalXpGained: number;
    weeklyDistribution: Record<string, number>;
    aiReadinessScore: number;
  } {
    const currentLogs = this.dailyLogs();
    const currentNodes = this.nodes();

    const totalHours = currentLogs.reduce((acc, log) => acc + log.hoursLearned, 0);
    const totalXpGained = currentLogs.reduce((acc, log) => acc + log.xpGained, 0);
    const completedNodesCount = currentNodes.filter(n => n.status === 'COMPLETED').length;
    const totalNodesCount = currentNodes.length;
    const progressPercentage = totalNodesCount > 0 ? (completedNodesCount / totalNodesCount) * 100 : 0;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyDistribution: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const log = currentLogs.find(l => l.logDate === dateStr);
      weeklyDistribution[dayName] = log ? log.hoursLearned : 0;
    }

    let scoreSum = 0;
    let scoreCount = 0;
    currentNodes.forEach(n => {
      if (n.status === 'COMPLETED') {
        const weight = n.difficulty === 'advanced' ? 3 : n.difficulty === 'intermediate' ? 2 : 1;
        const qScore = n.quizScore || 85;
        scoreSum += qScore * weight;
        scoreCount += weight;
      }
    });
    const aiReadinessScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

    return {
      totalHours,
      completedNodesCount,
      totalNodesCount,
      progressPercentage,
      totalXpGained,
      weeklyDistribution,
      aiReadinessScore
    };
  }
}

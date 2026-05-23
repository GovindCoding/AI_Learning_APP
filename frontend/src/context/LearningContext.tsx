import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LearningNode, Tool, NewsArticle, DailyLog, Quiz } from '../types';
import { defaultRoadmapNodes, mockTools, mockNews, mockDailyLogs, mockQuizzes } from '../utils/mockData';
import { useAuth } from './AuthContext';

interface LearningContextType {
  nodes: LearningNode[];
  tools: Tool[];
  news: NewsArticle[];
  dailyLogs: DailyLog[];
  favorites: number[]; // Tool IDs
  bookmarkedNews: number[]; // News IDs
  loading: boolean;
  generateRoadmap: (answers: any) => Promise<void>;
  updateNodeStatus: (nodeId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => Promise<void>;
  getQuizzesForNode: (nodeId: number) => Promise<Quiz[]>;
  submitQuiz: (nodeId: number, answers: Record<number, string>) => Promise<{ score: number; passed: boolean; xpGained: number }>;
  toggleToolFavorite: (toolId: number) => Promise<void>;
  toggleNewsBookmark: (newsId: number) => Promise<void>;
  addCustomRoadmapNode: (title: string, description: string, difficulty: string, durationHours: number) => Promise<void>;
  getAnalyticsSummary: () => {
    totalHours: number;
    completedNodesCount: number;
    totalNodesCount: number;
    progressPercentage: number;
    totalXpGained: number;
    weeklyDistribution: Record<string, number>;
    aiReadinessScore: number;
  };
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, gainXp } = useAuth();
  

  const [nodes, setNodes] = useState<LearningNode[]>([]);
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(mockDailyLogs);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [bookmarkedNews, setBookmarkedNews] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    const savedNodes = localStorage.getItem('ai_nodes');
    const savedFavs = localStorage.getItem('ai_favs');
    const savedBookmarks = localStorage.getItem('ai_bookmarks');
    const savedLogs = localStorage.getItem('ai_logs');

    if (savedNodes) setNodes(JSON.parse(savedNodes));
    else {
      setNodes(defaultRoadmapNodes);
      localStorage.setItem('ai_nodes', JSON.stringify(defaultRoadmapNodes));
    }

    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedBookmarks) setBookmarkedNews(JSON.parse(savedBookmarks));
    
    if (savedLogs) setDailyLogs(JSON.parse(savedLogs));
    else localStorage.setItem('ai_logs', JSON.stringify(mockDailyLogs));

    setLoading(false);
  }, []);

  // Fetch real backend data if user changes and is logged in
  useEffect(() => {
    if (!user) return;
    
    const fetchBackendData = async () => {
      try {
        const token = localStorage.getItem('ai_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Roadmap
        const rRes = await fetch(`${API_BASE_URL}/learning/roadmap?userId=${user.id}`, { headers });
        if (rRes.ok) {
          const rData = await rRes.json();
          setNodes(rData.nodes);
          localStorage.setItem('ai_nodes', JSON.stringify(rData.nodes));
        }

        // Fetch Tools
        const tRes = await fetch(`${API_BASE_URL}/tools`);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTools(tData);
        }

        // Fetch News
        const nRes = await fetch(`${API_BASE_URL}/news`);
        if (nRes.ok) {
          const nData = await nRes.json();
          setNews(Array.isArray(nData) ? nData : (nData.content || []));
        }

        // Fetch Favorites
        const favsRes = await fetch(`${API_BASE_URL}/tools/favorites?userId=${user.id}`, { headers });
        if (favsRes.ok) {
          const favsData = await favsRes.json();
          setFavorites(favsData.map((t: Tool) => t.id));
        }

        // Fetch News Bookmarks
        const bRes = await fetch(`${API_BASE_URL}/news/bookmarks?userId=${user.id}`, { headers });
        if (bRes.ok) {
          const bData = await bRes.json();
          setBookmarkedNews(bData.map((na: NewsArticle) => na.id));
        }

        // Fetch Logs
        const logsRes = await fetch(`${API_BASE_URL}/learning/analytics/logs?userId=${user.id}`, { headers });
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setDailyLogs(logsData);
        }
      } catch (e) {
        console.warn('Backend server is offline, continuing in simulation mode.', e);
      }
    };

    fetchBackendData();
  }, [user]);

  const generateRoadmap = async (answers: any) => {
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
        setNodes(data.nodes);
        localStorage.setItem('ai_nodes', JSON.stringify(data.nodes));
        return;
      }
    } catch (e) {
      console.warn('Backend roadmap generation error, simulating...', e);
    }

    // Simulation
    // Filter/generate roadmap based on goal
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

    if (answers.learningGoal.toLowerCase().includes('gemini') || answers.learningGoal.toLowerCase().includes('google')) {
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
    } else if (answers.learningGoal.includes('Generative') || answers.learningGoal.includes('Builder') || answers.learningGoal.includes('Prompt')) {
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

    setNodes(simulatedNodes);
    localStorage.setItem('ai_nodes', JSON.stringify(simulatedNodes));
  };

  const updateNodeStatus = async (nodeId: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
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
        // Refresh nodes
        const rRes = await fetch(`${API_BASE_URL}/learning/roadmap?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (rRes.ok) {
          const rData = await rRes.json();
          setNodes(rData.nodes);
          localStorage.setItem('ai_nodes', JSON.stringify(rData.nodes));
        }
        return;
      }
    } catch (e) {
      console.warn('Backend node update status error, simulating...', e);
    }

    // Simulated update
    const updated = nodes.map(node => {
      if (node.id === nodeId) {
        const prevStatus = node.status;
        const updatedNode = { ...node, status };
        if (status === 'COMPLETED' && prevStatus !== 'COMPLETED') {
          updatedNode.completedAt = new Date().toISOString();
          // Update logs and gain XP
          gainXp(200);
          
          const todayStr = new Date().toISOString().split('T')[0];
          setDailyLogs(prevLogs => {
            const existing = prevLogs.find(l => l.logDate === todayStr);
            let nextLogs;
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
            localStorage.setItem('ai_logs', JSON.stringify(nextLogs));
            return nextLogs;
          });
        }
        return updatedNode;
      }
      return node;
    });
    setNodes(updated);
    localStorage.setItem('ai_nodes', JSON.stringify(updated));
  };

  const getQuizzesForNode = async (nodeId: number): Promise<Quiz[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/learning/node/${nodeId}/quiz`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Backend quiz retrieval error, falling back to mock quizzes.', e);
    }

    // Simulated fallback
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
  };

  const submitQuiz = async (nodeId: number, answers: Record<number, string>): Promise<{ score: number; passed: boolean; xpGained: number }> => {
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
        // Sync XP
        if (data.passed) {
          gainXp(300);
          
          // Refresh nodes
          const rRes = await fetch(`${API_BASE_URL}/learning/roadmap?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (rRes.ok) {
            const rData = await rRes.json();
            setNodes(rData.nodes);
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
      await gainXp(xpGained);
      
      const updatedNodes = nodes.map(n => {
        if (n.id === nodeId) {
          const wasCompleted = n.status === 'COMPLETED';
          const completedAt = wasCompleted ? n.completedAt : new Date().toISOString();
          
          if (!wasCompleted) {
            const todayStr = new Date().toISOString().split('T')[0];
            setDailyLogs(prevLogs => {
              const existing = prevLogs.find(l => l.logDate === todayStr);
              let nextLogs;
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
              localStorage.setItem('ai_logs', JSON.stringify(nextLogs));
              return nextLogs;
            });
          }

          return { ...n, status: 'COMPLETED' as const, quizScore: score, completedAt };
        }
        return n;
      });
      setNodes(updatedNodes);
      localStorage.setItem('ai_nodes', JSON.stringify(updatedNodes));
    }

    return { score, passed, xpGained };
  };

  const toggleToolFavorite = async (toolId: number) => {
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
          setFavorites(prev => {
            const next = [...prev, toolId];
            localStorage.setItem('ai_favs', JSON.stringify(next));
            return next;
          });
        } else {
          setFavorites(prev => {
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

    // Simulation
    setFavorites(prev => {
      const exists = prev.includes(toolId);
      let next;
      if (exists) {
        next = prev.filter(id => id !== toolId);
      } else {
        next = [...prev, toolId];
      }
      localStorage.setItem('ai_favs', JSON.stringify(next));
      return next;
    });
  };

  const toggleNewsBookmark = async (newsId: number) => {
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
          setBookmarkedNews(prev => {
            const next = [...prev, newsId];
            localStorage.setItem('ai_bookmarks', JSON.stringify(next));
            return next;
          });
        } else {
          setBookmarkedNews(prev => {
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

    // Simulation
    setBookmarkedNews(prev => {
      const exists = prev.includes(newsId);
      let next;
      if (exists) {
        next = prev.filter(id => id !== newsId);
      } else {
        next = [...prev, newsId];
      }
      localStorage.setItem('ai_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const addCustomRoadmapNode = async (title: string, description: string, difficulty: string, durationHours: number) => {
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
        setNodes(data.nodes);
        localStorage.setItem('ai_nodes', JSON.stringify(data.nodes));
        return;
      }
    } catch (e) {
      console.warn('Backend custom-node creation error, simulating...', e);
    }

    // Simulation fallback
    setNodes(prev => {
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
  };

  const getAnalyticsSummary = () => {
    const totalHours = dailyLogs.reduce((acc, log) => acc + log.hoursLearned, 0);
    const totalXpGained = dailyLogs.reduce((acc, log) => acc + log.xpGained, 0);
    const completedNodesCount = nodes.filter(n => n.status === 'COMPLETED').length;
    const totalNodesCount = nodes.length;
    const progressPercentage = totalNodesCount > 0 ? (completedNodesCount / totalNodesCount) * 100 : 0;

    // Calculate weekly study hours summary (past 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyDistribution: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    
    // Seed past 7 days logs
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.logDate === dateStr);
      weeklyDistribution[dayName] = log ? log.hoursLearned : 0;
    }

    // Dynamic AI Readiness score logic
    let scoreSum = 0;
    let scoreCount = 0;
    nodes.forEach(n => {
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
  };

  return (
    <LearningContext.Provider value={{
      nodes, tools, news, dailyLogs, favorites, bookmarkedNews, loading,
      generateRoadmap, updateNodeStatus, getQuizzesForNode, submitQuiz,
      toggleToolFavorite, toggleNewsBookmark, getAnalyticsSummary, addCustomRoadmapNode
    }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) throw new Error('useLearning must be used within a LearningProvider');
  return context;
};

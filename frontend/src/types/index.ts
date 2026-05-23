export interface Role {
  id: number;
  name: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  iconName: string;
  xpRequirement: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  level: number;
  xp: number;
  streak: number;
  currentStreak: number;
  maxStreak: number;
  onboardingDone: boolean;
  skillLevel?: string;
  background?: string;
  learningGoal?: string;
  hoursPerDay: number;
  learningStyle?: string;
  createdAt: string;
  roles: Role[];
  badges: Badge[];
}

export interface Roadmap {
  id: number;
  userId: number;
  skillLevel: string;
  background: string;
  goal: string;
  targetHoursPerDay: number;
  learningStyle: string;
  estimatedCompletionWeeks: number;
  createdAt: string;
}

export interface LearningNode {
  id: number;
  roadmapId: number;
  title: string;
  description: string;
  difficulty: string; // beginner, intermediate, advanced
  durationHours: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  quizScore?: number;
  completedAt?: string;
  sequenceOrder: number;
  parentNodeId?: number;
}

export interface Quiz {
  id: number;
  nodeId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export interface DailyLog {
  id: number;
  userId: number;
  logDate: string; // YYYY-MM-DD
  hoursLearned: number;
  nodesCompleted: number;
  xpGained: number;
  notes?: string;
}

export interface Tool {
  id: number;
  name: string;
  category: string;
  description: string;
  websiteLink: string;
  chatbotLink?: string;
  playgroundLink?: string;
  apiDocsLink?: string;
  pricing: 'FREE' | 'PAID' | 'FREEMIUM' | 'OPEN_SOURCE';
  features?: string; // Comma separated list
  tags?: string;
  popularityScore: number;
  communityRating: number;
  githubLink?: string;
  createdAt: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  aiSummary?: string;
  source: string;
  category: string;
  publishedDate: string;
  articleLink: string;
  tags?: string;
  createdAt: string;
  
  fullSummary?: string;
  author?: string;
  fetchedAt?: string;
  aiCompany?: string;
  relatedTools?: string;
  sentiment?: string;
  popularityScore?: number;
  trendingScore?: number;
  thumbnailImage?: string;
  articleImage?: string;
  language?: string;
  region?: string;
  aiInsights?: string;
  duplicateHash?: string;
  alternativeReferences?: string;
}

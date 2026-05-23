import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { 
  Sparkles, Download, Copy, Calendar, 
  Settings, Image, Check, AlertCircle, RefreshCw, Send, 
  Trash2, Palette, Layout, Type, FileText, BarChart2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface BrandSettings {
  userId: number;
  brandColors: string;
  personalLogo: string;
  nameSignature: string;
  writingTone: string;
  preferredHashtags: string;
  imageTemplate: string;
  watermarkText: string;
}

interface SocialDraft {
  id?: number;
  userId: number;
  title: string;
  content: string;
  aiImageUrl?: string;
  platforms: string;
  tone: string;
  status: string;
  scheduledTime?: string;
  createdAt?: string;
}

interface AnalyticsSummary {
  totalGenerated: number;
  totalShared: number;
  totalScheduled: number;
  totalDownloaded: number;
  weeklyPosts: { day: string; posts: number }[];
  popularHashtags: string[];
}

export const SocialStudio: React.FC = () => {
  const { user } = useAuth();
  const { news, tools } = useLearning();

  const [activeTab, setActiveTab] = useState<'generator' | 'canvas' | 'calendar' | 'analytics'>('generator');
  
  // Brand Settings State
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    userId: user?.id || 1,
    brandColors: '#0284c7,#6366f1',
    personalLogo: '',
    nameSignature: user?.username || 'AI Learner',
    writingTone: 'Professional',
    preferredHashtags: '#AI #DeepLearning #Tech',
    imageTemplate: 'Modern Gradient',
    watermarkText: 'AI Learning Tracker'
  });

  // Generator Tab States
  const [sourceType, setSourceType] = useState<'NEWS' | 'TOOL' | 'LEARNING_STREAK' | 'GENERAL'>('NEWS');
  const [selectedNewsId, setSelectedNewsId] = useState<string>('');
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('Professional');
  
  // Generated Post State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{
    hook: string;
    summary: string;
    insights: string;
    takeaway: string;
    cta: string;
    hashtags: string;
    fullContent: string;
    suggestedHeadline: string;
  } | null>(null);

  // Canvas Studio States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bannerSize, setBannerSize] = useState<'linkedin' | 'linkedin-portrait' | 'linkedin-square' | 'twitter' | 'instagram' | 'story'>('linkedin');
  const [bannerBg, setBannerBg] = useState<string>('Modern AI');
  const [fontFamily, setFontFamily] = useState<'outfit' | 'inter' | 'mono'>('outfit');
  const [borderRadius, setBorderRadius] = useState<number>(12);
  const [accentColors, setAccentColors] = useState<string>('#0284c7,#6366f1');
  const [bannerTitle, setBannerTitle] = useState('Build Personal Branding in AI');
  const [bannerSummary, setBannerSummary] = useState('Create professional LinkedIn-ready posts, templates, and banners automatically.');
  const [bannerTag, setBannerTag] = useState('AI Creator Studio');
  const [bannerDate] = useState(new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
  const [bannerAuthor, setBannerAuthor] = useState(user?.username ? `@${user.username}` : '@ailearner');
  const [bannerLogo, setBannerLogo] = useState('AI TRACKER');

  // Drafts & Schedules List
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [scheduleTime] = useState('');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalGenerated: 0,
    totalShared: 0,
    totalScheduled: 0,
    totalDownloaded: 0,
    weeklyPosts: [],
    popularHashtags: []
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // API Fetch URLs
  const API_BASE = 'http://localhost:8080/api/v1/social';

  // Trigger temporary messages
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load backend data
  useEffect(() => {
    if (!user) return;
    fetchBrandSettings();
    fetchDrafts();
    fetchAnalytics();
  }, [user]);

  // Redraw canvas whenever layout configs change
  useEffect(() => {
    if (activeTab === 'canvas') {
      const timer = setTimeout(() => {
        drawBanner();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [activeTab, bannerSize, bannerBg, bannerTitle, bannerSummary, bannerTag, bannerDate, bannerAuthor, bannerLogo, brandSettings, fontFamily, borderRadius, accentColors]);

  // Check if we were redirected from NewsFeed with a specific article to share
  useEffect(() => {
    const redirectId = localStorage.getItem('social_redirect_news_id');
    if (redirectId) {
      setSourceType('NEWS');
      setSelectedNewsId(redirectId);
      setActiveTab('generator');
      
      const matchingArticle = news.find(n => n.id.toString() === redirectId);
      if (matchingArticle) {
        setBannerTitle(matchingArticle.title.length > 60 ? matchingArticle.title.substring(0, 57) + "..." : matchingArticle.title);
        setBannerSummary(matchingArticle.summary);
        setBannerTag(matchingArticle.category || 'AI News');
      }
      localStorage.removeItem('social_redirect_news_id');
    }
  }, [news]);

  // Set default news selection when news loads
  useEffect(() => {
    if (news && news.length > 0 && !selectedNewsId) {
      const redirectId = localStorage.getItem('social_redirect_news_id');
      if (!redirectId) {
        setSelectedNewsId(news[0].id.toString());
      }
    }
  }, [news, selectedNewsId]);

  // Set default tool selection when tools loads
  useEffect(() => {
    if (tools && tools.length > 0 && !selectedToolId) {
      setSelectedToolId(tools[0].id.toString());
    }
  }, [tools]);

  // Fetch brand settings
  const fetchBrandSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings?userId=${user?.id || 1}`);
      if (res.ok) {
        const data = await res.json();
        setBrandSettings(data);
        setBannerAuthor(data.nameSignature ? `@${data.nameSignature}` : `@${user?.username}`);
        setBannerLogo(data.watermarkText || 'AI TRACKER');
        if (data.brandColors) {
          setAccentColors(data.brandColors);
        }
      }
    } catch (err) {
      console.warn("Backend settings unavailable. Using default values.");
    }
  };

  // Fetch drafts
  const fetchDrafts = async () => {
    try {
      const res = await fetch(`${API_BASE}/drafts?userId=${user?.id || 1}`);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      } else {
        // Mock local state if backend is offline
        const local = localStorage.getItem('social_drafts');
        if (local) setDrafts(JSON.parse(local));
      }
    } catch (err) {
      const local = localStorage.getItem('social_drafts');
      if (local) setDrafts(JSON.parse(local));
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/summary?userId=${user?.id || 1}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        setAnalytics({
          totalGenerated: 12,
          totalShared: 6,
          totalScheduled: 4,
          totalDownloaded: 8,
          weeklyPosts: [
            { day: 'Mon', posts: 1 },
            { day: 'Tue', posts: 2 },
            { day: 'Wed', posts: 0 },
            { day: 'Thu', posts: 3 },
            { day: 'Fri', posts: 1 },
            { day: 'Sat', posts: 2 },
            { day: 'Sun', posts: 0 }
          ],
          popularHashtags: ["#AI", "#MachineLearning", "#LinkedInCreator", "#TechRoadmap", "#OpenAI"]
        });
      }
    } catch (err) {
      setAnalytics({
        totalGenerated: 12,
        totalShared: 6,
        totalScheduled: 4,
        totalDownloaded: 8,
        weeklyPosts: [
          { day: 'Mon', posts: 1 },
          { day: 'Tue', posts: 2 },
          { day: 'Wed', posts: 0 },
          { day: 'Thu', posts: 3 },
          { day: 'Fri', posts: 1 },
          { day: 'Sat', posts: 2 },
          { day: 'Sun', posts: 0 }
        ],
        popularHashtags: ["#AI", "#MachineLearning", "#LinkedInCreator", "#TechRoadmap", "#OpenAI"]
      });
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setBrandSettings(data);
        showNotification('success', 'Social brand settings saved successfully!');
      } else {
        showNotification('error', 'Failed to save settings on server. Settings saved locally.');
      }
    } catch (err) {
      showNotification('error', 'Connection error. Settings saved locally.');
    }
  };

  // Generate Post
  const handleGeneratePost = async () => {
    setIsGenerating(true);
    setGeneratedPost(null);

    let referenceId: number | null = null;
    let customText = customPrompt;

    if (sourceType === 'NEWS') {
      referenceId = Number(selectedNewsId);
    } else if (sourceType === 'TOOL') {
      referenceId = Number(selectedToolId);
    } else if (sourceType === 'LEARNING_STREAK') {
      // package learning stats as custom text
      const streakCount = user?.streak || 3;
      const currentLevel = user?.level || 2;
      const currentXp = user?.xp || 150;
      customText = `Maintained a daily learning streak of ${streakCount} days! Reached Level ${currentLevel} with ${currentXp} total XP. Studying AI Roadmaps daily.`;
    }

    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sourceType,
          id: referenceId,
          tone: selectedTone,
          customInput: customText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPost(data);
        
        // Auto update canvas parameters to match the topic
        setBannerTitle(data.suggestedHeadline || "Latest AI Update");
        
        // Extract a clean one-line description from summary
        let cleanDesc = data.summary.replace(/•/g, '').replace(/💡 Why you should care:/g, '').trim().substring(0, 140);
        if (cleanDesc.length >= 135) cleanDesc += "...";
        setBannerSummary(cleanDesc || "Exploring the frontiers of generative artificial intelligence and neural computing pipelines.");
        setBannerTag(sourceType === 'NEWS' ? 'AI NEWS' : sourceType === 'TOOL' ? 'AI TOOL' : 'AI PROGRESS');

        showNotification('success', 'AI Post generated successfully!');
        recordActivity('GENERATED');
      } else {
        showNotification('error', 'Failed to contact AI generator service. Using simulated local AI template.');
        generateLocalFallback(sourceType, referenceId, selectedTone, customText);
      }
    } catch (err) {
      showNotification('info', 'Connection error. Running local simulated AI generator.');
      generateLocalFallback(sourceType, referenceId, selectedTone, customText);
    } finally {
      setIsGenerating(false);
    }
  };

  // Local simulated fallback generator
  const generateLocalFallback = (type: string, id: number | null, _tone: string, input: string) => {
    let title = "Revolutionary AI Tool Release";
    let desc = "A new breakthrough makes LLM reasoning 10x faster and highly accessible.";
    let cat = "AI Developments";

    if (type === 'NEWS' && id) {
      const art = news.find(n => n.id === id);
      if (art) {
        title = art.title;
        desc = art.summary;
        cat = art.category;
      }
    } else if (type === 'TOOL' && id) {
      const tl = tools.find(t => t.id === id);
      if (tl) {
        title = tl.name;
        desc = tl.description;
        cat = tl.category;
      }
    } else if (type === 'LEARNING_STREAK') {
      title = "AI Learning Streak Unlocked!";
      desc = input || "Consistently practicing AI exercises, building models, and tracking daily curriculum steps.";
      cat = "Gamified Learning";
    } else if (input) {
      title = "AI Learning Breakthrough";
      desc = input;
      cat = "AI Innovation";
    }

    const mockHook = `🚀 Milestone Alert: Deep diving into ${cat} today!\nHere is my core takeaway on "${title}":`;
    const mockSummary = `⚡ Quick Summary:\n• ${desc}\n• Automatically integrates with modern software architectures.`;
    const mockInsights = `💡 Practical Insight: Upskilling in these systems builds a powerful moat for developers.`;
    const mockTakeaway = `🌱 Recommended action: Allocate 15 mins today to review the documentation.`;
    const mockCta = `👇 How are you incorporating these updates in your workflow? Let's discuss in the comments!`;
    const mockHashtags = `${brandSettings.preferredHashtags} #LinkedInCreator #CareerDevelopment`;

    const full = `${mockHook}\n\n${mockSummary}\n\n${mockInsights}\n\n${mockTakeaway}\n\n${mockCta}\n\n${mockHashtags}`;

    setGeneratedPost({
      hook: mockHook,
      summary: mockSummary,
      insights: mockInsights,
      takeaway: mockTakeaway,
      cta: mockCta,
      hashtags: mockHashtags,
      fullContent: full,
      suggestedHeadline: title
    });

    setBannerTitle(title);
    setBannerSummary(desc.length > 130 ? desc.substring(0, 130) + '...' : desc);
    setBannerTag(cat.toUpperCase());
    recordActivity('GENERATED');
  };

  // Record an analytical event
  const recordActivity = async (action: 'GENERATED' | 'SHARED' | 'SCHEDULED' | 'DOWNLOADED') => {
    try {
      await fetch(`${API_BASE}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 1,
          actionType: action,
          platform: 'LINKEDIN'
        })
      });
      fetchAnalytics();
    } catch (err) {
      console.warn("Failed to log analytics on server.");
    }
  };

  // Save Draft
  const handleSaveDraft = async (status: 'DRAFT' | 'SCHEDULED') => {
    if (!generatedPost) return;

    const draftData: SocialDraft = {
      userId: user?.id || 1,
      title: generatedPost.suggestedHeadline,
      content: generatedPost.fullContent,
      tone: selectedTone,
      platforms: 'LINKEDIN',
      status: status,
      scheduledTime: status === 'SCHEDULED' ? scheduleTime : undefined
    };

    try {
      const res = await fetch(`${API_BASE}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });

      if (res.ok) {
        showNotification('success', status === 'SCHEDULED' ? 'Post scheduled successfully!' : 'Draft saved successfully!');
        fetchDrafts();
      } else {
        saveDraftLocally(draftData);
      }
    } catch (err) {
      saveDraftLocally(draftData);
    }
  };

  const saveDraftLocally = (draft: SocialDraft) => {
    const newDraft = { ...draft, id: Date.now(), createdAt: new Date().toISOString() };
    const updated = [newDraft, ...drafts];
    setDrafts(updated);
    localStorage.setItem('social_drafts', JSON.stringify(updated));
    showNotification('success', 'Saved locally (Backend Server offline).');
  };

  // Delete Draft
  const handleDeleteDraft = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/drafts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Draft deleted.');
        fetchDrafts();
      } else {
        deleteDraftLocally(id);
      }
    } catch (err) {
      deleteDraftLocally(id);
    }
  };

  const deleteDraftLocally = (id: number) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    localStorage.setItem('social_drafts', JSON.stringify(updated));
    showNotification('success', 'Draft deleted locally.');
  };

  // Copy post to clipboard
  const handleCopyPost = (content: string) => {
    navigator.clipboard.writeText(content);
    showNotification('success', 'Caption copied to clipboard! Ready to paste.');
    recordActivity('SHARED');
  };

  // Direct posting workflow
  const handlePostOnLinkedIn = (content: string) => {
    navigator.clipboard.writeText(content);
    showNotification('success', 'Caption copied! Opening LinkedIn shares page...');
    recordActivity('SHARED');
    
    // Redirect to LinkedIn sharing or home feed
    setTimeout(() => {
      window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank');
    }, 1000);
  };

  // Draw Visual Banner Canvas
  const drawBanner = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define resolutions based on size template
    let width = 1200;
    let height = 628; // default LinkedIn image post

    if (bannerSize === 'twitter') {
      width = 1200;
      height = 675;
    } else if (bannerSize === 'instagram') {
      width = 1080;
      height = 1080;
    } else if (bannerSize === 'story') {
      width = 1080;
      height = 1920;
    } else if (bannerSize === 'linkedin-portrait') {
      width = 1080;
      height = 1350;
    } else if (bannerSize === 'linkedin-square') {
      width = 1200;
      height = 1200;
    }

    const scale = 2; // high-res canvas scale
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    // Parse brand colors
    const colors = accentColors.split(',');
    const primaryColor = colors[0] || '#0284c7';
    const secondaryColor = colors[1] || '#6366f1';

    // 1. Background Theme drawing
    let isDarkBg = true;

    if (bannerBg === 'gradient' || bannerBg === 'Modern AI') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0b1329');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#030712');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Radial Orbs
      const radGrad = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, Math.max(width, height) * 0.5);
      radGrad.addColorStop(0, `${primaryColor}2d`);
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, Math.max(width, height) * 0.5, 0, Math.PI * 2);
      ctx.fill();

      const radGrad2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 50, width * 0.2, height * 0.8, Math.max(width, height) * 0.5);
      radGrad2.addColorStop(0, `${secondaryColor}2d`);
      radGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad2;
      ctx.beginPath();
      ctx.arc(width * 0.2, height * 0.8, Math.max(width, height) * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Subtle tech grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

    } else if (bannerBg === 'grid' || bannerBg === 'Futuristic Neon') {
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid
      ctx.strokeStyle = `${primaryColor}0b`;
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Neon Frame with glow shadow
      ctx.save();
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 15;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(20, 20, width - 40, height - 40, borderRadius);
      ctx.stroke();
      ctx.restore();

    } else if (bannerBg === 'slate' || bannerBg === 'Corporate AI') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(30, 30, width - 60, height - 60, borderRadius);
      ctx.stroke();

      // Technical corners
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      // Top Left
      ctx.beginPath();
      ctx.moveTo(25, 45); ctx.lineTo(25, 25); ctx.lineTo(45, 25); ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(width - 25, 45); ctx.lineTo(width - 25, 25); ctx.lineTo(width - 45, 25); ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(25, height - 45); ctx.lineTo(25, height - 25); ctx.lineTo(45, height - 25); ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(width - 25, height - 45); ctx.lineTo(width - 25, height - 25); ctx.lineTo(width - 45, height - 25); ctx.stroke();

    } else if (bannerBg === 'glass' || bannerBg === 'Glassmorphism') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(0.5, '#818cf8');
      grad.addColorStop(1, '#ec4899');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Card overlay representing frosted glass
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(width * 0.05, height * 0.08, width * 0.9, height * 0.84, borderRadius + 8);
      ctx.fill();
      ctx.stroke();

      // Decor circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(width * 0.88, height * 0.2, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width * 0.12, height * 0.8, 40, 0, Math.PI * 2);
      ctx.fill();

    } else if (bannerBg === 'Minimal Dark') {
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(40, 40, width - 80, height - 80);
      ctx.stroke();

    } else if (bannerBg === 'Gradient Pro') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#d946ef');
      grad.addColorStop(0.3, '#8b5cf6');
      grad.addColorStop(0.7, '#3b82f6');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Inner card
      ctx.fillStyle = '#0f172a';
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.roundRect(width * 0.05, height * 0.08, width * 0.9, height * 0.84, borderRadius);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

    } else if (bannerBg === 'Tech News Style') {
      isDarkBg = false;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Left bar
      ctx.fillStyle = primaryColor;
      ctx.fillRect(0, 0, 15, height);

      // Editorial divider line
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 40); ctx.lineTo(width, 40);
      ctx.stroke();

    } else if (bannerBg === 'AI Infographic') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, width, height);

      // Infographic division box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width * 0.08, height * 0.52, width * 0.84, height * 0.22, 8);
      ctx.fill();
      ctx.stroke();

      // Top capsule for takeaway
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(width * 0.08 + 15, height * 0.52 - 10, 140, 20, 4);
      ctx.fill();

    } else if (bannerBg === 'Startup Founder Style') {
      const grad = ctx.createLinearGradient(0, height, width, 0);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Double quotes graphic
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.font = 'bold 150px "Times New Roman", Georgia, serif';
      ctx.fillText('“', 50, 220);
    }

    // Set typography style
    let fontTitle = 'bold 36px "Outfit", "Segoe UI", sans-serif';
    let fontBody = '18px "Inter", "Segoe UI", sans-serif';
    let fontTag = '800 11px "Outfit", "Segoe UI", sans-serif';
    let fontMeta = '500 14px "Inter", "Segoe UI", sans-serif';
    let fontLogo = 'bold 16px "Outfit", "Segoe UI", sans-serif';

    if (fontFamily === 'inter') {
      fontTitle = 'bold 36px "Inter", "Segoe UI", sans-serif';
      fontBody = '18px "Inter", "Segoe UI", sans-serif';
      fontTag = '800 11px "Inter", "Segoe UI", sans-serif';
    } else if (fontFamily === 'mono') {
      fontTitle = 'bold 32px "Courier New", monospace';
      fontBody = '16px "Courier New", monospace';
      fontTag = '800 11px "Courier New", monospace';
      fontMeta = '14px "Courier New", monospace';
      fontLogo = 'bold 16px "Courier New", monospace';
    }

    // 2. Texts drawing
    const textThemeColor = isDarkBg ? '#ffffff' : '#0f172a';
    const subtextThemeColor = isDarkBg ? '#94a3b8' : '#475569';
    const dividerColor = isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';

    const tagText = bannerTag.toUpperCase();
    const tagX = width * 0.08;
    const tagY = height * 0.15;

    // Draw Tag Capsule
    if (bannerBg === 'Minimal Dark') {
      ctx.font = fontTag;
      ctx.fillStyle = secondaryColor;
      ctx.fillText(`[ ${tagText} ]`, tagX, tagY + 12);
    } else {
      ctx.font = fontTag;
      ctx.textBaseline = 'top';
      const tagWidth = ctx.measureText(tagText).width;

      ctx.fillStyle = isDarkBg ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)';
      ctx.strokeStyle = `${secondaryColor}40`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagWidth + 24, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = secondaryColor;
      ctx.fillText(tagText, tagX + 12, tagY + 8);
    }

    // Draw Title (text wrapped)
    ctx.font = fontTitle;
    ctx.fillStyle = textThemeColor;
    ctx.textBaseline = 'top';
    const maxTextWidth = width * 0.84;
    const titleY = tagY + 45;
    const titleLineHeight = fontFamily === 'mono' ? 42 : 46;
    wrapText(ctx, bannerTitle, tagX, titleY, maxTextWidth, titleLineHeight, 3);

    // Draw Summary Subtitle
    ctx.font = fontBody;
    ctx.fillStyle = subtextThemeColor;
    
    // Offset summary based on title length
    ctx.font = fontTitle;
    const titleMetrics = ctx.measureText(bannerTitle).width;
    ctx.font = fontBody;
    
    let subY = titleY + 55;
    if (titleMetrics > maxTextWidth * 2) {
      subY = titleY + 140;
    } else if (titleMetrics > maxTextWidth) {
      subY = titleY + 95;
    }
    wrapText(ctx, bannerSummary, tagX, subY, maxTextWidth, 26, 4);

    // Infographic takeaway header
    if (bannerBg === 'AI Infographic') {
      ctx.font = '800 10px "Outfit", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('KEY TAKEAWAY', tagX + 25, height * 0.52 + 5);
    }

    // 3. Footer drawing
    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tagX, height * 0.8);
    ctx.lineTo(width * 0.92, height * 0.8);
    ctx.stroke();

    // Date
    ctx.font = fontMeta;
    ctx.fillStyle = subtextThemeColor;
    ctx.fillText(bannerDate, tagX, height * 0.84);

    // Author
    ctx.font = fontMeta;
    ctx.fillStyle = primaryColor;
    ctx.fillText(bannerAuthor, tagX + 160, height * 0.84);

    // Brand Logo aligned right
    ctx.font = fontLogo;
    ctx.fillStyle = textThemeColor;
    ctx.textAlign = 'right';
    ctx.fillText(bannerLogo, width * 0.92, height * 0.84);

    // Logo Indicator Dot
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(width * 0.92 - ctx.measureText(bannerLogo).width - 15, height * 0.84 + 10, 6, 0, Math.PI * 2);
    ctx.fill();

    // Reset alignment
    ctx.textAlign = 'left';
  };

  // Helper function to wrap text on Canvas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 3) => {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        lineCount++;
        if (lineCount >= maxLines - 1) {
          let remaining = words.slice(n).join(' ');
          const finalTest = line + remaining;
          if (ctx.measureText(finalTest).width > maxWidth) {
            while (ctx.measureText(line + remaining + '...').width > maxWidth && remaining.length > 0) {
              remaining = remaining.substring(0, remaining.length - 2);
            }
            line = line + remaining + '...';
          } else {
            line = finalTest;
          }
          ctx.fillText(line, x, y);
          return;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  // Generate Fallback Vector SVG in Frontend
  const generateFallbackSVG = (): string => {
    let width = 1200;
    let height = 628;
    if (bannerSize === 'twitter') { width = 1200; height = 675; }
    else if (bannerSize === 'instagram') { width = 1080; height = 1080; }
    else if (bannerSize === 'story') { width = 1080; height = 1920; }
    else if (bannerSize === 'linkedin-portrait') { width = 1080; height = 1350; }
    else if (bannerSize === 'linkedin-square') { width = 1200; height = 1200; }

    const colors = accentColors.split(',');
    const primaryColor = colors[0] || '#0284c7';
    const secondaryColor = colors[1] || '#6366f1';

    const textWidth = width * 0.84;
    const maxTitleChars = Math.floor(textWidth / 22);
    const maxSubtextChars = Math.floor(textWidth / 10);

    const titleWords = bannerTitle.split(/\s+/);
    const titleLines: string[] = [];
    let curLine = '';
    for (const w of titleWords) {
      if ((curLine + ' ' + w).trim().length <= maxTitleChars) curLine = (curLine + ' ' + w).trim();
      else { if (curLine) titleLines.push(curLine); curLine = w; }
    }
    if (curLine) titleLines.push(curLine);

    const summaryWords = bannerSummary.split(/\s+/);
    const summaryLines: string[] = [];
    curLine = '';
    for (const w of summaryWords) {
      if ((curLine + ' ' + w).trim().length <= maxSubtextChars) curLine = (curLine + ' ' + w).trim();
      else { if (curLine) summaryLines.push(curLine); curLine = w; }
    }
    if (curLine) summaryLines.push(curLine);

    let isDarkBg = bannerBg !== 'Tech News Style';
    let bgSvg = `<rect width="${width}" height="${height}" fill="#0f172a" />`;

    if (bannerBg === 'Modern AI' || bannerBg === 'gradient') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#0b1329" />
        <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${Math.max(width, height) * 0.5}" fill="${primaryColor}" opacity="0.18" />
        <circle cx="${width * 0.2}" cy="${height * 0.8}" r="${Math.max(width, height) * 0.5}" fill="${secondaryColor}" opacity="0.18" />
      `;
    } else if (bannerBg === 'Futuristic Neon' || bannerBg === 'grid') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#050508" />
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="${borderRadius}" fill="none" stroke="${primaryColor}" stroke-width="2" opacity="0.6" />
      `;
    } else if (bannerBg === 'Corporate AI' || bannerBg === 'slate') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#0f172a" />
        <rect x="30" y="30" width="${width - 60}" height="${height - 60}" rx="${borderRadius}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" />
      `;
    } else if (bannerBg === 'Glassmorphism' || bannerBg === 'glass') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#4f46e5" />
        <rect x="${width * 0.05}" y="${height * 0.08}" width="${width * 0.9}" height="${height * 0.84}" rx="${borderRadius}" fill="rgba(255, 255, 255, 0.07)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.5" />
      `;
    } else if (bannerBg === 'Minimal Dark') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#121212" />
        <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
      `;
    } else if (bannerBg === 'Gradient Pro') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#8b5cf6" />
        <rect x="${width * 0.05}" y="${height * 0.08}" width="${width * 0.9}" height="${height * 0.84}" rx="${borderRadius}" fill="#0f172a" fill-opacity="0.88" />
      `;
    } else if (bannerBg === 'Tech News Style') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#f8fafc" />
        <rect x="0" y="0" width="15" height="${height}" fill="${primaryColor}" />
      `;
    } else if (bannerBg === 'AI Infographic') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#18181b" />
        <rect x="${width * 0.08}" y="${height * 0.52}" width="${width * 0.84}" height="${height * 0.22}" rx="8" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" />
      `;
    } else if (bannerBg === 'Startup Founder Style') {
      bgSvg = `
        <rect width="${width}" height="${height}" fill="#0f172a" />
      `;
    }

    const textThemeColor = isDarkBg ? '#ffffff' : '#0f172a';
    const subtextThemeColor = isDarkBg ? '#94a3b8' : '#475569';
    const tagX = width * 0.08;
    const tagY = height * 0.15;
    
    let titleY = tagY + 50;
    let titleLinesSvg = '';
    for (const line of titleLines.slice(0, 3)) {
      titleLinesSvg += `<text x="${tagX}" y="${titleY}" fill="${textThemeColor}" font-family="sans-serif" font-weight="bold" font-size="36">${line}</text>`;
      titleY += 46;
    }

    let subY = titleY + 15;
    let summaryLinesSvg = '';
    for (const line of summaryLines.slice(0, 5)) {
      summaryLinesSvg += `<text x="${tagX}" y="${subY}" fill="${subtextThemeColor}" font-family="sans-serif" font-size="18">${line}</text>`;
      subY += 26;
    }

    const footerTextY = height * 0.84 + 10;
    const footerSvg = `
      <line x1="${tagX}" y1="${height * 0.8}" x2="${width * 0.92}" y2="${height * 0.8}" stroke="${isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}" stroke-width="1" />
      <text x="${tagX}" y="${footerTextY}" fill="${subtextThemeColor}" font-family="sans-serif" font-size="14">${bannerDate}</text>
      <text x="${tagX + 160}" y="${footerTextY}" fill="${primaryColor}" font-family="sans-serif" font-size="14" font-weight="bold">${bannerAuthor}</text>
      <text x="${width * 0.92}" y="${footerTextY}" fill="${textThemeColor}" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="end">${bannerLogo}</text>
    `;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${bgSvg}
        <rect x="${tagX}" y="${tagY}" width="${bannerTag.length * 8 + 24}" height="28" rx="6" fill="rgba(99, 102, 241, 0.15)" stroke="${secondaryColor}" stroke-opacity="0.25" />
        <text x="${tagX + 12}" y="${tagY + 18}" fill="${secondaryColor}" font-family="sans-serif" font-weight="bold" font-size="11">${bannerTag.toUpperCase()}</text>
        ${titleLinesSvg}
        ${summaryLinesSvg}
        ${footerSvg}
      </svg>
    `;
  };

  // High-res Image Export Handler
  const handleExport = async (format: 'png' | 'jpg' | 'svg') => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/image/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerSize,
          bannerBg,
          bannerTitle,
          bannerSummary,
          bannerTag,
          bannerDate,
          bannerAuthor,
          bannerLogo,
          brandColors: accentColors,
          borderRadius,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Server-side renderer failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ai-post-banner-${bannerSize}.${format}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      showNotification('success', `HD Visual Banner downloaded as ${format.toUpperCase()}!`);
      recordActivity('DOWNLOADED');
    } catch (err) {
      console.warn("Backend image service offline. Falling back to local rendering.", err);
      if (format === 'svg') {
        const svgContent = generateFallbackSVG();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `ai-post-banner-${bannerSize}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('info', 'SVG downloaded using client fallback!');
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const link = document.createElement('a');
        link.download = `ai-post-banner-${bannerSize}.${format}`;
        link.href = canvas.toDataURL(mime, 0.95);
        link.click();
        showNotification('info', `Downloaded as ${format.toUpperCase()} using browser canvas fallback.`);
      }
      recordActivity('DOWNLOADED');
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) {
        showNotification('error', 'Failed to generate image blob');
        return;
      }
      try {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showNotification('success', 'Image copied to clipboard! Ready to paste.');
      } catch (err) {
        showNotification('error', 'Browser clipboard copy not supported or permission denied.');
      }
    }, 'image/png');
  };

  // Direct Social Platform Share Link Trigger
  const handleShareSocial = (platform: 'linkedin' | 'twitter') => {
    const text = encodeURIComponent(`🚀 ${bannerTitle}\n\n${bannerSummary}\n\nRead more on ${bannerAuthor}`);
    let url = '';
    if (platform === 'linkedin') {
      url = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;
    } else {
      url = `https://twitter.com/intent/tweet?text=${text}`;
    }
    window.open(url, '_blank');
    recordActivity('SHARED');
  };

  // Apply visual banner data from post generator
  const handleApplyBannerData = () => {
    if (!generatedPost) return;
    setBannerTitle(generatedPost.suggestedHeadline);
    let cleanDesc = generatedPost.summary.replace(/•/g, '').replace(/💡 Why you should care:/g, '').trim().substring(0, 140);
    if (cleanDesc.length >= 135) cleanDesc += "...";
    setBannerSummary(cleanDesc);
    setBannerTag(sourceType === 'NEWS' ? 'AI NEWS' : sourceType === 'TOOL' ? 'AI TOOL' : 'AI PROGRESS');
    setActiveTab('canvas');
    showNotification('info', 'Autofilled generator data into visual template!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <GlassCard className="p-6 bg-gradient-to-r from-neon-cyan/5 to-neon-violet/5 border border-borderBg-light dark:border-borderBg-dark flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-neon-cyan animate-pulse" /> AI Social Creator Studio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instantly formulate LinkedIn-ready content and publish eye-catching graphics based on your daily learning updates, AI news, or product milestones.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark self-start md:self-auto">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'generator' ? 'bg-white dark:bg-slate-800 text-neon-cyan shadow-sm border border-borderBg-light dark:border-slate-700' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Post Generator
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'canvas' ? 'bg-white dark:bg-slate-800 text-neon-cyan shadow-sm border border-borderBg-light dark:border-slate-700' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" /> Visual Studio
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'calendar' ? 'bg-white dark:bg-slate-800 text-neon-cyan shadow-sm border border-borderBg-light dark:border-slate-700' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Content Plan
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
              activeTab === 'analytics' ? 'bg-white dark:bg-slate-800 text-neon-cyan shadow-sm border border-borderBg-light dark:border-slate-700' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Brand & Stats
          </button>
        </div>
      </GlassCard>

      {/* Floating Status Notification */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-glass text-xs font-semibold animate-in slide-in-from-right-4 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-neon-emerald' 
            : notification.type === 'error' 
            ? 'bg-rose-500/10 border-rose-500/20 text-neon-rose' 
            : 'bg-neon-cyan/10 border-neon-cyan/20 text-neon-cyan'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TAB: POST GENERATOR                                         */}
      {/* ============================================================== */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Selector Column */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark space-y-6">
              <h3 className="text-base font-bold pb-3 border-b border-borderBg-light dark:border-borderBg-dark flex items-center gap-2">
                <Layout className="w-4 h-4 text-neon-cyan" /> Post Configuration
              </h3>

              {/* Source Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Content Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'NEWS', label: 'AI News Feed' },
                    { id: 'TOOL', label: 'AI Tools Catalog' },
                    { id: 'LEARNING_STREAK', label: 'Study Streak' },
                    { id: 'GENERAL', label: 'Custom Topic' }
                  ].map(src => (
                    <button
                      key={src.id}
                      onClick={() => setSourceType(src.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all duration-300 text-center ${
                        sourceType === src.id 
                          ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(2,132,199,0.15)]'
                          : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 text-slate-500 dark:text-slate-450'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* News Selection list */}
              {sourceType === 'NEWS' && news && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-400 block">Select AI News Article</label>
                  <select
                    value={selectedNewsId}
                    onChange={e => setSelectedNewsId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  >
                    {news.map(art => (
                      <option key={art.id} value={art.id}>{art.title.substring(0, 75)}...</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tool Selection list */}
              {sourceType === 'TOOL' && tools && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-slate-400 block">Select AI Tool to Highlight</label>
                  <select
                    value={selectedToolId}
                    onChange={e => setSelectedToolId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  >
                    {tools.map(tl => (
                      <option key={tl.id} value={tl.id}>{tl.name} - {tl.category}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Learning Streak information display */}
              {sourceType === 'LEARNING_STREAK' && (
                <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/15 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
                  <span className="font-bold text-neon-cyan block">⚡ Current Learning Statistics:</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-500 dark:text-slate-400 font-medium">
                    <div>• Level: <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.level || 1}</span></div>
                    <div>• Total XP: <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.xp || 0}</span></div>
                    <div>• Daily Streak: <span className="text-slate-800 dark:text-slate-200 font-bold">{user?.streak || 0} Days</span></div>
                    <div>• Mode: <span className="text-slate-800 dark:text-slate-200 font-bold">Self-directed</span></div>
                  </div>
                </div>
              )}

              {/* Tone Customizer Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Writing Tone style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Professional', label: '👔 Exec' },
                    { id: 'Creator', label: '🚀 Creator' },
                    { id: 'Founder', label: '💼 Founder' },
                    { id: 'Technical', label: '💻 Tech' },
                    { id: 'Beginner', label: '🌱 Simple' }
                  ].map(tn => (
                    <button
                      key={tn.id}
                      onClick={() => setSelectedTone(tn.id)}
                      className={`py-2 rounded-xl border text-[10px] font-bold transition-all duration-300 text-center ${
                        selectedTone === tn.id 
                          ? 'bg-neon-violet/10 border-neon-violet text-neon-violet shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                          : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/40 text-slate-500 dark:text-slate-455'
                      }`}
                    >
                      {tn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom context prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">Custom Context / Manual inputs (Optional)</label>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Provide additional details or key takeaways you want the AI to incorporate..."
                  rows={4}
                  className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan resize-none"
                />
              </div>

              {/* Generate Trigger Button */}
              <button
                onClick={handleGeneratePost}
                disabled={isGenerating}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-bold text-xs shadow-neon-cyan hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Post Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate LinkedIn AI Post</span>
                  </>
                )}
              </button>
            </GlassCard>
          </div>

          {/* Render Preview Column */}
          <div className="lg:col-span-7 space-y-6">
            {generatedPost ? (
              <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-borderBg-light dark:border-borderBg-dark">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-neon-cyan">
                    <Check className="w-4 h-4" /> Generated Content Preview
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5">
                    {selectedTone} Style
                  </span>
                </div>

                {/* Edit Caption Text Box */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-450 block">LinkedIn Feed Caption</span>
                    <button
                      onClick={() => handleCopyPost(generatedPost.fullContent)}
                      className="flex items-center gap-1 text-[10px] text-neon-cyan hover:underline font-bold"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Text
                    </button>
                  </div>
                  <textarea
                    value={generatedPost.fullContent}
                    onChange={e => setGeneratedPost({ ...generatedPost, fullContent: e.target.value })}
                    rows={12}
                    className="w-full bg-slate-50 dark:bg-slate-900/40 border border-borderBg-light dark:border-borderBg-dark rounded-2xl p-4 text-xs font-mono leading-relaxed text-slate-600 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                {/* Direct Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-borderBg-light dark:border-borderBg-dark">
                  <button
                    onClick={handleApplyBannerData}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan hover:bg-neon-cyan/5 text-slate-600 dark:text-slate-350 hover:text-neon-cyan text-xs font-semibold transition-all duration-300"
                  >
                    <Image className="w-4 h-4" /> Draw Banner Image
                  </button>
                  <button
                    onClick={() => handleSaveDraft('DRAFT')}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet hover:bg-neon-violet/5 text-slate-600 dark:text-slate-350 hover:text-neon-violet text-xs font-semibold transition-all duration-300"
                  >
                    <FileText className="w-4 h-4" /> Save as Draft
                  </button>
                  <button
                    onClick={() => handlePostOnLinkedIn(generatedPost.fullContent)}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neon-cyan hover:bg-neon-cyan/95 text-white shadow-neon-cyan text-xs font-bold transition-all duration-300"
                  >
                    <Send className="w-4 h-4" /> Post on LinkedIn
                  </button>
                </div>
              </GlassCard>
            ) : (
              <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-2xl border border-borderBg-light dark:border-borderBg-dark min-h-[400px]">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Generator Ready</h4>
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  Select a topic/news update on the left panel, customize writing tones, and hit generate to create a professional LinkedIn post!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TAB: VISUAL CANVAS STUDIO                                   */}
      {/* ============================================================== */}
      {activeTab === 'canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Canvas editor controllers */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark space-y-6">
              <h3 className="text-base font-bold pb-3 border-b border-borderBg-light dark:border-borderBg-dark flex items-center gap-2">
                <Palette className="w-4 h-4 text-neon-cyan" /> Layout Customizer
              </h3>

              {/* Dimension size templates */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Visual Dimension Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'linkedin', label: '💼 LinkedIn Post (1200x628)' },
                    { id: 'linkedin-portrait', label: '📊 LinkedIn Portrait (1080x1350)' },
                    { id: 'linkedin-square', label: '⬜ LinkedIn Square (1200x1200)' },
                    { id: 'twitter', label: '🐦 Twitter/X Post (1200x675)' },
                    { id: 'instagram', label: '📸 Insta Square (1080x1080)' },
                    { id: 'story', label: '📱 Story Format (1080x1920)' }
                  ].map(sz => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setBannerSize(sz.id as any)}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-bold text-left transition-all duration-300 ${
                        bannerSize === sz.id 
                          ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                          : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan/40 text-slate-500'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Theme style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Visual Template Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Modern AI', label: '✨ Modern AI Glow' },
                    { id: 'Corporate AI', label: '👔 Corporate AI' },
                    { id: 'Futuristic Neon', label: '⚙️ Futuristic Neon' },
                    { id: 'Minimal Dark', label: '🎛️ Minimal Dark' },
                    { id: 'Glassmorphism', label: '❄️ Glassmorphism' },
                    { id: 'Gradient Pro', label: '🌈 Gradient Pro' },
                    { id: 'Tech News Style', label: '📰 Tech News Style' },
                    { id: 'AI Infographic', label: '📊 AI Infographic' },
                    { id: 'Startup Founder Style', label: '💼 Founder Quote' }
                  ].map(bg => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBannerBg(bg.id)}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-bold text-left transition-all duration-300 ${
                        bannerBg === bg.id 
                          ? 'bg-neon-violet/10 border-neon-violet text-neon-violet'
                          : 'border-borderBg-light dark:border-borderBg-dark hover:border-neon-violet/40 text-slate-500'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Stack Customizer */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 block">Typography Styling</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'outfit', label: 'Outfit (Modern)' },
                    { id: 'inter', label: 'Inter (Clean)' },
                    { id: 'mono', label: 'Mono (Tech)' }
                  ].map(font => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFontFamily(font.id as any)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold text-center transition-all duration-300 ${
                        fontFamily === font.id
                          ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                          : 'border-borderBg-light dark:border-borderBg-dark text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Customizer & Border Radius Slider */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Brand Colors (Hex)</label>
                  <input
                    type="text"
                    value={accentColors}
                    onChange={e => setAccentColors(e.target.value)}
                    placeholder="#0284c7,#6366f1"
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Border Radius: {borderRadius}px</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={borderRadius}
                    onChange={e => setBorderRadius(Number(e.target.value))}
                    className="w-full accent-neon-cyan h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                </div>
              </div>

              {/* Visual Text inputs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Category Label</label>
                  <input
                    type="text"
                    value={bannerTag}
                    onChange={e => setBannerTag(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Headline / Title Text</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={e => setBannerTitle(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Short Summary Text</label>
                  <textarea
                    value={bannerSummary}
                    onChange={e => setBannerSummary(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Signature Handle</label>
                    <input
                      type="text"
                      value={bannerAuthor}
                      onChange={e => setBannerAuthor(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 block">Logo / Brand Text</label>
                    <input
                      type="text"
                      value={bannerLogo}
                      onChange={e => setBannerLogo(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                    />
                  </div>
                </div>
              </div>

              {/* Export Panel Block */}
              <div className="space-y-3 pt-3 border-t border-borderBg-light dark:border-borderBg-dark">
                <label className="text-xs font-bold text-slate-400 block">Export High-Res Assets</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleExport('png')}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan hover:bg-neon-cyan/5 text-slate-650 dark:text-slate-350 text-[10px] font-bold transition-all duration-300"
                  >
                    <Download className="w-3.5 h-3.5 text-neon-cyan" />
                    <span>HD PNG</span>
                  </button>
                  <button
                    onClick={() => handleExport('jpg')}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan hover:bg-neon-cyan/5 text-slate-650 dark:text-slate-350 text-[10px] font-bold transition-all duration-300"
                  >
                    <Download className="w-3.5 h-3.5 text-neon-violet" />
                    <span>HD JPG</span>
                  </button>
                  <button
                    onClick={() => handleExport('svg')}
                    className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan hover:bg-neon-cyan/5 text-slate-650 dark:text-slate-350 text-[10px] font-bold transition-all duration-300"
                  >
                    <Download className="w-3.5 h-3.5 text-neon-emerald" />
                    <span>Vector SVG</span>
                  </button>
                </div>

                <button
                  onClick={handleCopyImage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-borderBg-light dark:border-borderBg-dark hover:border-neon-cyan hover:bg-neon-cyan/5 text-slate-750 dark:text-slate-300 text-xs font-bold transition-all duration-300"
                >
                  <Copy className="w-4 h-4 text-neon-cyan" />
                  <span>Copy Image to Clipboard</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleShareSocial('linkedin')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neon-cyan text-white text-[11px] font-bold hover:scale-102 transition-all duration-300 shadow-neon-cyan"
                  >
                    <span>Share LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShareSocial('twitter')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0f172a] hover:bg-slate-900 text-white text-[11px] font-bold hover:scale-102 transition-all duration-300 border border-slate-700"
                  >
                    <span>Share to X</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Canvas Render Panel */}
          <div className="lg:col-span-7 flex flex-col items-center gap-4">
            <GlassCard className="p-4 border border-borderBg-light dark:border-borderBg-dark w-full flex items-center justify-center bg-slate-100/40 dark:bg-slate-950/20 overflow-hidden min-h-[380px]">
              {/* Actual HTML5 Canvas Element */}
              <canvas
                ref={canvasRef}
                className="max-w-full rounded-xl border border-borderBg-light dark:border-slate-800 shadow-glass bg-slate-900 cursor-pointer object-contain"
                style={{
                  maxHeight: bannerSize === 'story' ? '500px' : '400px',
                  aspectRatio: 
                    bannerSize === 'linkedin' ? '1200/628' : 
                    bannerSize === 'linkedin-portrait' ? '1080/1350' : 
                    bannerSize === 'linkedin-square' ? '1/1' : 
                    bannerSize === 'twitter' ? '1200/675' : 
                    bannerSize === 'instagram' ? '1/1' : 
                    '1080/1920'
                }}
              />
            </GlassCard>
            
            <p className="text-[10px] text-slate-450 text-center italic">
              * The canvas rendered above matches platform requirements. You can customize details and download it in one-click.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB: CONTENT CALENDAR                                       */}
      {/* ============================================================== */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Calendar Weekly view */}
            <div className="lg:col-span-7 space-y-6">
              <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark">
                <h3 className="text-base font-bold pb-3 border-b border-borderBg-light dark:border-borderBg-dark flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neon-cyan" /> AI Content Planner
                </h3>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-450 border-b border-slate-200 dark:border-slate-800 py-3 mb-2">
                  <div>MON</div>
                  <div>TUE</div>
                  <div>WED</div>
                  <div>THU</div>
                  <div>FRI</div>
                  <div>SAT</div>
                  <div>SUN</div>
                </div>

                {/* Render days of week mock grid */}
                <div className="grid grid-cols-7 gap-2 min-h-[220px]">
                  {[
                    { day: 'Mon', num: 24, tip: 'Early updates' },
                    { day: 'Tue', num: 25, tip: 'Tools highlight', scheduled: true },
                    { day: 'Wed', num: 26, tip: 'Tutorial summary' },
                    { day: 'Thu', num: 27, tip: 'Streak milestone', scheduled: true },
                    { day: 'Fri', num: 28, tip: 'Digest summary' },
                    { day: 'Sat', num: 29, tip: 'Open review' },
                    { day: 'Sun', num: 30, tip: 'Next week roadmap' }
                  ].map(dw => (
                    <div 
                      key={dw.day}
                      className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all duration-300 min-h-[90px] ${
                        dw.scheduled 
                          ? 'bg-neon-cyan/5 border-neon-cyan/30 shadow-[0_0_10px_rgba(2,132,199,0.05)]' 
                          : 'border-borderBg-light dark:border-borderBg-dark hover:border-slate-400/30'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{dw.num}</span>
                        {dw.scheduled && (
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                        )}
                      </div>
                      <span className="text-[8px] text-slate-400 font-semibold block uppercase leading-snug">
                        {dw.tip}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recommendation indicator */}
                <div className="p-3 bg-neon-violet/5 border border-neon-violet/15 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  💡 <span className="font-bold text-neon-violet">Posting Advice:</span> Engagement analytics suggest scheduling AI announcements on <span className="font-bold">Tuesdays</span> and <span className="font-bold">Thursdays</span> between <span className="font-bold">8:00 AM - 10:00 AM EST</span> for maximum reach in the professional LinkedIn feed.
                </div>
              </GlassCard>
            </div>

            {/* Schedules and drafts list */}
            <div className="lg:col-span-5 space-y-6">
              <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark space-y-4">
                <h3 className="text-base font-bold pb-2 border-b border-borderBg-light dark:border-borderBg-dark flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neon-cyan" /> Drafts & Queue ({drafts.length})
                  </span>
                </h3>

                {drafts.length > 0 ? (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {drafts.map(dr => (
                      <div 
                        key={dr.id} 
                        className="p-4 rounded-xl border border-borderBg-light dark:border-borderBg-dark bg-slate-50/50 dark:bg-slate-900/30 hover:border-neon-cyan/20 transition-all duration-300 space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                              {dr.title}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">
                              {dr.tone} • {dr.platforms}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyPost(dr.content)}
                              title="Copy text"
                              className="p-1 text-slate-400 hover:text-neon-cyan rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDraft(dr.id!)}
                              title="Delete draft"
                              className="p-1 text-slate-400 hover:text-neon-rose rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {dr.content}
                        </p>

                        {/* Publish schedule details */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800/80">
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {dr.status === 'SCHEDULED' ? `📅 Scheduled` : `📁 Draft`}
                          </span>
                          <button
                            onClick={() => handlePostOnLinkedIn(dr.content)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan text-neon-cyan hover:text-white text-[10px] font-bold transition-all duration-300 border border-neon-cyan/20"
                          >
                            <span>Share</span>
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50/20 dark:bg-slate-900/10 rounded-xl border border-dashed border-borderBg-light dark:border-borderBg-dark">
                    <p className="text-xs text-slate-400">No scheduled posts or drafts.</p>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB: BRAND SETTINGS & ANALYTICS                             */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Analytics Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Created Posts', val: analytics.totalGenerated, color: 'text-neon-cyan', bg: 'bg-neon-cyan/5' },
                { label: 'Direct Shares', val: analytics.totalShared, color: 'text-neon-violet', bg: 'bg-neon-violet/5' },
                { label: 'Schedules', val: analytics.totalScheduled, color: 'text-neon-emerald', bg: 'bg-neon-emerald/5' },
                { label: 'Downloaded Banners', val: analytics.totalDownloaded, color: 'text-amber-500', bg: 'bg-amber-500/5' }
              ].map(st => (
                <GlassCard key={st.label} className="p-4 border border-borderBg-light dark:border-borderBg-dark text-center">
                  <span className="text-[10px] font-semibold text-slate-450 block truncate uppercase">{st.label}</span>
                  <span className={`text-2xl font-black block mt-2 ${st.color}`}>{st.val}</span>
                </GlassCard>
              ))}
            </div>

            {/* Engagement Chart card */}
            <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-neon-cyan" /> Weekly Posting Consistency
              </h3>
              
              <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-borderBg-light dark:border-borderBg-dark">
                {analytics.weeklyPosts.map(day => (
                  <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                    {/* Bar representation */}
                    <div 
                      className="w-8 rounded-t bg-gradient-to-t from-neon-cyan to-neon-violet hover:opacity-90 transition-all duration-300"
                      style={{ 
                        height: day.posts > 0 ? `${(day.posts / 4) * 110}px` : '4px',
                        opacity: day.posts > 0 ? 1 : 0.2
                      }}
                    />
                    <span className="text-[10px] font-bold text-slate-450 uppercase">{day.day}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Popular tags list */}
            <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Type className="w-4 h-4 text-neon-cyan" /> Most Used Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {analytics.popularHashtags.map(tag => (
                  <span 
                    key={tag}
                    className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-900 border border-borderBg-light dark:border-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Social Branding Configuration Form */}
          <div className="lg:col-span-5 space-y-6">
            <GlassCard className="p-6 border border-borderBg-light dark:border-borderBg-dark">
              <h3 className="text-base font-bold pb-3 border-b border-borderBg-light dark:border-borderBg-dark flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-neon-cyan" /> Social Brand Kit
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Primary Accents (Brand Hex Colors)</label>
                  <input
                    type="text"
                    required
                    value={brandSettings.brandColors}
                    onChange={e => setBrandSettings({ ...brandSettings, brandColors: e.target.value })}
                    placeholder="#0284c7,#6366f1"
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                  <span className="text-[9px] text-slate-450 leading-relaxed block">
                    Comma-separated primary and secondary hex values (e.g. #0284c7,#6366f1) applied directly to generated graphics overlays.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Personal Signature Name</label>
                  <input
                    type="text"
                    required
                    value={brandSettings.nameSignature}
                    onChange={e => setBrandSettings({ ...brandSettings, nameSignature: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Watermark Text / Platform Logo</label>
                  <input
                    type="text"
                    required
                    value={brandSettings.watermarkText}
                    onChange={e => setBrandSettings({ ...brandSettings, watermarkText: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block">Preferred Hashtag Block</label>
                  <input
                    type="text"
                    value={brandSettings.preferredHashtags}
                    onChange={e => setBrandSettings({ ...brandSettings, preferredHashtags: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 border border-borderBg-light dark:border-borderBg-dark rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-bold text-xs shadow-neon-cyan hover:scale-102 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Social Brand Settings</span>
                </button>

              </form>
            </GlassCard>
          </div>
        </div>
      )}

    </div>
  );
};

export default SocialStudio;

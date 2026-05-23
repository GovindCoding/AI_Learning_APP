import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Badge } from '../types';
import { mockUser, mockBadges } from '../utils/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  submitOnboarding: (answers: {
    skillLevel: string;
    background: string;
    learningGoal: string;
    hoursPerDay: number;
    learningStyle: string;
  }) => Promise<void>;
  gainXp: (amount: number) => Promise<{ leveledUp: boolean; badgesUnlocked: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ai_user');
    const savedToken = localStorage.getItem('ai_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    } else {
      // Seed with default mock user for immediate interactive viewing
      setUser(mockUser);
      setToken('mock-jwt-token-xyz');
      localStorage.setItem('ai_user', JSON.stringify(mockUser));
      localStorage.setItem('ai_token', 'mock-jwt-token-xyz');
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('ai_token', data.token);

        // Fetch user profile from auth-service
        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          localStorage.setItem('ai_user', JSON.stringify(profileData));
          return true;
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, simulating login...', e);
    }

    // Mock Fallback Login
    if (username.trim() && password.length >= 4) {
      const simulatedUser: User = {
        ...mockUser,
        username: username
      };
      setUser(simulatedUser);
      setToken('mock-jwt-token-xyz');
      localStorage.setItem('ai_user', JSON.stringify(simulatedUser));
      localStorage.setItem('ai_token', 'mock-jwt-token-xyz');
      return true;
    }
    return false;
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (response.ok) {
        return true;
      }
    } catch (e) {
      console.warn('Backend unavailable, simulating signup...', e);
    }

    // Mock Fallback Signup
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ai_user');
    localStorage.removeItem('ai_token');
  };

  const submitOnboarding = async (answers: {
    skillLevel: string;
    background: string;
    learningGoal: string;
    hoursPerDay: number;
    learningStyle: string;
  }) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/onboarding`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(answers)
      });
      if (response.ok) {
        const updatedUser = { ...user, ...answers, onboardingDone: true };
        setUser(updatedUser);
        localStorage.setItem('ai_user', JSON.stringify(updatedUser));
        return;
      }
    } catch (e) {
      console.warn('Backend onboarding endpoint error, simulating client side...', e);
    }

    // Simulated update
    const updatedUser: User = {
      ...user,
      ...answers,
      onboardingDone: true
    };
    setUser(updatedUser);
    localStorage.setItem('ai_user', JSON.stringify(updatedUser));
  };

  const gainXp = async (amount: number): Promise<{ leveledUp: boolean; badgesUnlocked: string[] }> => {
    if (!user) return { leveledUp: false, badgesUnlocked: [] };

    try {
      const response = await fetch(`${API_BASE_URL}/users/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xp: amount })
      });
      if (response.ok) {
        const result = await response.json();
        
        // Refetch user profile to sync
        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          localStorage.setItem('ai_user', JSON.stringify(profileData));
          return {
            leveledUp: result.leveledUp,
            badgesUnlocked: result.badgesUnlocked ? ['New Badge Unlocked!'] : []
          };
        }
      }
    } catch (e) {
      console.warn('Backend XP sync error, updating client state...', e);
    }

    // Client-side simulation
    const currentXp = user.xp + amount;
    const newLevel = 1 + Math.floor(currentXp / 1000);
    const leveledUp = newLevel > user.level;

    const newlyUnlockedBadges: Badge[] = [];
    const updatedBadges = [...user.badges];

    mockBadges.forEach(badge => {
      const alreadyEarned = updatedBadges.some(b => b.id === badge.id);
      if (!alreadyEarned && currentXp >= badge.xpRequirement) {
        updatedBadges.push(badge);
        newlyUnlockedBadges.push(badge);
      }
    });

    const updatedUser: User = {
      ...user,
      xp: currentXp,
      level: newLevel,
      badges: updatedBadges
    };

    setUser(updatedUser);
    localStorage.setItem('ai_user', JSON.stringify(updatedUser));

    return {
      leveledUp,
      badgesUnlocked: newlyUnlockedBadges.map(b => b.name)
    };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, submitOnboarding, gainXp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

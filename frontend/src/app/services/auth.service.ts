import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, Badge } from '../types';
import { mockUser, mockBadges } from '../utils/mock-data';

const API_BASE_URL = 'http://localhost:8080/api/v1';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  readonly user = signal<User | null>(null);
  readonly loading = signal<boolean>(true);
  readonly token = signal<string | null>(null);

  constructor() {
    this.initAuth();
  }

  private initAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    const savedUser = localStorage.getItem('ai_user');
    const savedToken = localStorage.getItem('ai_token');
    if (savedUser && savedToken) {
      try {
        this.user.set(JSON.parse(savedUser));
        this.token.set(savedToken);
      } catch {
        this.user.set(mockUser);
        this.token.set('mock-jwt-token-xyz');
      }
    } else {
      // Seed with default mock user for immediate interactive viewing
      this.user.set(mockUser);
      this.token.set('mock-jwt-token-xyz');
      localStorage.setItem('ai_user', JSON.stringify(mockUser));
      localStorage.setItem('ai_token', 'mock-jwt-token-xyz');
    }
    this.loading.set(false);
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        this.token.set(data.token);
        localStorage.setItem('ai_token', data.token);

        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          this.user.set(profileData);
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
      this.user.set(simulatedUser);
      this.token.set('mock-jwt-token-xyz');
      localStorage.setItem('ai_user', JSON.stringify(simulatedUser));
      localStorage.setItem('ai_token', 'mock-jwt-token-xyz');
      return true;
    }
    return false;
  }

  async signup(username: string, email: string, password: string): Promise<boolean> {
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
    return true;
  }

  logout(): void {
    this.user.set(null);
    this.token.set(null);
    localStorage.removeItem('ai_user');
    localStorage.removeItem('ai_token');
  }

  async submitOnboarding(answers: {
    skillLevel: string;
    background: string;
    learningGoal: string;
    hoursPerDay: number;
    learningStyle: string;
  }): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;

    try {
      const token = this.token();
      const response = await fetch(`${API_BASE_URL}/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers)
      });
      if (response.ok) {
        const updatedUser: User = { ...currentUser, ...answers, onboardingDone: true };
        this.user.set(updatedUser);
        localStorage.setItem('ai_user', JSON.stringify(updatedUser));
        return;
      }
    } catch (e) {
      console.warn('Backend onboarding endpoint error, simulating client side...', e);
    }

    // Simulated update
    const updatedUser: User = {
      ...currentUser,
      ...answers,
      onboardingDone: true
    };
    this.user.set(updatedUser);
    localStorage.setItem('ai_user', JSON.stringify(updatedUser));
  }

  async gainXp(amount: number): Promise<{ leveledUp: boolean; badgesUnlocked: string[] }> {
    const currentUser = this.user();
    if (!currentUser) return { leveledUp: false, badgesUnlocked: [] };

    try {
      const token = this.token();
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
        const profileRes = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          this.user.set(profileData);
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
    const currentXp = currentUser.xp + amount;
    const newLevel = 1 + Math.floor(currentXp / 1000);
    const leveledUp = newLevel > currentUser.level;

    const newlyUnlockedBadges: Badge[] = [];
    const updatedBadges = [...currentUser.badges];

    mockBadges.forEach(badge => {
      const alreadyEarned = updatedBadges.some(b => b.id === badge.id);
      if (!alreadyEarned && currentXp >= badge.xpRequirement) {
        updatedBadges.push(badge);
        newlyUnlockedBadges.push(badge);
      }
    });

    const updatedUser: User = {
      ...currentUser,
      xp: currentXp,
      level: newLevel,
      badges: updatedBadges
    };

    this.user.set(updatedUser);
    localStorage.setItem('ai_user', JSON.stringify(updatedUser));

    return {
      leveledUp,
      badgesUnlocked: newlyUnlockedBadges.map(b => b.name)
    };
  }
}

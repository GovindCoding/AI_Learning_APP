import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { LoginComponent } from './components/login/login.component';
import { IconComponent } from './components/icon/icon.component';

// Pages
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RoadmapPageComponent } from './pages/roadmap/roadmap.component';
import { ToolsDirectoryComponent } from './pages/tools-directory/tools-directory.component';
import { NewsFeedComponent } from './pages/news-feed/news-feed.component';
import { GoogleAiHubComponent } from './pages/google-ai-hub/google-ai-hub.component';
import { SocialStudioComponent } from './pages/social-studio/social-studio.component';
import { LearningModulesComponent } from './pages/learning-modules/learning-modules.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { OnboardingComponent } from './pages/onboarding/onboarding.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    SidebarComponent,
    ChatbotComponent,
    LoginComponent,
    IconComponent,
    DashboardComponent,
    RoadmapPageComponent,
    ToolsDirectoryComponent,
    NewsFeedComponent,
    GoogleAiHubComponent,
    SocialStudioComponent,
    LearningModulesComponent,
    ProfileComponent,
    SettingsComponent,
    AdminPanelComponent,
    OnboardingComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  activePage: string = 'dashboard';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const handleLocationChange = () => {
        const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
        if (rawPath === 'ai/google' || rawPath === 'ai/gemini' || rawPath === 'ai/deepmind') {
          this.activePage = 'google-ai';
          localStorage.setItem('google_ai_active_tab', rawPath === 'ai/google' ? 'google' : rawPath === 'ai/gemini' ? 'gemini' : 'deepmind');
        } else if (rawPath === 'news' || rawPath === 'ai-news') {
          this.activePage = 'news';
        } else if (rawPath === 'roadmap') {
          this.activePage = 'roadmap';
        } else if (rawPath === 'tools') {
          this.activePage = 'tools';
        } else if (rawPath === 'social') {
          this.activePage = 'social';
        } else if (rawPath === 'modules') {
          this.activePage = 'modules';
        } else if (rawPath === 'profile') {
          this.activePage = 'profile';
        } else if (rawPath === 'settings') {
          this.activePage = 'settings';
        } else if (rawPath === 'admin') {
          this.activePage = 'admin';
        } else if (rawPath === 'google-ai') {
          this.activePage = 'google-ai';
        } else {
          this.activePage = 'dashboard';
        }
      };

      handleLocationChange();
      window.addEventListener('popstate', handleLocationChange);
    }
  }

  onPageChange(page: string): void {
    this.activePage = page;
    if (isPlatformBrowser(this.platformId)) {
      const targetPath = page === 'dashboard' ? '/' : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }

  getPageTitle(): string {
    switch (this.activePage) {
      case 'dashboard': return 'Learning Dashboard';
      case 'roadmap': return 'AI Curriculum Pathway';
      case 'tools': return 'Centralized AI Tools';
      case 'news': return 'AI Aggregated News Feed';
      case 'google-ai': return 'Google AI Ecosystem Hub';
      case 'social': return 'AI Social Creator Studio';
      case 'modules': return 'Quizzes & Study materials';
      case 'profile': return 'User Progress & Badges';
      case 'settings': return 'System Configuration';
      case 'admin': return 'Catalog Hub Administration';
      default: return 'AI Learning Tracker';
    }
  }
}

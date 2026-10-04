# Frontend Design – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** FED-AS-IS-006  
**Framework:** Angular 22.2.0 (Standalone Components & Signals)  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Frontend Technology Stack & Build Tools

| Layer / Concern | Technology | Version | Purpose in Existing System |
|---|---|---|---|
| **Core Framework** | Angular | `22.2.0` | Modern component framework leveraging standalone components and zoneless-ready primitives. |
| **Language** | TypeScript | `~6.0.2` | Strongly-typed ECMAScript dialect for client contracts, entities, and services. |
| **Build & Bundler** | `@angular/build` (esbuild / Vite) | `22.2.1` | Ultra-fast development server with Vite hot-reloading and esbuild production bundling. |
| **Styling Engine** | Tailwind CSS | `^3.4.19` | Utility-first CSS framework configured with custom dark-mode variables and neon accents. |
| **Icons Library** | `@lucide/angular` / `lucide-angular` | `^1.51.0` | Tree-shakeable SVG icon set for futuristic UI iconography. |
| **PostCSS** | PostCSS, Autoprefixer | `8.5.28` / `10.6.1` | Vendor-prefix generation and CSS preprocessing. |

---

## 2. Directory & Architecture Structure

```text
frontend/src/
├── app/
│   ├── components/
│   │   ├── chatbot/              # Floating AI companion component
│   │   ├── glass-card/           # Reusable glassmorphic UI container
│   │   ├── icon/                 # Generic Lucide SVG icon renderer
│   │   ├── login/                # Modal / embedded authentication form
│   │   ├── navbar/               # Global top navigation with XP, streak, search
│   │   └── sidebar/              # Collapsible main navigation sidebar
│   ├── pages/
│   │   ├── admin-panel/          # System management & platform metrics
│   │   ├── dashboard/            # Learner hub, stats, quick access, daily logs
│   │   ├── google-ai-hub/        # Dedicated Google Gemini & DeepMind ecosystem showcase
│   │   ├── learning-modules/     # Deep-dive study units and reading material
│   │   ├── news-feed/            # Live AI news stream with SSE support & filters
│   │   ├── onboarding/           # Wizard survey for goal setting & roadmap customization
│   │   ├── profile/              # User profile, badge showcases, activity log
│   │   ├── roadmap/              # Interactive hierarchical curriculum tree & quiz modal
│   │   ├── settings/             # User preferences, API configurations, and theme toggles
│   │   ├── social-studio/        # AI post generator & server-rendered image designer
│   │   └── tools-directory/      # Directory of 30+ categorized AI developer tools
│   ├── services/
│   │   ├── auth.service.ts       # JWT token storage, user session signals
│   │   ├── learning.service.ts   # Core business data layer (Signals, API calls, Simulation)
│   │   └── theme.service.ts      # Dark / light theme management
│   ├── types/
│   │   └── index.ts              # Canonical TypeScript interfaces (User, Tool, Node, Quiz, News)
│   ├── utils/
│   │   └── mock-data.ts          # Comprehensive verified offline mock datasets (0 dead links)
│   ├── app.config.ts             # Application routing & provider configurations
│   ├── app.routes.ts             # Route definitions with lazy standalone component loading
│   └── app.ts                    # Root container orchestrating layout and routing sync
├── index.html                    # Root HTML file with Google Fonts preconnection
├── main.ts                       # Angular bootstrap entry point
└── styles.css                    # Tailwind directives and custom CSS glassmorphism classes
```

---

## 3. Page Inventory

| Page Name | Route Path | Component | Primary APIs Invocations | Permissions |
|---|---|---|---|---|
| **Dashboard** | `/dashboard` | `DashboardComponent` | `GET /api/v1/learning/analytics/summary`, `GET /api/v1/users/profile` | Public / Registered |
| **Roadmap** | `/roadmap` | `RoadmapComponent` | `GET /api/v1/learning/roadmap`, `PUT /api/v1/learning/node/{id}/status`, `POST /api/v1/learning/node/{id}/quiz/submit` | Public / Registered |
| **Tools Directory** | `/tools` | `ToolsDirectoryComponent` | `GET /api/v1/tools`, `POST /api/v1/tools/{id}/favorite` | Public / Registered |
| **News Feed** | `/news` | `NewsFeedComponent` | `GET /api/v1/news`, `POST /api/v1/news/{id}/bookmark`, `GET /api/v1/news/stream` (SSE) | Public / Registered |
| **Google AI Hub** | `/google-ai` | `GoogleAiHubComponent` | `GET /api/v1/tools?category=LLMs`, `GET /api/v1/news?company=Google+AI` | Public / Registered |
| **Social Studio** | `/social` | `SocialStudioComponent` | `POST /api/v1/social/generate`, `POST /api/v1/image/render`, `GET /api/v1/social/settings` | Registered (`ROLE_USER`) |
| **Learning Modules** | `/modules` | `LearningModulesComponent` | `GET /api/v1/learning/roadmap` | Public / Registered |
| **Profile** | `/profile` | `ProfileComponent` | `GET /api/v1/users/profile`, `GET /api/v1/users/badges` | Registered (`ROLE_USER`) |
| **Onboarding** | `/onboarding` | `OnboardingComponent` | `POST /api/v1/users/onboarding`, `POST /api/v1/learning/roadmap/generate` | Registered (`ROLE_USER`) |
| **Admin Panel** | `/admin` | `AdminPanelComponent` | `GET /api/v1/learning/analytics/summary` | Admin (`ROLE_ADMIN`) |
| **Settings** | `/settings` | `SettingsComponent` | Local settings persistence / Theme toggle | Public / Registered |

---

## 4. Component Inventory

| Component Name | Selector | File Location | Responsibilities & UI Features |
|---|---|---|---|
| **GlassCardComponent** | `app-glass-card` | `components/glass-card/` | Reusable glassmorphic wrapper card with backdrop blur, borders, hover glow effects, and projection slots. |
| **IconComponent** | `app-icon` | `components/icon/` | Universal icon component resolving 60+ Lucide icons dynamically into crisp SVG markup. |
| **NavbarComponent** | `app-navbar` | `components/navbar/` | Global header displaying user level, XP progress bar, current streak indicator, search trigger, theme switcher, and profile modal. |
| **SidebarComponent** | `app-sidebar` | `components/sidebar/` | Responsive collapsible navigation sidebar with active route highlights, badges, and version info. |
| **ChatBotComponent** | `app-chatbot` | `components/chatbot/` | Floating assistant widget supporting interactive inquiries, contextual quick-replies, and minimize/maximize states. |
| **LoginComponent** | `app-login` | `components/login/` | Modal authentication dialog providing Tabbed Login and Signup forms with real-time field validation. |

---

## 5. State Management & Reactivity Model

State management in the application is implemented using **Angular Signals** inside singleton injectable services, completely eliminating the need for heavy external Redux boilerplate.

### Architecture in `LearningService`:
```typescript
@Injectable({ providedIn: 'root' })
export class LearningService {
  // Writable State Signals
  readonly user = signal<UserProfile>(initialUser);
  readonly roadmap = signal<Roadmap | null>(null);
  readonly nodes = signal<LearningNode[]>([]);
  readonly tools = signal<AITool[]>([]);
  readonly news = signal<NewsArticle[]>([]);
  readonly dailyLogs = signal<DailyLog[]>([]);
  readonly bookmarkedNews = signal<number[]>([]);
  readonly favoritedTools = signal<number[]>([]);

  // Computed Derived Signals
  readonly completedNodes = computed(() => 
    this.nodes().filter(n => n.status === 'COMPLETED').length
  );
  
  readonly overallProgress = computed(() => {
    const total = this.nodes().length;
    return total > 0 ? Math.round((this.completedNodes() / total) * 100) : 0;
  });

  readonly totalStudyHours = computed(() => 
    this.dailyLogs().reduce((acc, log) => acc + log.hoursLearned, 0)
  );
}
```

### Automatic Offline Simulation Mode:
When the Spring Boot microservices backend is not running or unreachable, `fetchBackendData()` catches the network exception:
```typescript
try {
  // Attempt to query Spring Cloud Gateway on port 8080
  const [toolsRes, newsRes] = await Promise.all([
    fetch(`${this.apiUrl}/tools`),
    fetch(`${this.apiUrl}/news`)
  ]);
  // Populate signals from database...
} catch (err) {
  console.warn('Backend server is offline, continuing in simulation mode.', err);
  // Seamlessly populate state signals with verified local mock data and localStorage
}
```
This guarantees 100% application stability and instant interactive responsiveness in all environments.

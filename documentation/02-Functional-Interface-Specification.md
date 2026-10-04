# Functional & Interface Specification (IFS) – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** IFS-AS-IS-002  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Module Overview & Functional Flow Architecture

The AI Learning Tracker is composed of eight modular functional systems that interact across the client interface, API gateway, microservice layer, and relational databases.

```text
[User / Browser]
       │
       ▼
[Angular 22 Standalone UI] (Port 5173 / 80)
       │ HTTP / JSON / SSE
       ▼
[Spring Cloud API Gateway] (Port 8080)
 ├── /api/v1/auth/**, /api/v1/users/**  ──► [Auth Service] (8081) ──► [ai_auth_db]
 ├── /api/v1/learning/**                ──► [Learning Service] (8082) ──► [ai_learning_db]
 ├── /api/v1/tools/**, /news/**, /social/** ──► [Tools & News Service] (8083) ──► [ai_tools_news_db]
 └── /api/v1/image/**                   ──► [Social Image Service] (8084) (Node.js/Sharp)
```

---

## 2. Detailed Module Specifications

### Module 1: Authentication & Onboarding

- **Module Name:** Authentication & User Provisioning
- **Purpose:** Secure identity registration, credential validation, JWT token issuance, and initial learner profiling.
- **Users/Roles:** Anonymous Guests $\to$ Registered Learners (`ROLE_USER`).
- **Entry Points:** 
  - UI: `login.component.ts`, `onboarding.component.ts`
  - REST: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `POST /api/v1/users/onboarding`
- **Functional Flow:**
  ```text
  User fills Signup/Login Form
    ↓
  AuthService (Frontend)
    ↓
  API Gateway (8080)
    ↓
  AuthController (8081)
    ↓
  AuthenticationManager / UserDetailsService
    ↓
  UserRepository (ai_auth_db.users)
    ↓
  JwtUtils generates signed token
    ↓
  Client stores token in localStorage & updates authSignal state
  ```
- **Inputs:**
  - Login: `{ username: string, password: string }`
  - Signup: `{ username: string, email: string, password: string, role?: string[] }`
  - Onboarding: `{ skillLevel: string, background: string, learningGoal: string, hoursPerDay: number, learningStyle: string }`
- **Outputs:**
  - JWT Response: `{ token: string, id: number, username: string, email: string, roles: string[] }`
- **Validations & Rules:**
  - Username & Email uniqueness checked before insertion (`userRepository.existsByUsername()`, `existsByEmail()`).
  - Passwords encoded using BCrypt (`BCryptPasswordEncoder`).
  - Onboarding flags `user.onboardingDone = true`.
- **Database Tables:** `users`, `roles`, `user_roles`.
- **Error Scenarios:**
  - `400 Bad Request`: "Error: Username is already taken!" / "Error: Email is already in use!".
  - `401 Unauthorized`: Bad credentials during login.

---

### Module 2: User Profile & Gamification

- **Module Name:** Gamification & User Reputation Engine
- **Purpose:** Ingest XP increments, automatically promote user levels, evaluate qualification for achievement badges, and present progress stats.
- **Users/Roles:** Authenticated Learners (`ROLE_USER`).
- **Entry Points:**
  - UI: `profile.component.ts`, `navbar.component.ts`
  - REST: `GET /api/v1/users/profile`, `POST /api/v1/users/xp`, `GET /api/v1/users/badges`
- **Functional Flow:**
  ```text
  Action completed (Quiz passed / Node completed)
    ↓
  LearningService.addXp(amount)
    ↓
  POST /api/v1/users/xp
    ↓
  UserController.addXp()
    ↓
  Calculate: currentXp += xpToAdd
  Calculate: newLevel = 1 + floor(currentXp / 1000)
    ↓
  Query: badgeRepository.findEarnedBadges(currentXp)
    ↓
  Attach newly unlocked badges to user.badges set
    ↓
  Save User (ai_auth_db.users) & return updated XP / Level / New Badges
  ```
- **Validations & Rules:**
  - Level promotion trigger: `newLevel > user.getLevel()`.
  - Badge unlock trigger: `badge.xpRequirement <= currentXp` and `badge` not already present in `user_badges`.
- **Database Tables:** `users`, `badges`, `user_badges`.

---

### Module 3: Learning Paths & Roadmap Engine

- **Module Name:** Adaptive Curriculum & Roadmap Generator
- **Purpose:** Build personalized modular learning pathways based on user profile and career goal, track node progress, and support custom node creation.
- **Users/Roles:** Authenticated Learners (`ROLE_USER`).
- **Entry Points:**
  - UI: `roadmap.component.ts`, `learning-modules.component.ts`
  - REST: 
    - `POST /api/v1/learning/roadmap/generate`
    - `GET /api/v1/learning/roadmap?userId={id}`
    - `PUT /api/v1/learning/node/{nodeId}/status?userId={id}`
    - `POST /api/v1/learning/roadmap/custom-node`
- **Functional Flow:**
  ```text
  User clicks "Generate Roadmap" or finishes Onboarding
    ↓
  RoadmapController.generateRoadmap()
    ↓
  RoadmapService.generateRoadmap()
    ↓
  Delete existing Roadmap & associated nodes for userId (Cascade)
    ↓
  Build Node Sequence based on goal:
    - Core Baseline (AI Fundamentals, Python Foundations)
    - Goal Specific Nodes (ML Engineer, Gemini Ecosystem, GenAI, or Generalist)
    ↓
  Save Roadmap & LearningNodes to ai_learning_db
    ↓
  Return Roadmap & Nodes to UI
  ```
- **Inputs:**
  - Generation Payload: `{ userId: number, skillLevel: string, background: string, goal: string, hoursPerDay: number, learningStyle: string }`
  - Status Update: `{ status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" }`
  - Custom Node: `{ userId: number, title: string, description: string, difficulty: string, durationHours: number }`
- **Validations & Business Rules:**
  - When node status transitions to `COMPLETED`:
    - Automatically updates or creates record in `daily_logs` for `LocalDate.now()`.
    - Increments `hoursLearned` by `node.durationHours`.
    - Increments `nodesCompleted` by 1.
    - Increments `xpGained` by +200 XP.
- **Database Tables:** `roadmaps`, `learning_nodes`, `daily_logs`.

---

### Module 4: Assessments & Quizzes

- **Module Name:** Interactive Knowledge Assessment Engine
- **Purpose:** Serve multiple-choice questions for roadmap nodes, evaluate user responses, compute percentage scores, and award completion/XP upon passing.
- **Users/Roles:** Authenticated Learners (`ROLE_USER`).
- **Entry Points:**
  - UI: `roadmap.component.ts` (Modal Knowledge Check)
  - REST:
    - `GET /api/v1/learning/node/{nodeId}/quiz`
    - `POST /api/v1/learning/node/{nodeId}/quiz/submit?userId={id}`
- **Functional Flow:**
  ```text
  User opens Quiz Modal for Node
    ↓
  GET /api/v1/learning/node/{nodeId}/quiz
    ↓
  User selects answers (A, B, C, D) & clicks Submit
    ↓
  POST /api/v1/learning/node/{nodeId}/quiz/submit
    ↓
  RoadmapController grades each submitted option against quiz.correctOption
    ↓
  Calculate scorePercentage = (correctCount / totalQuizzes) * 100
  passed = scorePercentage >= 70
    ↓
  If passed:
    - Update node.quizScore = scorePercentage
    - Update node.status = "COMPLETED"
    - Insert/Update daily_logs with +300 XP and nodesCompleted + 1
  Return result payload { score, correctCount, totalCount, passed, xpGained }
  ```
- **Database Tables:** `quizzes`, `learning_nodes`, `daily_logs`.

---

### Module 5: AI Tools Directory

- **Module Name:** Curated Tools & Frameworks Directory
- **Purpose:** Discover, filter, inspect, and favorite developer tools, LLMs, and AI platforms.
- **Users/Roles:** All Users (`ROLE_USER`, Guests).
- **Entry Points:**
  - UI: `tools-directory.component.ts`
  - REST:
    - `GET /api/v1/tools?category=&pricing=&search=`
    - `GET /api/v1/tools/{id}`
    - `POST /api/v1/tools`
    - `GET /api/v1/tools/favorites?userId={id}`
    - `POST /api/v1/tools/{id}/favorite?userId={id}`
- **Functional Flow:**
  ```text
  User applies category/pricing filter or searches keyword
    ↓
  GET /api/v1/tools?category=...&pricing=...&search=...
    ↓
  ToolController queries ToolRepository
    ↓
  Return List<Tool>
    ↓
  User clicks Favorite icon ──► POST /api/v1/tools/{id}/favorite?userId=...
    ↓
  ToolController toggles bookmark in bookmarks table (itemType = 'TOOL')
  ```
- **Database Tables:** `ai_tools`, `bookmarks`.

---

### Module 6: Real-Time AI News & Ingestion Engine

- **Module Name:** Real-Time AI News Feed & Live Broadcasting
- **Purpose:** Ingest breaking news from external sources, detect duplicates, generate local AI insights, and broadcast updates to connected clients via Server-Sent Events.
- **Users/Roles:** All Users (`ROLE_USER`, Guests).
- **Entry Points:**
  - UI: `news-feed.component.ts`
  - REST / SSE:
    - `GET /api/v1/news?category=&company=&dateRange=&trendingOnly=&search=&page=&size=`
    - `GET /api/v1/news/{id}/summary`
    - `POST /api/v1/news/{id}/bookmark?userId={id}`
    - `POST /api/v1/news/sync`
    - `GET /api/v1/news/stream` (SSE Emitter)
- **Functional Flow:**
  ```text
  Scheduler (@Scheduled every 5m / 15m) or Manual POST /sync
    ↓
  NewsSyncScheduler queries:
    - Hacker News Algolia API (query="AI")
    - arXiv API (cat:cs.AI)
    - Realistic Breaking News Simulation Engine
    ↓
  Deduplication:
    Calculate duplicateHash = "hash_" + hex(normalizedTitle.hashCode())
    If exists in newsArticleRepository:
      - Merge articleLink into existing.alternativeReferences JSON array
      - Boost popularityScore (+0.6) and trendingScore (+1.0)
    Else:
      - Assign company tag (Google AI, DeepMind, Gemini, OpenAI, Anthropic, Meta, etc.)
      - Generate local heuristic AI insights via LocalAISummarizer
      - Save new NewsArticle
    ↓
  NewsSseBroadcaster.broadcastArticle(article) sends event to all active SseEmitters
    ↓
  Connected browser clients receive SSE update and append article to live feed
  ```
- **Database Tables:** `news_articles`, `bookmarks`.

---

### Module 7: AI Social Content Studio & Banner Generator

- **Module Name:** Content Marketing & Visual Post Studio
- **Purpose:** Compose multi-tone social media posts for LinkedIn/Twitter based on AI tools or news, manage post drafts, and dynamically generate high-resolution banner graphics.
- **Users/Roles:** Authenticated Creators (`ROLE_USER`).
- **Entry Points:**
  - UI: `social-studio.component.ts`
  - REST:
    - `POST /api/v1/social/generate`
    - `GET /api/v1/social/settings?userId={id}`
    - `POST /api/v1/social/settings`
    - `GET /api/v1/social/drafts?userId={id}`
    - `POST /api/v1/social/drafts`
    - `DELETE /api/v1/social/drafts/{id}`
    - `GET /api/v1/social/analytics/summary?userId={id}`
    - `POST /api/v1/image/render` (Node.js Social Image Service)
- **Functional Flow:**
  ```text
  User selects news/tool and clicks "Write Social Post"
    ↓
  POST /api/v1/social/generate (with tone: Professional, Creator, Founder, Technical, Beginner)
    ↓
  SocialController generates tailored Hook, Summary, Insights, Takeaways, CTA, and Hashtags
    ↓
  User previews SVG canvas banner or requests high-res raster export
    ↓
  POST /api/v1/image/render (Express + Sharp on 8084)
    ↓
  Node.js compiles dynamic SVG markup with custom fonts, colors, and gradients
    ↓
  Sharp pipeline converts SVG to binary PNG or JPEG buffer
    ↓
  Binary image stream returned to browser for immediate preview or download
  ```
- **Database Tables:** `social_settings`, `social_drafts`, `social_analytics`.
- **External Dependencies:** Node.js `sharp` library.

---

### Module 8: AI Assistant Companion (Chatbot)

- **Module Name:** Conversational AI Guidance Assistant
- **Purpose:** Provide an inline, floating conversational interface to answer learner questions, explain roadmap concepts, and suggest tools.
- **Users/Roles:** All Users (`ROLE_USER`, Guests).
- **Entry Points:**
  - UI: `chatbot.component.ts` (Floating action button in bottom-right corner)
- **Functional Flow:**
  ```text
  User clicks floating chat bubble and types query
    ↓
  ChatBotComponent intercepts prompt
    ↓
  Matches prompt against knowledge heuristics (Gemini, Roadmap, Tools, ML, RAG, Badges)
    ↓
  Generates structured explanation with contextual links and suggested next steps
    ↓
  Displays conversation history in glassmorphism floating window
  ```
- **Implementation Note:** Operates client-side within Angular component with contextual routing triggers (`prefill_social_post`, roadmap nodes).

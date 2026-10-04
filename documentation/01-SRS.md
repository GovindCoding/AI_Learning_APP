# Software Requirements Specification (SRS) – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** SRS-AS-IS-001  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. System Purpose & Scope

The **AI Learning Tracker** is a comprehensive educational, discovery, and productivity web application designed to guide developers, researchers, and tech professionals through modern Artificial Intelligence concepts, tools, and industry breakthroughs. 

The system provides:
1. **Personalized Learning Pathways:** Dynamic career roadmaps tailored to user experience levels, backgrounds, and target goals.
2. **Gamification & Progress Tracking:** Interactive knowledge checks (quizzes), experience points (XP), streak tracking, level progression, and achievement badges.
3. **AI Tools Directory:** Curated, filterable catalog of cutting-edge AI tools, models, APIs, and frameworks with rating and bookmarking support.
4. **Real-Time AI News Feed:** Continuous aggregation, deduplication, categorization, sentiment scoring, and Server-Sent Events (SSE) broadcasting of breaking AI news.
5. **AI Social Content Studio:** Automated multi-tone social post generation and server-side visual banner rendering for LinkedIn and Twitter sharing.
6. **AI Assistant Companion:** Interactive embedded chatbot for contextual Q&A, guidance, and explanations.

---

## 2. User Roles & Personas

| Role Name | Identifier | Implemented Mechanism | Permissions & Capabilities | Evidence | Status |
|---|---|---|---|---|---|
| Registered Learner | `ROLE_USER` | Spring Security Authorities, JWT Claims | Can access dashboard, generate custom roadmaps, take quizzes, mark modules completed, favorite tools, bookmark news, generate social drafts, customize profile. | `Role.java`, `User.java`, `AuthController.java` | Implemented |
| System Administrator | `ROLE_ADMIN` | Spring Security Authorities, JWT Claims | Superuser privileges. Can access administrative overview and metrics. | `Role.java`, `AuthController.java`, `admin-panel.component.ts` | Implemented |
| Anonymous Visitor | N/A (Guest) | Frontend Simulation Mode / Public Gateway | Can browse public landing page, explore tools directory, read news articles, view public roadmap structure in offline/simulation mode. | `learning.service.ts`, `app.routes.ts` | Implemented |

---

## 3. Existing Functional Requirements (FR)

### Module 1: Authentication, Onboarding & User Profile

| Req ID | Requirement Description | Implementation Component | Evidence | Status |
|---|---|---|---|---|
| **FR-001** | User Registration with unique username, email, and BCrypt-hashed password. | `AuthController.registerUser()` | `AuthController.java:63-116` | Implemented |
| **FR-002** | User Authentication returning JWT token with 24-hour validity and user claims. | `AuthController.authenticateUser()` | `AuthController.java:43-60`, `JwtUtils.java` | Implemented |
| **FR-003** | User Onboarding survey capturing skill level, background, target goal, daily hours, and learning style. | `UserController.submitOnboarding()` | `UserController.java:45-56`, `onboarding.component.ts` | Implemented |
| **FR-004** | User Profile inspection exposing XP, level, current streak, max streak, and unlocked badges. | `UserController.getUserProfile()` | `UserController.java:39-43`, `profile.component.ts` | Implemented |
| **FR-005** | Dynamic XP ingestion with automatic level calculation formula ($Level = 1 + \lfloor \frac{XP}{1000} \rfloor$). | `UserController.addXp()` | `UserController.java:58-93` | Implemented |
| **FR-006** | Achievement badge unlocking based on cumulative XP thresholds. | `UserController.addXp()`, `BadgeRepository` | `UserController.java:75-83`, `schema.sql:43-58` | Implemented |

### Module 2: Learning Roadmaps & Progress Tracking

| Req ID | Requirement Description | Implementation Component | Evidence | Status |
|---|---|---|---|---|
| **FR-010** | Automated curriculum generation dynamically customized by target role (ML Engineer, Gemini Expert, Generative AI Engineer, or Generalist). | `RoadmapService.generateRoadmap()` | `RoadmapService.java:23-152` | Implemented |
| **FR-011** | Learning node status lifecycle management (`NOT_STARTED` $\to$ `IN_PROGRESS` $\to$ `COMPLETED`). | `RoadmapController.updateNodeStatus()` | `RoadmapController.java:63-105` | Implemented |
| **FR-012** | Automatic XP awarding upon learning node completion (+200 XP). | `RoadmapController.updateNodeStatus()` | `RoadmapController.java:86` | Implemented |
| **FR-013** | Custom learning node creation dynamically injected into existing active roadmap. | `RoadmapController.addCustomNode()` | `RoadmapController.java:177-213` | Implemented |
| **FR-014** | Multi-choice quiz assessment per learning node with grading algorithm ($\ge 70\%$ passing score required). | `RoadmapController.submitQuizAnswers()` | `RoadmapController.java:113-175` | Implemented |
| **FR-015** | Daily study log tracking for heatmap visualizer, logging hours studied and nodes completed. | `DailyLogRepository`, `RoadmapController` | `RoadmapController.java:80-97`, `daily_logs` table | Implemented |
| **FR-016** | AI readiness score calculation based on completed node difficulty weights and quiz scores. | `AnalyticsController.getAnalyticsSummary()` | `AnalyticsController.java:88-106` | Implemented |

### Module 3: AI Tools Directory

| Req ID | Requirement Description | Implementation Component | Evidence | Status |
|---|---|---|---|---|
| **FR-020** | Filterable catalog of AI tools by category, pricing model, and full-text keyword query. | `ToolController.getAllTools()` | `ToolController.java:25-43` | Implemented |
| **FR-021** | Individual tool detail retrieval including playground, docs, and repository links. | `ToolController.getToolById()` | `ToolController.java:45-50` | Implemented |
| **FR-022** | New tool ingestion / registration endpoint. | `ToolController.createTool()` | `ToolController.java:52-57` | Implemented |
| **FR-023** | User bookmark / favorite toggling for AI tools. | `ToolController.toggleFavorite()` | `ToolController.java:69-85` | Implemented |
| **FR-024** | Fetching user-specific saved tool favorites. | `ToolController.getFavorites()` | `ToolController.java:59-67` | Implemented |

### Module 4: Real-Time AI News & Ingestion

| Req ID | Requirement Description | Implementation Component | Evidence | Status |
|---|---|---|---|---|
| **FR-030** | Paginated, filtered news query by category, company, date range, trending status, and search query. | `NewsController.getNews()` | `NewsController.java:45-105` | Implemented |
| **FR-031** | Automated scheduled news synchronization from Hacker News Algolia API and arXiv cs.AI API. | `NewsSyncScheduler.performSync()` | `NewsSyncScheduler.java:71-178` | Implemented |
| **FR-032** | Title normalization and deduplication hash detection (`hash_<hex>`). | `NewsSyncScheduler.processAndSaveArticle()` | `NewsSyncScheduler.java:188-196` | Implemented |
| **FR-033** | News multi-source coverage merging into `alternative_references` JSON array. | `NewsSyncScheduler.processAndSaveArticle()` | `NewsSyncScheduler.java:293-319` | Implemented |
| **FR-034** | Real-time Server-Sent Events (SSE) broadcasting of newly ingested articles to connected web clients. | `NewsSseBroadcaster.broadcastArticle()` | `NewsSseBroadcaster.java:14-36`, `NewsController.java:184-187` | Implemented |
| **FR-035** | Heuristic AI summary and multi-perspective insights generation (Takeaways, Beginner, Developer impact). | `LocalAISummarizer.generateInsights()` | `LocalAISummarizer.java:13-75` | Implemented |
| **FR-036** | News bookmarking toggle and user saved articles retrieval. | `NewsController.toggleBookmark()` | `NewsController.java:147-172` | Implemented |

### Module 5: AI Social Studio & Banner Generator

| Req ID | Requirement Description | Implementation Component | Evidence | Status |
|---|---|---|---|---|
| **FR-040** | Multi-tone social post generation (Creator, Founder, Technical, Beginner, Professional) adapting to company entities. | `SocialController.generatePost()` | `SocialController.java:157-372` | Implemented |
| **FR-041** | Brand profile settings persistence (colors, signature, default tone, preferred hashtags, watermark). | `SocialController.saveSettings()` | `SocialController.java:51-69` | Implemented |
| **FR-042** | Draft post management with status lifecycle (`DRAFT`, `SCHEDULED`, `PUBLISHED`). | `SocialController.saveDraft()`, `deleteDraft()` | `SocialController.java:78-108` | Implemented |
| **FR-043** | User social marketing activity analytics tracking (Generated, Shared, Scheduled, Downloaded). | `SocialController.recordAnalytics()`, `getAnalyticsSummary()` | `SocialController.java:111-154` | Implemented |
| **FR-044** | Server-side vector SVG rendering and raster conversion (PNG, JPEG) via Node.js + Sharp. | `server.js (social-image-service)` | `server.js:58-379` | Implemented |

---

## 4. Non-Functional Requirements (NFR)

| Req ID | Category | Requirement & Current Characteristic | Evidence | Status |
|---|---|---|---|---|
| **NFR-001** | Performance | Spring Cloud Gateway non-blocking reactive gateway routing on port 8080 with zero-lag routing table. | `GatewayServiceApplication.java`, `application.yml` | Implemented |
| **NFR-002** | Resilience | Frontend simulation mode: When Spring Boot microservices are offline, frontend transparently falls back to local storage and mock datasets with zero crashes. | `learning.service.ts:1649-1658` | Implemented |
| **NFR-003** | Scalability | Database index optimization on heavy lookup columns: `idx_published_date`, `idx_category`, `idx_ai_company`, `idx_trending`, `idx_dup_hash`. | `news_delta.sql:23-28` | Implemented |
| **NFR-004** | Security | Stateless JWT authentication with HMAC-SHA signing, BCrypt password hashing, and role-based endpoint authorization. | `SecurityConfig.java`, `JwtUtils.java` | Implemented |
| **NFR-005** | Portability | Containerization via individual Dockerfiles for each service, orchestration via `docker-compose.yml`, and enterprise deployment via Kubernetes YAMLs (`k8s/`). | `Dockerfile` (all services), `docker-compose.yml`, `k8s/` | Implemented |
| **NFR-006** | Observability | Eureka Service Registry dashboard at `http://localhost:8761` tracking service instance heartbeat and status. | `discovery-server/application.yml` | Implemented |

---

## 5. Existing Business Rules (BR)

| Rule ID | Business Rule Statement | Implementation Location | Evidence |
|---|---|---|---|
| **BR-001** | **Unique Account Identity:** Usernames and email addresses must be globally unique across `ai_auth_db.users`. Duplicate signups are rejected with HTTP 400. | `AuthController.java` | `AuthController.java:64-74` |
| **BR-002** | **Level Progression Formula:** Level strictly equals $1 + \lfloor \frac{\text{Total XP}}{1000} \rfloor$. | `UserController.java` | `UserController.java:66-72` |
| **BR-003** | **Badge Qualification:** Badges are automatically unlocked when a user's total XP reaches or exceeds `xp_requirement`. | `UserController.java` | `UserController.java:75-83` |
| **BR-004** | **Quiz Passing Benchmark:** Quizzes require a minimum score of 70% to mark the associated learning node as `COMPLETED`. | `RoadmapController.java` | `RoadmapController.java:135` |
| **BR-005** | **Node Completion Reward:** Completing a learning node awards 200 XP; passing a node quiz and completing awards 300 XP. | `RoadmapController.java` | `RoadmapController.java:86, 152` |
| **BR-006** | **News Deduplication:** Articles sharing a normalized alphanumeric title hash are treated as identical. Instead of duplicating rows, their alternative links are merged and popularity/trending scores are boosted. | `NewsSyncScheduler.java` | `NewsSyncScheduler.java:291-319` |
| **BR-007** | **Single Roadmap Per User:** A user can have only one active roadmap at a time. Generating a new roadmap deletes the previous instance and cascades to its learning nodes. | `RoadmapService.java` | `RoadmapService.java:26-28` |

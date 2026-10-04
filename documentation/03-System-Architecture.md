# System Architecture – AS-IS Architecture

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** ARCH-AS-IS-003  
**Architecture Style:** Polyglot Distributed Microservices Architecture  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Architecture Style & Classification

Based on empirical source code inspection, the system is classified as a **Polyglot Distributed Microservices Architecture** with a decoupled single-page application frontend.

### Evidence from Implementation:
1. **Independent Deployable Units:** Five separate Spring Boot Maven modules with individual packaging plugins, plus one Node.js microservice (`social-image-service`), and one decoupled Angular frontend (`frontend/`).
2. **Dynamic Service Registry:** Spring Cloud Netflix Eureka (`discovery-server`) running independently on port 8761 to handle service registration and heartbeats.
3. **API Gateway & Reverse Proxy:** Spring Cloud Gateway (`gateway-service`) running on port 8080 providing centralized ingress, CORS policy enforcement, path-based routing, and client load-balancing (`lb://`).
4. **Database-per-Domain Pattern:** Three distinct logical MySQL databases:
   - `ai_auth_db` for identity and gamification
   - `ai_learning_db` for roadmaps, daily study logs, and quizzes
   - `ai_tools_news_db` for tools, news feeds, bookmarks, and social marketing
5. **Polyglot Auxiliary Worker:** A specialized Node.js/Express service utilizing the libvips-backed `sharp` image engine for CPU-intensive vector-to-raster graphic conversions.

---

## 2. System Context Diagram (C4 Level 1)

```mermaid
flowchart TD
    User["Learner / Developer / Researcher\n(Web Browser)"]
    Admin["System Administrator\n(Web Browser)"]
    
    subgraph SystemBoundary["AI Learning Tracker System"]
        AILearningApp["AI Learning Tracker Platform\n(Frontend + Microservices Backend)"]
    end
    
    HackerNews["Hacker News API\n(Algolia Engine)"]
    ArXiv["arXiv API\n(Export OAI/Atom Feed)"]
    Unsplash["Unsplash CDN\n(Image Provider)"]
    
    User -->|"Learns AI, takes quizzes, discovers tools, generates posts"| AILearningApp
    Admin -->|"Monitors platform health & user metrics"| AILearningApp
    
    AILearningApp -->|"Ingests breaking AI stories via HTTP"| HackerNews
    AILearningApp -->|"Fetches computer science AI preprints"| ArXiv
    AILearningApp -->|"Resolves high-resolution photography"| Unsplash
```

---

## 3. Container Diagram (C4 Level 2)

```mermaid
flowchart TB
    Client["Angular 22 Single Page Application\n(Port 5173 Dev / Port 80 Prod)\nStandalone Components, Signals, Lucide"]
    
    Gateway["Spring Cloud Gateway\n(Port 8080)\nReverse Proxy, CORS, Load Balancing"]
    
    Eureka["Eureka Discovery Server\n(Port 8761)\nService Registry & Discovery"]
    
    AuthSvc["Auth Service\n(Port 8081)\nJWT Auth, BCrypt, Profile, XP Gamification"]
    LearningSvc["Learning Service\n(Port 8082)\nAdaptive Roadmaps, Quizzes, Heatmaps"]
    ToolsNewsSvc["Tools & News Service\n(Port 8083)\nCatalog, Scheduled Sync, SSE Stream, Social Engine"]
    ImageSvc["Social Image Service\n(Port 8084)\nNode.js Express + Sharp SVG Renderer"]
    
    subgraph Databases["MySQL 8.0 Database Cluster (Port 3306)"]
        AuthDB[("ai_auth_db\n(users, roles, badges)")]
        LearningDB[("ai_learning_db\n(roadmaps, nodes, quizzes, logs)")]
        ToolsNewsDB[("ai_tools_news_db\n(tools, news, bookmarks, social)")]
    end
    
    Client -->|"HTTP / REST / SSE"| Gateway
    Gateway -->|"Route: /api/v1/auth/**, /users/**"| AuthSvc
    Gateway -->|"Route: /api/v1/learning/**"| LearningSvc
    Gateway -->|"Route: /api/v1/tools/**, /news/**, /social/**"| ToolsNewsSvc
    Gateway -->|"Route: /api/v1/image/**"| ImageSvc
    
    AuthSvc -.->|"Register & Heartbeat"| Eureka
    LearningSvc -.->|"Register & Heartbeat"| Eureka
    ToolsNewsSvc -.->|"Register & Heartbeat"| Eureka
    Gateway -.->|"Discover Routes lb://"| Eureka
    
    AuthSvc -->|"JDBC / JPA"| AuthDB
    LearningSvc -->|"JDBC / JPA"| LearningDB
    ToolsNewsSvc -->|"JDBC / JPA"| ToolsNewsDB
```

---

## 4. Component Diagram: Tools & News Service (C4 Level 3)

```mermaid
flowchart TD
    subgraph ToolsNewsService["Tools & News Service (Port 8083)"]
        TC["ToolController\n(/api/v1/tools)"]
        NC["NewsController\n(/api/v1/news)"]
        SC["SocialController\n(/api/v1/social)"]
        
        NSS["NewsSyncScheduler\n(@Scheduled 5m/15m)"]
        NSB["NewsSseBroadcaster\n(SseEmitter Pool)"]
        LAS["LocalAISummarizer\n(Heuristic Insights)"]
        
        TR["ToolRepository"]
        NR["NewsArticleRepository"]
        BR["BookmarkRepository"]
        SR["SocialDraftRepository"]
        SSR["SocialSettingsRepository"]
        SAR["SocialAnalyticsRepository"]
    end
    
    NC --> NR
    NC --> BR
    NC --> NSS
    NC --> NSB
    NC --> LAS
    
    TC --> TR
    TC --> BR
    
    SC --> SR
    SC --> SSR
    SC --> SAR
    SC --> NR
    SC --> TR
    
    NSS -->|"Writes Articles"| NR
    NSS -->|"Pushes Realtime Events"| NSB
    NSS -->|"Generates Summaries"| LAS
```

---

## 5. Deployment Diagram (Infrastructure & Runtime)

```mermaid
flowchart TB
    subgraph Host["Host Environment (Localhost / Docker / Kubernetes)"]
        
        subgraph WebLayer["Frontend Presentation Layer"]
            FrontendPod["Web Server Container\nNginx / Vite Server\nListening on :5173 / :80"]
        end
        
        subgraph RoutingLayer["API Ingress & Service Mesh"]
            GatewayPod["Gateway Service Container\nSpring Cloud Gateway (Java 21)\nListening on :8080"]
            EurekaPod["Discovery Server Container\nNetflix Eureka (Java 21)\nListening on :8761"]
        end
        
        subgraph AppLayer["Microservice Applications"]
            AuthPod["Auth Service Container\nSpring Boot 3.3.4 (Java 21)\nListening on :8081"]
            LearningPod["Learning Service Container\nSpring Boot 3.3.4 (Java 21)\nListening on :8082"]
            ToolsPod["Tools & News Service Container\nSpring Boot 3.3.4 (Java 21)\nListening on :8083"]
            ImagePod["Social Image Service Container\nNode.js 20 + Sharp\nListening on :8084"]
        end
        
        subgraph DataLayer["Persistence Layer"]
            MySQLPod["MySQL 8.0 Server Container\nListening on :3306\nVolumes: mysql_data"]
        end
    end
    
    FrontendPod --> GatewayPod
    GatewayPod --> EurekaPod
    GatewayPod --> AuthPod
    GatewayPod --> LearningPod
    GatewayPod --> ToolsPod
    GatewayPod --> ImagePod
    
    AuthPod --> MySQLPod
    LearningPod --> MySQLPod
    ToolsPod --> MySQLPod
```

---

## 6. End-to-End Data Flow Diagram (DFD)

### Ingestion & Real-Time Delivery Data Flow
```text
[External News APIs] ──► [NewsSyncScheduler (HTTP GET)]
                                 │
                                 ▼
                     [Deduplication Hash Check]
                                 ├── (Duplicate) ──► Merge alternative links & boost scores
                                 └── (New)       ──► Ingest, tag company, generate AI insights
                                 │
                                 ▼
                     [Save to ai_tools_news_db]
                                 │
                                 ▼
                     [NewsSseBroadcaster]
                                 │ (Server-Sent Event push)
                                 ▼
                     [Connected Angular Browser Clients]
```

### Learning Completion & Gamification Data Flow
```text
[User passes Quiz (>=70%)] ──► [RoadmapController (/quiz/submit)]
                                         │
                                         ▼
                             [Update node.status = 'COMPLETED']
                             [Update daily_logs with +300 XP]
                                         │
                                         ▼
                             [Trigger /api/v1/users/xp (+300)]
                                         │
                                         ▼
                             [Recalculate Level: 1 + floor(XP/1000)]
                             [Evaluate Badge Unlocks]
                                         │
                                         ▼
                             [Save ai_auth_db.users & return Level-Up toast]
```

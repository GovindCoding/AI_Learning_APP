# Backend Design – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** BED-AS-IS-007  
**Runtime:** Java 21 LTS (Eclipse Temurin) & Node.js 20 LTS  
**Frameworks:** Spring Boot 3.3.4, Spring Cloud 2023.0.3, Express 4.x  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Backend Technology Stack & Build System

| Layer / Technology | Specification / Version | File Reference | Purpose in Existing System |
|---|---|---|---|
| **Java Development Kit** | OpenJDK 21 (Temurin) | `backend/pom.xml` (`<java.version>21</java.version>`) | Modern Java runtime supporting virtual threads, records, and pattern matching. |
| **Spring Boot Parent** | `3.3.4` | `backend/pom.xml` | Enterprise application framework for standalone production microservices. |
| **Spring Cloud** | `2023.0.3` (Leyton) | `backend/pom.xml` | Distributed microservice patterns (Eureka, Cloud Gateway, Ribbon load balancing). |
| **Maven Compiler** | `3.13.0` | `backend/pom.xml` | Java compilation targeting Java 21 with `-parameters` flag enabled. |
| **Persistence Provider** | Spring Data JPA / Hibernate | Spring Boot Starter Data JPA | Object-Relational Mapping (ORM) connecting to MySQL 8.0. |
| **Security Framework** | Spring Security 6.x | Spring Boot Starter Security | Stateless filter chain, BCrypt password hashing, and role verification. |
| **Token Specification** | JJWT (`io.jsonwebtoken`) | `0.11.5` | Standard JWT parsing, claim validation, and HMAC-SHA signing. |
| **Vector Engine (Node)** | Sharp / libvips | `sharp ^0.33.x` (`server.js`) | High-speed C-binding image manipulation for SVG to PNG/JPEG rasterization. |

---

## 2. Microservice Module Breakdown

```text
backend/
├── pom.xml                               # Maven multi-module parent POM
├── discovery-server/                     # Port 8761: Netflix Eureka Service Registry
├── gateway-service/                      # Port 8080: Reactive Spring Cloud Gateway
├── auth-service/                         # Port 8081: Identity, JWT & Gamification
├── learning-service/                     # Port 8082: Roadmaps, Quizzes & Study Logs
├── tools-news-service/                   # Port 8083: AI Tools, News Feed & SSE Broadcast
└── social-image-service/                 # Port 8084: Node.js Express + Sharp Image Renderer
```

---

## 3. Detailed Microservice Profiles

### 3.1 Discovery Server (`discovery-server`)
- **Port:** `8761`
- **Application Class:** `DiscoveryServerApplication` annotated with `@EnableEurekaServer`.
- **Configuration (`application.yml`):**
  - `eureka.client.register-with-eureka: false` (Standalone server mode).
  - `eureka.client.fetch-registry: false`.
- **Functionality:** Provides the centralized naming registry where all downstream microservices register their network locations and health status.

### 3.2 Gateway Service (`gateway-service`)
- **Port:** `8080`
- **Application Class:** `GatewayServiceApplication` annotated with `@SpringBootApplication`.
- **Configuration & Routing Rules (`application.yml`):**
  ```yaml
  spring:
    cloud:
      gateway:
        globalcors:
          cors-configurations:
            '[/**]':
              allowedOrigins: "*"
              allowedMethods: [GET, POST, PUT, DELETE, OPTIONS]
              allowedHeaders: "*"
        routes:
          - id: auth-service
            uri: lb://auth-service
            predicates:
              - Path=/api/v1/auth/**, /api/v1/users/**
          - id: learning-service
            uri: lb://learning-service
            predicates:
              - Path=/api/v1/learning/**
          - id: tools-news-service
            uri: lb://tools-news-service
            predicates:
              - Path=/api/v1/tools/**, /api/v1/news/**, /api/v1/social/**
          - id: social-image-service
            uri: http://localhost:8084
            predicates:
              - Path=/api/v1/image/**
  ```
- **Functionality:** Central single point of ingress. Implements reactive non-blocking reverse proxying, client load balancing (`lb://`), and cross-origin resource sharing (CORS).

### 3.3 Authentication & Gamification Service (`auth-service`)
- **Port:** `8081`
- **Database:** `ai_auth_db`
- **Security Chain:**
  - `SecurityConfig`: Configures stateless session policy, permits `/api/v1/auth/**`, registers `AuthTokenFilter`.
  - `UserDetailsServiceImpl`: Implements Spring Security's `UserDetailsService`, querying `userRepository.findByUsername()`.
  - `JwtUtils`: Generates tokens with 24-hour expiration (`86,400,000` ms) using `app.jwtSecret`.
- **Key Logic in `UserController`:**
  - `addXp()` executes dynamic leveling arithmetic:
    $$\text{newLevel} = 1 + \left\lfloor \frac{\text{currentXp} + \text{xpToAdd}}{1000} \right\rfloor$$
  - Evaluates `badgeRepository.findEarnedBadges(currentXp)` to automatically assign eligible achievement badges.

### 3.4 Learning & Roadmap Service (`learning-service`)
- **Port:** `8082`
- **Database:** `ai_learning_db`
- **Key Logic in `RoadmapService`:**
  - Annotated with `@Transactional`.
  - Generates bespoke curriculum sequences based on user goals:
    - `ML Engineer` / `AI Researcher` (Algorithms, PyTorch, CV/NLP, MLOps).
    - `Gemini Ecosystem` (AI Studio, Multimodal, Vector Search, Gemma, Agent calling).
    - `Generative AI Engineer` (Prompting, Pinecone, LangChain, RAG, CrewAI, LLMOps).
- **Key Logic in `RoadmapController`:**
  - Quiz submission parses question options and computes passing thresholds ($\ge 70\%$).
  - Successful quiz completion automatically creates/updates records in `daily_logs` for heatmap generation and awards 300 XP.
- **Key Logic in `AnalyticsController`:**
  - Aggregates 365-day study logs, weekly study distributions, and computes a weighted AI Readiness Score ($0-100\%$) based on node difficulties and quiz scores.

### 3.5 Tools & News Service (`tools-news-service`)
- **Port:** `8083`
- **Database:** `ai_tools_news_db`
- **Background Schedulers (`NewsSyncScheduler`):**
  - `@Scheduled(fixedRate = 300000)`: 5-minute trending news synchronization.
  - `@Scheduled(fixedRate = 900000)`: 15-minute general news synchronization.
  - `@EventListener(ApplicationReadyEvent.class)`: Startup synchronization trigger.
- **Deduplication Engine:**
  - Computes `duplicateHash = "hash_" + hex(normalizedTitle.hashCode())`.
  - Upon collision: Merges external article links into the `alternative_references` JSON array and boosts trending scores rather than inserting duplicate records.
- **Server-Sent Events (`NewsSseBroadcaster`):**
  - Maintains active connections via `CopyOnWriteArrayList<SseEmitter>`.
  - `broadcastArticle()` pushes real-time events to all active listeners.
- **Smart Social Post Generator (`SocialController`):**
  - Tailors post structures across five distinct styles: `Creator`, `Founder`, `Technical`, `Beginner`, and `Professional`.
  - Adapts content hooks and hashtags dynamically based on detected technology company (e.g. Google AI, OpenAI, DeepMind, Anthropic, Meta).

### 3.6 Social Image Renderer Service (`social-image-service`)
- **Port:** `8084`
- **Runtime:** Node.js 20, Express, Sharp
- **Functionality:** Provides server-side rendering of social cards, executing word-wrapping, XML sanitization, and converting dynamic SVGs into crisp PNG or JPEG binaries.

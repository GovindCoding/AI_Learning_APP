# Architecture Decision Records (ADRs) – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** ADR-AS-IS-017  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## Index of Architectural Decisions

- [ADR-001: Backend Architecture Style](#adr-001--backend-architecture-style)
- [ADR-002: Service Discovery & Ingress Gateway](#adr-002--service-discovery--ingress-gateway)
- [ADR-003: Database Partitioning Strategy](#adr-003--database-partitioning-strategy)
- [ADR-004: Authentication & Identity Mechanism](#adr-004--authentication--identity-mechanism)
- [ADR-005: Frontend Framework & Reactivity Primitive](#adr-005--frontend-framework--reactivity-primitive)
- [ADR-006: Real-Time Event Broadcasting](#adr-006--real-time-event-broadcasting)
- [ADR-007: Image Processing Engine](#adr-007--image-processing-engine)
- [ADR-008: Client-Side Offline Resilience Model](#adr-008--client-side-offline-resilience-model)

---

### ADR-001 – Backend Architecture Style
- **Context:** The application coordinates distinct domains: user identity, curriculum roadmaps, content aggregation, and image rendering.
- **Observed Implementation:** Polyglot Microservices architecture with 5 Java Spring Boot services and 1 Node.js worker.
- **Decision:** Decompose application logic into independent deployable microservices rather than a monolithic deployment.
- **Evidence:** `backend/pom.xml` with five modules (`discovery-server`, `gateway-service`, `auth-service`, `learning-service`, `tools-news-service`) and `backend/social-image-service/server.js`.
- **Benefits:** Independent scalability, decoupled database schemas, polyglot technology selection (Java for enterprise business rules, Node.js for C-based graphics processing).
- **Trade-offs:** Increased network complexity, inter-service coordination overhead, distributed deployment requirements.
- **Risks:** Service startup order dependency if healthcheck conditions are misconfigured.

---

### ADR-002 – Service Discovery & Ingress Gateway
- **Context:** Microservice instances require dynamic registration, client routing, and single-port frontend exposure.
- **Observed Implementation:** Spring Cloud Netflix Eureka (`discovery-server`) paired with Spring Cloud Gateway (`gateway-service`).
- **Decision:** Utilize Eureka as the service registry and Cloud Gateway as the sole public reverse proxy and load balancer.
- **Evidence:** `gateway-service/src/main/resources/application.yml` route predicates using `lb://<service-name>` pointing to Eureka on `http://localhost:8761/eureka/`.
- **Benefits:** Abstracted internal port numbers, centralized CORS policies, dynamic instance scale-up without restarting the gateway.
- **Trade-offs:** Gateway acts as a single point of failure (SPOF) if not clustered.
- **Risks:** Route misconfigurations in gateway can block access to entire backend modules.

---

### ADR-003 – Database Partitioning Strategy
- **Context:** Data models serve distinct functional domains with differing lifecycles.
- **Observed Implementation:** Database-per-Domain pattern across three logical schemas (`ai_auth_db`, `ai_learning_db`, `ai_tools_news_db`) on a shared MySQL instance.
- **Decision:** Separate schemas per bounded context while sharing database infrastructure.
- **Evidence:** `database/schema.sql`, `docker-compose.yml:49,65,81`.
- **Benefits:** Enforces domain boundaries at the persistence layer, prevents tight database coupling, allows future physical migration of schemas to dedicated DB instances.
- **Trade-offs:** Inability to execute SQL `JOIN` queries across user identity and roadmap/news tables; relational foreign keys across databases cannot be enforced by the RDBMS.
- **Risks:** Data integrity relies entirely on application-level integrity guards.

---

### ADR-004 – Authentication & Identity Mechanism
- **Context:** Distributed microservices need to verify user identities without introducing centralized session state.
- **Observed Implementation:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA512.
- **Decision:** Issue JWTs on authentication that contain user identity and authority claims, validated independently by each downstream service.
- **Evidence:** `backend/auth-service/src/.../JwtUtils.java`, `AuthTokenFilter.java`.
- **Benefits:** Zero database hits required for basic session verification, horizontal scalability without sticky sessions.
- **Trade-offs:** Revoking access before token expiration requires a distributed blacklist; tokens are larger than traditional session IDs.
- **Risks:** Compromise of `app.jwtSecret` allows forging valid arbitrary user identities.

---

### ADR-005 – Frontend Framework & Reactivity Primitive
- **Context:** The frontend requires high-performance UI rendering, modular glassmorphic componentry, and seamless state reactivity.
- **Observed Implementation:** Angular 22.2 with Standalone Components and native Signals (`signal()`, `computed()`).
- **Decision:** Adopt modern Angular without NgModules, utilizing Signals for fine-grained reactivity and Vite for instantaneous local development.
- **Evidence:** `frontend/package.json` (`@angular/core: ^22.2.0`), `frontend/src/app/services/learning.service.ts`.
- **Benefits:** Rapid rebuild times (0.5s via Vite), zoneless-ready reactive state management without RxJS subscription memory leaks, zero external Redux dependencies.
- **Trade-offs:** Requires modern browser ECMAScript support.
- **Risks:** Signal mutations outside service boundaries could cause state divergence if architectural discipline is not maintained.

---

### ADR-006 – Real-Time Event Broadcasting
- **Context:** Breaking AI news stories and sync notifications must reach connected client browsers in real time.
- **Observed Implementation:** Server-Sent Events (SSE) via Spring MVC `SseEmitter`.
- **Decision:** Use HTTP-based Server-Sent Events rather than bidirectional WebSockets.
- **Evidence:** `tools-news-service/src/.../NewsSseBroadcaster.java`, `NewsController.java:184-187` (`/api/v1/news/stream`).
- **Benefits:** Native browser `EventSource` support, works seamlessly through HTTP reverse proxies, simple unidirectional push model with minimal resource overhead.
- **Trade-offs:** Unidirectional only (clients cannot send data back over the same channel).
- **Risks:** Long-lived HTTP connections can exhaust servlet container thread pools if not tuned.

---

### ADR-007 – Image Processing Engine
- **Context:** Generating high-resolution social media cards requires high-speed vector-to-raster rendering.
- **Observed Implementation:** Node.js microservice utilizing the native `sharp` (libvips) library.
- **Decision:** Offload graphics processing from Java/JVM to a dedicated Node.js worker microservice.
- **Evidence:** `backend/social-image-service/server.js`, `package.json`.
- **Benefits:** `sharp` executes operations in native C/libvips with superior speed and memory efficiency compared to Java `Graphics2D` or Batik.
- **Trade-offs:** Introduces a second runtime language (Node.js) into the backend stack.
- **Risks:** Unsanitized SVG strings could cause XML parsing vulnerabilities if input validation fails.

---

### ADR-008 – Client-Side Offline Resilience Model
- **Context:** The application is frequently evaluated, demonstrated, or developed in environments where the complete microservice backend may be offline.
- **Observed Implementation:** Transparent Simulation Mode Fallback in `LearningService`.
- **Decision:** Detect connection failures and automatically switch to complete local mock datasets and localStorage persistence.
- **Evidence:** `frontend/src/app/services/learning.service.ts:1649-1658`, `frontend/src/app/utils/mock-data.ts`.
- **Benefits:** 100% operational uptime from a UI perspective, zero crash screens or broken buttons when backend is down.
- **Trade-offs:** Local simulated modifications do not synchronize back to MySQL once services resume.
- **Risks:** Users might mistake simulated local state for persistent database records.

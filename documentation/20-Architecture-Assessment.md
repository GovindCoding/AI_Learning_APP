# Current-State Architecture Assessment

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** ASSESS-AS-IS-020  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Dimensional Architecture Assessment Matrix

| Dimension | Current State (AS-IS) | Architectural Risk | Severity | Prioritized Recommendation (TO-BE) |
|---|---|---|---|---|
| **Architecture** | Microservices architecture with Spring Cloud Gateway, Eureka Registry, and polyglot Node.js image worker. | Gateway and Eureka are single instances; downtime cascades across all ingress traffic. | **High** | Deploy Gateway and Eureka in multi-instance active-active configurations with health probes. |
| **Security** | Stateless JWT authentication with BCrypt hashing; secret key and root DB credentials hardcoded in YAML files; wildcard CORS. | Secret leakage compromises all user tokens; wildcard CORS exposes APIs to malicious browser contexts. | **Critical** | Externalize secrets to environment variables / Kubernetes Secrets; restrict CORS to trusted client origins. |
| **Database** | Database-per-Domain across 3 logical MySQL schemas (`ai_auth_db`, `ai_learning_db`, `ai_tools_news_db`) with indexed query filters. | Cross-database foreign keys lack RDBMS-enforced cascading; user deletions can create orphaned records. | **Medium** | Implement an asynchronous domain event consumer (e.g. `UserDeletedEvent`) to clean up cross-schema orphans. |
| **API** | Clean RESTful endpoints under `/api/v1/*` with Server-Sent Events push stream on `/api/v1/news/stream`. | Unbounded SSE connection pools (`CopyOnWriteArrayList<SseEmitter>`) could exhaust servlet threads under heavy user load. | **Medium** | Implement connection timeouts, heartbeat pings, and consider moving real-time streams to a dedicated WebSocket/SSE broker. |
| **Frontend** | Angular 22 standalone components with native Signals, Lucide icons, Tailwind CSS, and resilient simulation mode fallback. | Application bundle is monolithic in initial download (~524 kB main JS). | **Low** | Implement fine-grained route-based code splitting and lazy component loading to optimize initial load times. |
| **Backend** | Spring Boot 3.3.4 on Java 21 LTS with virtual thread compatibility and clean Controller-Service-Repository separation. | Some background scheduled tasks use `System.out.println` rather than structured SLF4J logging; no distributed tracing. | **Low** | Replace stdout logging with SLF4J/Logback and integrate Micrometer tracing with OpenTelemetry headers. |
| **DevOps** | Full Docker Compose stack, Kubernetes manifests (`k8s/`), Windows batch console (`run_app.bat`), and GitHub Actions CI. | Docker Compose uses fixed root credentials; Kubernetes manifests lack Resource Requests/Limits. | **Medium** | Add CPU/Memory requests and limits to Kubernetes pods; configure non-root security contexts. |
| **Testing** | Unit and controller tests for learning and news services, extensive 24-test Postman collection, CI pipeline active. | Auth service and API gateway lack automated unit/integration test coverage in CI build. | **Medium** | Implement MockMvc test suites for `AuthController` and WebTestClient routing tests for `gateway-service`. |

---

## 2. Maturity Radar & Architectural Health Summary

```text
Dimension              Score (1-5)    Assessment
─────────────────────────────────────────────────────────────────────────────
System Modularity      ★★★★★ (5.0)    Clean microservice and database separation.
Client UX & UI         ★★★★★ (5.0)    Modern glassmorphism, Signals, 100% resilient.
Containerization       ★★★★☆ (4.0)    Docker Compose, K8s manifests, batch tooling.
API Design             ★★★★☆ (4.0)    Consistent REST conventions, pagination, SSE.
Test Coverage          ★★★☆☆ (3.0)    Tests present in core services, gaps in auth/UI.
Observability          ★★☆☆☆ (2.5)    Eureka & healthchecks active; tracing missing.
Secret Management      ★★☆☆☆ (2.0)    Hardcoded secrets committed in repo configs.
```

---

## 3. Prioritized Strategic Roadmap

### Phase 1: Security Hardening (Immediate Priority)
1. **Secret Externalization:** Parameterize `app.jwtSecret` and `spring.datasource.password` in all `application.yml` files using environment placeholders (`${JWT_SECRET}`, `${DB_PASSWORD}`).
2. **CORS Hardening:** Replace `allowedOrigins: "*"` in `gateway-service` with explicit client whitelist (`http://localhost:5173`, production URL).

### Phase 2: Reliability & Test Completion (Short-Term)
1. **Automated Auth Tests:** Write JUnit 5 unit tests for `AuthController`, `JwtUtils`, and `AuthTokenFilter`.
2. **Kubernetes Quotas:** Annotate pods in `k8s/` with explicit `resources.requests` and `resources.limits` (e.g. 512Mi memory, 500m CPU).

### Phase 3: Observability & Scale (Medium-Term)
1. **Distributed Tracing:** Integrate Spring Cloud Sleuth / Micrometer Tracing to propagate trace IDs across Gateway $\to$ Microservices $\to$ DB logs.
2. **Prometheus / Grafana Exporters:** Expose Spring Boot Actuator metrics to a Prometheus instance for cluster monitoring.

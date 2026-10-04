# Technical Debt Analysis – AS-IS Assessment

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** DEBT-AS-IS-018  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Technical Debt Classification Matrix

Technical debt observed in the current codebase is categorized by severity:

| Debt ID | Classification | Severity | Area | Observed Code Evidence | Remediation Complexity |
|---|---|---|---|---|---|
| **DEBT-001** | Security | **Critical** | Backend / Auth | Hardcoded JWT secret key committed in `backend/auth-service/src/.../application.yml:26`. | Low (Extract to Environment Variable) |
| **DEBT-002** | Security | **High** | Ingress / Gateway | Wildcard CORS policy (`allowedOrigins: "*"`) configured in `gateway-service/src/.../application.yml:12`. | Low (Configure specific allowed origin whitelist) |
| **DEBT-003** | Testing | **High** | Backend / CI | Complete absence of automated unit/integration tests for `auth-service` and `gateway-service`. | Medium (Add MockMvc / WebTestClient tests) |
| **DEBT-004** | Architecture | **Medium** | Database Integrity | Lack of referential integrity across database boundaries (`roadmaps.user_id`, `bookmarks.user_id`). | Medium (Implement application-level event listeners or saga) |
| **DEBT-005** | DevOps | **Medium** | Configuration | Hardcoded database credentials (`root / admin1234`) across `docker-compose.yml` and YAML configs. | Low (Externalize via Docker secrets / env files) |
| **DEBT-006** | Code Quality | **Low** | Backend / Logging | `System.out.println` and `System.err.println` used instead of SLF4J `Logger` in `NewsSyncScheduler.java`. | Low (Replace with `@Slf4j` annotations) |
| **DEBT-007** | Repository | **Low** | Code Hygiene | Legacy `frontend-react/` directory remains present alongside primary `frontend/` (Angular). | Low (Archive or remove legacy React directory) |

---

## 2. In-Depth Technical Debt Profiles

### DEBT-001: Hardcoded JWT Secret Key
- **Location:** `backend/auth-service/src/main/resources/application.yml`
- **Snippet:**
  ```yaml
  app:
    jwtSecret: ailearningtrackersecretkeykeykeykeykeykeykeykeykeykeykeykey
    jwtExpirationMs: 86400000
  ```
- **Technical Impact:** If the repository is shared or made public, malicious actors can forge valid JWT tokens for any user or administrator ID.
- **Recommended Remediation:**
  ```yaml
  app:
    jwtSecret: ${JWT_SECRET:defaultDevSecretKeyReplaceInProduction1234567890}
  ```

---

### DEBT-002: Overly Permissive Ingress CORS
- **Location:** `backend/gateway-service/src/main/resources/application.yml`
- **Snippet:**
  ```yaml
  spring:
    cloud:
      gateway:
        globalcors:
          cors-configurations:
            '[/**]':
              allowedOrigins: "*"
  ```
- **Technical Impact:** Allows any third-party domain in a user's browser to execute requests against the API gateway.
- **Recommended Remediation:** Bind `allowedOrigins` to the specific client deployment domain (e.g. `http://localhost:5173`, `https://app.ailearning.io`).

---

### DEBT-003: Testing Gaps in Auth & Gateway Services
- **Location:** `backend/auth-service/src/test/`, `backend/gateway-service/src/test/`
- **Technical Impact:** Regressions in signup validation, BCrypt password checks, or gateway route forwarding are not caught automatically during continuous integration builds.
- **Recommended Remediation:** Introduce JUnit 5 test suites utilizing Spring Security test harnesses and `WebTestClient`.

---

### DEBT-004: Cross-Database Referential Integrity Risk
- **Location:** `database/schema.sql:68, 95, 154`
- **Technical Impact:** If a user is deleted in `ai_auth_db.users`, corresponding records in `ai_learning_db.roadmaps`, `ai_learning_db.daily_logs`, and `ai_tools_news_db.bookmarks` are not automatically purged, creating orphaned records.
- **Recommended Remediation:** Implement an asynchronous user deletion event (e.g. Spring Application Events or Kafka/RabbitMQ message) consumed by `learning-service` and `tools-news-service` to cascade deletions cleanly.

---

### DEBT-006: Console Output vs Structured SLF4J
- **Location:** `backend/tools-news-service/src/.../NewsSyncScheduler.java:47, 54, 61, 108, 154, 176`
- **Snippet:**
  ```java
  System.out.println("Executing 5-minute background sync for trending news...");
  System.err.println("Failed to fetch news from Hacker News API: " + e.getMessage());
  ```
- **Technical Impact:** Bypasses Logback configuration; cannot be filtered by log level (DEBUG, INFO, ERROR), formatted into JSON, or indexed with correlation IDs in production log aggregators.
- **Recommended Remediation:** Replace stdout calls with standard SLF4J `log.info()` and `log.error()`.

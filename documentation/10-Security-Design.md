# Security Design – AS-IS Specification & Assessment

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** SEC-AS-IS-010  
**Security Model:** Stateless JWT & Role-Based Access Control (RBAC)  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Current Implementation (AS-IS)

### 1.1 Authentication & Credential Storage
- **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `BCryptPasswordEncoder` (`auth-service/config/SecurityConfig.java:54`) before persisting to `ai_auth_db.users`.
- **Token Format:** JSON Web Token (JJWT `0.11.5`) using HMAC-SHA (HS512 algorithm).
- **Token Validity:** 24 Hours (`jwtExpirationMs = 86400000`).
- **Token Verification:** `AuthTokenFilter` intercepts every incoming HTTP request to protected endpoints, parses the header (`Authorization: Bearer <token>`), validates the cryptographic signature using `JwtUtils`, and loads user authorities into Spring's `SecurityContextHolder`.

### 1.2 Authorization & Access Control
- **User Roles:**
  - `ROLE_USER`: Standard learner account.
  - `ROLE_ADMIN`: Platform administrator account.
- **Enforcement Mechanism:** Role strings are embedded in the JWT payload claims and mapped to Spring Security's `GrantedAuthority` interfaces.

### 1.3 Network & Transport Security
- **Cross-Origin Resource Sharing (CORS):**
  - Gateway Level (`gateway-service/src/main/resources/application.yml`):
    - `allowedOrigins: "*"`
    - `allowedMethods: [GET, POST, PUT, DELETE, OPTIONS]`
    - `allowedHeaders: "*"`
  - Controller Level: Controllers annotate `@CrossOrigin(origins = "*", maxAge = 3600)`.
- **CSRF Protection:** Explicitly disabled via `http.csrf(csrf -> csrf.disable())`. This aligns with industry standards for purely stateless REST services where authentication credentials are sent via headers rather than ambient cookies.

### 1.4 Injection Defense & Data Sanitization
- **SQL Injection Prevention:** 100% of database interactions are orchestrated through Hibernate / Spring Data JPA. Queries utilize parameterized statements (`findByUsername`, `existsByEmail`) or the JPA `CriteriaBuilder` API with typed `Predicate` constraints (`NewsController.java:56-96`). No dynamic raw SQL string concatenations exist in backend repositories.
- **XSS & SVG Sanitization:** The SVG generation engine in `social-image-service` (`server.js:38-50`) incorporates an explicit `escapeXml()` utility that strips and escapes `<`, `>`, `&`, `"`, and `'` characters before embedding user strings into vector canvases.

---

## 2. Identified Security Risks & Vulnerabilities

| Vulnerability ID | Description | Severity | File Location | Observed Implementation |
|---|---|---|---|---|
| **SEC-RISK-01** | Hardcoded JWT Secret Key in source code repository. | **High** | `backend/auth-service/src/main/resources/application.yml:26` | `app.jwtSecret: ailearningtrackersecretkeykeykeykeykeykeykeykeykeykeykeykey` is checked into version control. |
| **SEC-RISK-02** | Default Database Root Credentials in configuration files. | **Medium** | `docker-compose.yml:10`, `application.yml` (all services) | `root / admin1234` is committed in plaintext across YAML files. |
| **SEC-RISK-03** | Overly Permissive Global CORS policy (`*`). | **Medium** | `backend/gateway-service/src/main/resources/application.yml:12` | Allows any web origin to invoke API gateway endpoints. |
| **SEC-RISK-04** | Lack of Refresh Tokens & Token Revocation Mechanism. | **Low** | `backend/auth-service/src/main/java/com/.../JwtUtils.java` | Once issued, tokens cannot be revoked before the 24-hour expiration expires. |

---

## 3. Recommended Security Improvements (TO-BE)

> [!IMPORTANT]
> The following recommendations are proposed enhancements for future hardening and do not alter the AS-IS documentation baseline.

1. **Environment-Based Secret Injection:**
   - Migrate `app.jwtSecret` and `spring.datasource.password` to environment variables or a secret management vault (e.g. AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets).
2. **Strict Production CORS:**
   - Restrict `allowedOrigins` in `gateway-service` to explicitly approved production domain origins (e.g. `https://ailearning.app`).
3. **Token Invalidation Cache (Redis):**
   - Introduce a lightweight Redis cache to track revoked JWT tokens on logout and implement short-lived access tokens (15 minutes) paired with rolling refresh tokens (7 days).
4. **Rate Limiting & DoS Protection:**
   - Implement `RequestRateLimiter` filter in Spring Cloud Gateway using Redis token bucket algorithms to protect against brute-force authentication attacks on `/api/v1/auth/login`.

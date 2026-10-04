# Testing Strategy – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** TST-AS-IS-014  
**Test Frameworks:** JUnit 5 (Jupiter), Mockito, Spring Boot Test, Postman  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Existing Test Suites & Framework Inventory

| Layer / Scope | Framework & Tooling | Location | Implementation Evidence |
|---|---|---|---|
| **Backend Unit Tests** | JUnit 5 Jupiter, Mockito | `backend/learning-service/src/test/...` | `RoadmapServiceTest.java` |
| **Backend API Tests** | Spring Boot Test (`MockMvc`) | `backend/tools-news-service/src/test/...`| `NewsControllerTest.java`, `ToolControllerTest.java`, `SocialControllerTest.java` |
| **Integration / Contract**| Postman Test Scripts (JavaScript) | `postman/ai_learning_tracker_collection.json` | 24 scripted Postman tests checking response codes, schemas, and JWT propagation. |
| **Frontend Unit Tests** | Jasmine / Karma / Vitest config | `frontend/tsconfig.spec.json`, `package.json` | Configured via `npm test` script. |
| **Automated CI Tests** | GitHub Actions Workflow | `.github/workflows/ci-cd.yml` | Executes `mvn -B clean test` on every push/PR to `main`. |

---

## 2. Implemented Test Scenarios

### 2.1 Learning Service Unit Tests (`RoadmapServiceTest.java`)
- **`testGenerateRoadmap_GenerativeAI()`:**
  - Mocks `RoadmapRepository` and `LearningNodeRepository`.
  - Verifies that when a user selects the `Generative AI Engineer` goal, the generator creates nodes for Prompt Engineering, Vector Databases, LangChain, RAG Systems, Multi-Agent Teams, and LLMOps.
  - Verifies repository calls: `findByUserId()`, `save()`, and `saveAll()`.
- **`testGenerateRoadmap_MLEngineer()`:**
  - Verifies that an `advanced` learner dedicating 3.0 hours/day receives a compressed completion timeline ($\le 8$ weeks).
  - Asserts that goal-specific nodes for Scikit-Learn, PyTorch, and MLOps are generated.

### 2.2 Tools & News Service Controller Tests
- **`ToolControllerTest.java`:**
  - Validates `GET /api/v1/tools` query parameter filtering (category, search string, pricing).
  - Validates `POST /api/v1/tools/{id}/favorite` bookmark toggle logic.
- **`NewsControllerTest.java`:**
  - Tests pagination, date range filtering, and company filters.
  - Tests the AI insights endpoint (`GET /api/v1/news/{id}/summary`).
- **`SocialControllerTest.java`:**
  - Verifies multi-tone post generation structures (`hook`, `summary`, `insights`, `takeaway`, `cta`, `hashtags`).
  - Tests draft persistence and social analytics logging.

### 2.3 Postman API Collection Automated Tests
The collection in `postman/ai_learning_tracker_collection.json` contains automated pre-request and test assertion scripts:
```javascript
// Postman Token Extraction Script
const responseJson = pm.response.json();
if (responseJson && responseJson.token) {
    pm.environment.set("jwt_token", responseJson.token);
    pm.collectionVariables.set("jwt_token", responseJson.token);
    console.log("Saved JWT Token:", responseJson.token);
}
```
Subsequent requests automatically inherit `Bearer {{jwt_token}}` to validate protected endpoints.

---

## 3. Test Coverage Gaps & Missing Test Areas

> [!NOTE]
> Based on strict static analysis of the repository, the following areas lack automated test coverage:

| Area | Current State | Risk / Impact | Recommendation (TO-BE) |
|---|---|---|---|
| **Auth Service Unit Tests** | No tests found in `backend/auth-service/src/test` | Regressions in signup uniqueness or BCrypt hashing could go undetected in CI. | Implement `AuthControllerTest` and `JwtUtilsTest`. |
| **End-to-End (E2E) UI Tests** | No Cypress / Playwright suite configured in `frontend/` | UI navigation breaks or template binding bugs could slip to staging. | Implement Playwright E2E suite covering login $\to$ onboarding $\to$ quiz submission. |
| **Gateway Routing Integration** | Gateway lacks automated routing integration tests | Gateway path misconfigurations must be detected manually. | Implement `WebTestClient` integration test for `gateway-service`. |
| **Performance & Load Tests** | No JMeter / Gatling scripts present | Concurrency limits of the SSE broadcaster and Sharp image renderer are untested. | Implement k6 performance test for `/api/v1/news/stream` and `/api/v1/image/render`. |

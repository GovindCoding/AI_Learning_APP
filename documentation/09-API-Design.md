# API Design – Existing APIs Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** API-AS-IS-009  
**Ingress Host:** `http://localhost:8080` (API Gateway)  
**Protocol:** HTTP/1.1 (JSON & Server-Sent Events)  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Complete API Inventory Table

| Method | Endpoint | Microservice & Controller | Purpose | Auth Required | Request Body / Query Params | Expected Response |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | `auth-service` / `AuthController` | User account registration | None (Public) | JSON: `username`, `email`, `password`, `role` | `200 OK` + `{ message: string }` |
| `POST` | `/api/v1/auth/login` | `auth-service` / `AuthController` | Authentication & token generation | None (Public) | JSON: `username`, `password` | `200 OK` + `{ token, id, username, email, roles }` |
| `GET` | `/api/v1/users/profile` | `auth-service` / `UserController` | Retrieve authenticated user profile | Bearer JWT | None | `200 OK` + `User` entity JSON |
| `POST` | `/api/v1/users/onboarding` | `auth-service` / `UserController` | Save learner onboarding responses | Bearer JWT | JSON: `skillLevel`, `background`, `learningGoal`, `hoursPerDay`, `learningStyle` | `200 OK` + `{ message: string }` |
| `POST` | `/api/v1/users/xp` | `auth-service` / `UserController` | Ingest XP and calculate level progression | Bearer JWT | JSON: `{ xp: number }` | `200 OK` + `{ xp, level, leveledUp, badgesUnlocked }` |
| `GET` | `/api/v1/users/badges` | `auth-service` / `UserController` | List unlocked and all available badges | Bearer JWT | None | `200 OK` + `{ unlocked, allBadges }` |
| `POST` | `/api/v1/learning/roadmap/generate` | `learning-service` / `RoadmapController` | Generate personalized curriculum | Bearer JWT | JSON: `userId`, `skillLevel`, `background`, `goal`, `hoursPerDay`, `learningStyle` | `200 OK` + `Roadmap` entity JSON |
| `GET` | `/api/v1/learning/roadmap` | `learning-service` / `RoadmapController` | Fetch active roadmap and learning nodes | Public / JWT | Query: `userId` (Long) | `200 OK` + `{ roadmap, nodes }` |
| `PUT` | `/api/v1/learning/node/{id}/status` | `learning-service` / `RoadmapController` | Update module progress status | Public / JWT | Query: `userId`, Body: `{ status: string }` | `200 OK` + `{ node, message }` |
| `GET` | `/api/v1/learning/node/{id}/quiz` | `learning-service` / `RoadmapController` | Fetch quiz assessment for module | Public / JWT | Path: `id` (Long) | `200 OK` + `List<Quiz>` |
| `POST` | `/api/v1/learning/node/{id}/quiz/submit` | `learning-service` / `RoadmapController` | Grade quiz and award completion XP | Public / JWT | Query: `userId`, Body: `{ answers: { [quizId]: option } }` | `200 OK` + `{ score, passed, correctCount, xpGained }` |
| `POST` | `/api/v1/learning/roadmap/custom-node` | `learning-service` / `RoadmapController` | Add user-defined learning module | Public / JWT | JSON: `userId`, `title`, `description`, `difficulty`, `durationHours` | `200 OK` + `{ nodes, message }` |
| `GET` | `/api/v1/learning/analytics/logs` | `learning-service` / `AnalyticsController` | Query historical study activity logs | Public / JWT | Query: `userId`, `startDate`, `endDate` | `200 OK` + `List<DailyLog>` |
| `GET` | `/api/v1/learning/analytics/summary` | `learning-service` / `AnalyticsController` | Aggregated metrics & AI readiness score | Public / JWT | Query: `userId` | `200 OK` + `{ totalHours, progressPercentage, aiReadinessScore }` |
| `GET` | `/api/v1/tools` | `tools-news-service` / `ToolController` | Query catalog with filters and search | None (Public) | Query: `category`, `search`, `pricing` | `200 OK` + `List<Tool>` |
| `GET` | `/api/v1/tools/{id}` | `tools-news-service` / `ToolController` | Tool details by ID | None (Public) | Path: `id` | `200 OK` + `Tool` / `404 Not Found` |
| `POST` | `/api/v1/tools` | `tools-news-service` / `ToolController` | Register a new AI tool | Public / Admin | JSON: `Tool` entity | `200 OK` + `Tool` |
| `GET` | `/api/v1/tools/favorites` | `tools-news-service` / `ToolController` | Retrieve user bookmarked tools | Public / JWT | Query: `userId` | `200 OK` + `List<Tool>` |
| `POST` | `/api/v1/tools/{id}/favorite` | `tools-news-service` / `ToolController` | Toggle tool favorite bookmark | Public / JWT | Path: `id`, Query: `userId` | `200 OK` + `{ favorited, message }` |
| `GET` | `/api/v1/news` | `tools-news-service` / `NewsController` | Filtered, paginated breaking news feed | None (Public) | Query: `category`, `company`, `dateRange`, `trendingOnly`, `search`, `page`, `size` | `200 OK` + `Page<NewsArticle>` |
| `GET` | `/api/v1/news/{id}` | `tools-news-service` / `NewsController` | News article details by ID | None (Public) | Path: `id` | `200 OK` + `NewsArticle` / `404 Not Found` |
| `GET` | `/api/v1/news/{id}/summary` | `tools-news-service` / `NewsController` | AI takeaways & structured insights | None (Public) | Path: `id` | `200 OK` + `{ takeaways, beginner, business, developer }` |
| `GET` | `/api/v1/news/bookmarks` | `tools-news-service` / `NewsController` | Retrieve user saved news articles | Public / JWT | Query: `userId` | `200 OK` + `List<NewsArticle>` |
| `POST` | `/api/v1/news/{id}/bookmark` | `tools-news-service` / `NewsController` | Toggle news article bookmark | Public / JWT | Path: `id`, Query: `userId` | `200 OK` + `{ bookmarked, message }` |
| `POST` | `/api/v1/news/sync` | `tools-news-service` / `NewsController` | Trigger immediate news synchronization | Public / Admin | None | `200 OK` + `{ success, newlyIngestedCount }` |
| `GET` | `/api/v1/news/stream` | `tools-news-service` / `NewsController` | Real-time Server-Sent Events push feed | None (Public) | None | `text/event-stream` (SSE chunked stream) |
| `POST` | `/api/v1/social/generate` | `tools-news-service` / `SocialController` | Generate multi-tone social post text | Public / JWT | JSON: `type`, `id`, `tone`, `company`, `customInput` | `200 OK` + `{ hook, summary, insights, takeaway, cta, hashtags, fullContent }` |
| `GET` | `/api/v1/social/settings` | `tools-news-service` / `SocialController` | Get creator branding settings | Public / JWT | Query: `userId` | `200 OK` + `SocialSettings` |
| `POST` | `/api/v1/social/settings` | `tools-news-service` / `SocialController` | Update creator branding settings | Public / JWT | JSON: `SocialSettings` | `200 OK` + `SocialSettings` |
| `GET` | `/api/v1/social/drafts` | `tools-news-service` / `SocialController` | List user social post drafts | Public / JWT | Query: `userId` | `200 OK` + `List<SocialDraft>` |
| `POST` | `/api/v1/social/drafts` | `tools-news-service` / `SocialController` | Save/Schedule social post draft | Public / JWT | JSON: `SocialDraft` | `200 OK` + `SocialDraft` |
| `DELETE`| `/api/v1/social/drafts/{id}` | `tools-news-service` / `SocialController` | Remove post draft | Public / JWT | Path: `id` | `200 OK` + `{ success: true }` |
| `GET` | `/api/v1/social/analytics/summary` | `tools-news-service` / `SocialController` | Social marketing performance metrics | Public / JWT | Query: `userId` | `200 OK` + `{ totalGenerated, totalShared, weeklyPosts }` |
| `POST` | `/api/v1/image/render` | `social-image-service` / `server.js` | Server-side SVG rasterizer | None (Public) | JSON: `bannerSize`, `bannerBg`, `bannerTitle`, `bannerSummary`, `brandColors`, `format` | `200 OK` + Binary `image/png` / `image/jpeg` |

---

## 2. Realistic Request & Response Examples

### 2.1 User Authentication (`POST /api/v1/auth/login`)
**Request:**
```json
POST /api/v1/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "username": "AIElora",
  "password": "admin1234"
}
```
**Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJBSUVsb3JhIiwiaWF0IjoxNzE2NDAxODAwLCJleHAiOjE3MTY0ODgyMDB9...",
  "type": "Bearer",
  "id": 1,
  "username": "AIElora",
  "email": "elora@learningai.io",
  "roles": [
    "ROLE_USER"
  ]
}
```

### 2.2 Quiz Submission & Auto-Grading (`POST /api/v1/learning/node/1/quiz/submit?userId=1`)
**Request:**
```json
POST /api/v1/learning/node/1/quiz/submit?userId=1 HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "answers": {
    "1": "B",
    "2": "C"
  }
}
```
**Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "score": 100,
  "correctCount": 2,
  "totalCount": 2,
  "passed": true,
  "xpGained": 300
}
```

### 2.3 Real-Time Server-Sent Events Stream (`GET /api/v1/news/stream`)
**Request:**
```http
GET /api/v1/news/stream HTTP/1.1
Host: localhost:8080
Accept: text/event-stream
```
**Stream Chunk:**
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream;charset=UTF-8
Transfer-Encoding: chunked

event: NEWS_UPDATE
data: {"id":14,"title":"DeepMind Unveils Next-Gen Protein Multimodal Predictor","summary":"AlphaFold advances to DNA and RNA complex assemblies...","source":"DeepMind Blog","category":"AI Research","publishedDate":"2026-10-04T14:30:00","articleLink":"https://deepmind.google/technologies/alphafold/","aiCompany":"DeepMind","sentiment":"POSITIVE","popularityScore":9.8,"trendingScore":9.5}

```

### 2.4 Server-Side Graphic Render (`POST /api/v1/image/render`)
**Request:**
```json
POST /api/v1/image/render HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "bannerSize": "linkedin",
  "bannerBg": "gradient",
  "bannerTitle": "DeepMind Launches AlphaFold 3",
  "bannerSummary": "Predicting complex molecular structures including RNA and DNA with unprecedented precision.",
  "bannerTag": "AI Biology",
  "bannerAuthor": "@elora_tech",
  "brandColors": "#0284c7,#6366f1",
  "format": "png"
}
```
**Response:**
```http
HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 184512

<Binary PNG Image Data Stream 1200x628>
```

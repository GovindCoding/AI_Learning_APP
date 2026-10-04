# Integration Design – Existing Integrations

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** INT-AS-IS-011  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. External Integrations Inventory

The existing implementation connects to four external third-party systems and services.

| External System | Purpose in System | Protocol | Target Endpoint | Auth Mechanism | Error Handling & Fallback |
|---|---|---|---|---|---|
| **Hacker News Algolia API** | Ingesting real-time community discussions and breaking AI stories. | HTTPS / REST (JSON) | `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI` | Public / None | 4-second connect/read timeout; catches `Exception` and logs warning without crashing service. |
| **arXiv API** | Fetching academic computer science AI research preprints. | HTTPS / OAI-PMH (Atom XML) | `https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=5` | Public / None | 4-second timeout; regex XML fallback extraction; failure logged gracefully. |
| **Google Fonts CDN** | Typography styling (`Outfit`, `Inter`, `JetBrains Mono`). | HTTPS | `https://fonts.googleapis.com/css2?...` | Public / CDN | Preconnected in HTML head; local fallback system fonts specified in Tailwind config. |
| **Unsplash CDN** | High-resolution editorial photography for tools and news cards. | HTTPS | `https://images.unsplash.com/photo-...` | Public / CDN | Validated URLs; frontend and backend provide company-specific default visual fallbacks. |

---

## 2. Detailed Integration Specifications

### 2.1 Hacker News Algolia API
- **Caller Component:** `backend/tools-news-service/src/.../NewsSyncScheduler.java`
- **Request Format:**
  ```http
  GET /api/v1/search_by_date?tags=story&query=AI HTTP/1.1
  Host: hn.algolia.com
  User-Agent: Java/21 RestTemplate
  ```
- **Response Processing:**
  - Ingests `hits` array containing `title`, `url`, `author`, `created_at_i`, and `objectID`.
  - If article URL is null or empty, constructs canonical discussion URL: `https://news.ycombinator.com/item?id=<objectID>`.
- **Resilience Policy:**
  - Client configured via `SimpleClientHttpRequestFactory` with strict 4,000 ms timeout to prevent thread starvation during network latency spikes.

### 2.2 arXiv AI Preprints API
- **Caller Component:** `NewsSyncScheduler.java:112-156`
- **Request Format:**
  ```http
  GET /api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=5 HTTP/1.1
  Host: export.arxiv.org
  ```
- **Response Processing:**
  - Parses Atom XML stream using compiled regex patterns (`<entry>`, `<title>`, `<summary>`, `<id>`, `<published>`).
  - Normalizes whitespace and truncates lengthy abstracts exceeding 300 characters for concise card previews.
  - Retains full unedited abstract in `fullSummary` column.

### 2.3 Internal Inter-Service Ingress Integration (Spring Cloud Gateway)
- **Routing Protocol:** HTTP/1.1 over TCP.
- **Service Lookup:** Reactive discovery provider querying Netflix Eureka via logical identifiers:
  - `lb://auth-service`
  - `lb://learning-service`
  - `lb://tools-news-service`
  - `http://localhost:8084` (Node.js Social Image Service)
- **Load Balancing:** Spring Cloud LoadBalancer resolves registered host and port dynamically from Eureka cache.

### 2.4 Real-Time Simulation Engine Fallback
- **Component:** `NewsSyncScheduler.generateSimulatedArticle()`
- **Trigger:** Invoked when external network APIs are rate-limited, unreachable, or return 0 new articles.
- **Mechanism:** Selects from an internal repository of 12 realistic AI technology announcements (e.g., DeepMind, OpenAI, Gemini Omni, Anthropic, Meta Llama, Mistral) with synthetic timestamping to ensure the application remains dynamic and feature-rich during disconnected or air-gapped demonstrations.

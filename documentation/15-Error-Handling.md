# Error Handling – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** ERR-AS-IS-015  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Error Handling Philosophy & Principles

The AI Learning Tracker implements a dual-layer error management strategy:
1. **Explicit REST Status Codes on the Backend:** Controllers evaluate validation guards and existence checks explicitly, returning typed `ResponseEntity` payloads (e.g. `badRequest()`, `notFound()`, or `ok()`).
2. **Defensive Client-Side Resilience:** The frontend (`learning.service.ts`) treats network and backend service unavailability as expected operational states rather than fatal crashes, automatically triggering an offline simulation mode.

---

## 2. Backend Exception & Error Response Structures

### 2.1 Standard Validation & Conflict Responses (Auth Service)
When unique constraint violations or bad credentials occur in `AuthController.java`:
- **HTTP Status:** `400 Bad Request` or `401 Unauthorized`
- **Response Model:** `MessageResponse.java`
- **JSON Structure:**
  ```json
  {
    "message": "Error: Username is already taken!"
  }
  ```
- **Observed Scenarios:**
  - Duplicate username: `userRepository.existsByUsername() == true`
  - Duplicate email: `userRepository.existsByEmail() == true`
  - Missing role: `roleRepository.findByName().orElseThrow(() -> new RuntimeException("Error: Role is not found."))`

### 2.2 Entity Not Found Handling (Learning & Tools Services)
Controllers utilize Java `Optional<T>` chaining with Spring's `ResponseEntity` builder:
```java
return toolRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
```
- **HTTP Status:** `404 Not Found`
- **Response Body:** Empty body with standard HTTP 404 status line.

### 2.3 Image Renderer Error Handling (`social-image-service`)
When SVG compilation or libvips rasterization fails in `server.js`:
- **HTTP Status:** `500 Internal Server Error`
- **Response Payload:**
  ```json
  {
    "error": "Failed to render high-res image",
    "message": "Input buffer has corrupt header..."
  }
  ```

---

## 3. Resilience & Integration Error Traps

### 3.1 Network Timeout & Fallbacks (`NewsSyncScheduler.java`)
External HTTP queries to Hacker News Algolia and arXiv APIs are wrapped in explicit `try-catch` blocks with 4,000ms timeouts:
```java
try {
    String hnUrl = "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI";
    String jsonResponse = restTemplate.getForObject(hnUrl, String.class);
    // Parse hits...
} catch (Exception e) {
    System.err.println("Failed to fetch news from Hacker News API: " + e.getMessage());
    // Service continues without throwing or aborting scheduled loop
}
```
If both remote sources fail or return zero new items, the scheduler automatically invokes `generateSimulatedArticle()`, preserving uninterrupted system functionality.

---

## 4. Frontend Error Handling & Simulation Fallback

### 4.1 Transparent Offline Graceful Degradation
In `frontend/src/app/services/learning.service.ts`:
```typescript
try {
  const [toolsRes, newsRes] = await Promise.all([
    fetch(`${this.apiUrl}/tools`),
    fetch(`${this.apiUrl}/news`)
  ]);
  if (!toolsRes.ok || !newsRes.ok) throw new Error('API degraded');
  // Populate signals...
} catch (err) {
  console.warn('Backend server is offline, continuing in simulation mode.', err);
  // Revert to comprehensive mock dataset
  this.tools.set(mockTools);
  this.news.set(mockNews);
  this.syncSimulationRoadmap();
}
```
Users can explore every tab, take quizzes, bookmark items, and generate social posts with zero crashes or blank error screens.

### 4.2 In-App Toast Notification Feedback
UI pages (`news-feed.component.ts`, `tools-directory.component.ts`) display non-blocking animated toast notifications for user actions:
- `success`: Green glow backdrop (`bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald`).
- `info`: Cyan glow backdrop (`bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan`).
- Automatically dismissed via `setTimeout` after 3,000 ms.

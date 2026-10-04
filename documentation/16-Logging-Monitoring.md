# Logging & Monitoring – AS-IS Specification

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** LOG-AS-IS-016  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Implemented Logging & Monitoring (AS-IS)

### 1.1 Logging Implementation
The current implementation utilizes standard logging mechanisms:

1. **Spring Boot Logback & SLF4J:**
   - Active across all Spring Boot services (`auth-service`, `learning-service`, `tools-news-service`, `gateway-service`, `discovery-server`).
   - Standard output formatting: Timestamp, Log Level, Process ID, Thread Name, Logger Name, and Message.
   - **SQL Statement Logging:** Explicitly enabled via `spring.jpa.show-sql: true` in `application.yml` for real-time visibility into generated Hibernate SQL queries during execution.
2. **Standard Console Output Streams:**
   - `NewsSyncScheduler.java` utilizes `System.out.println()` to record scheduled sync execution:
     - `"Executing 5-minute background sync for trending news..."`
     - `"Application started. Performing initial news synchronization..."`
     - `"Synchronized completed. Ingested/Updated X articles."`
   - `NewsSyncScheduler.java` outputs error messages via `System.err.println()` upon external API communication issues.
   - `server.js` (`social-image-service`) logs server start and Sharp render errors via `console.error()`.
3. **Frontend Client Telemetry:**
   - `learning.service.ts` emits contextual console warnings (`console.warn('Backend server is offline, continuing in simulation mode.')`) when API endpoints are unreachable.

### 1.2 Health Checks & Service Monitoring
1. **Container Healthchecks (`docker-compose.yml`):**
   - **`mysql-db`:** Evaluated every 10 seconds using native ping:
     ```yaml
     test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-padmin1234"]
     interval: 10s
     timeout: 5s
     retries: 5
     ```
   - **`discovery-server`:** Evaluated every 10 seconds via HTTP probe:
     ```yaml
     test: ["CMD", "wget", "--spider", "-q", "http://localhost:8761/actuator/health", "||", "wget", "--spider", "-q", "http://localhost:8761/"]
     ```
2. **Eureka Discovery Dashboard:**
   - Active web console on `http://localhost:8761`.
   - Real-time display of registered service instances, lease expiration renewal times, memory usage, and availability status.

---

## 2. Monitoring Gaps & Limitations (AS-IS)

| Area | Current Implementation State | Risk / Limitation |
|---|---|---|
| **Distributed Tracing** | Not Implemented | Cross-service requests through Gateway to microservices cannot be correlated via a single trace ID. |
| **Centralized Log Aggregation** | Not Implemented | Logs are emitted independently to stdout per container/process; no Elasticsearch/Fluentd/Loki cluster exists. |
| **Metrics Collection** | Partially Implemented (Actuator dependencies in pom.xml, no Prometheus scraping) | No time-series metric dashboards (Grafana) tracking memory heap, CPU spikes, or HTTP p99 latencies. |
| **Alerting** | Not Implemented | No automated alerts (PagerDuty, Slack, Email) fire on service downtime or database disconnections. |

---

## 3. Recommended Observability Strategy (TO-BE)

1. **Distributed Tracing with Micrometer & OpenTelemetry:**
   - Add `micrometer-tracing-bridge-brave` and `zipkin-reporter-brave` to parent `pom.xml` to propagate W3C `traceparent` headers through Spring Cloud Gateway down to microservices.
2. **Prometheus Metrics Endpoint:**
   - Expose `management.endpoints.web.exposure.include=health,info,metrics,prometheus` in all microservice `application.yml` files.
3. **Structured JSON Logging:**
   - Configure Logback `LogstashEncoder` to emit structured JSON logs with correlation IDs (`traceId`, `spanId`, `userId`) for automated ingestion into Grafana Loki or ELK.

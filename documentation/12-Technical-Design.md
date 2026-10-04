# Technical Design – Technology Stack & Configurations

**Project:** AI Learning Tracker & Ecosystem Hub  
**Document ID:** TED-AS-IS-012  
**System Status:** Implemented & Operational  
**Analysis Date:** October 2026  

---

## 1. Concrete Technology Stack Inventory

All versions below are directly verified from project configuration files (`pom.xml`, `package.json`, `Dockerfile`, `docker-compose.yml`).

| Architecture Layer | Technology | Exact Version | Configuration Evidence | Purpose & Responsibility |
|---|---|---|---|---|
| **Frontend Framework** | Angular | `22.2.0` | `frontend/package.json` | Modern component UI using standalone primitives and signals. |
| **Frontend Language** | TypeScript | `~6.0.2` | `frontend/package.json` | Static typing and interfaces for frontend. |
| **Frontend Bundler** | `@angular/build` (esbuild / Vite) | `22.2.1` | `frontend/package.json` | High-speed compilation and hot-module replacement. |
| **Frontend Styling** | Tailwind CSS | `^3.4.19` | `frontend/package.json` | Utility styling and responsive design. |
| **Frontend Icons** | `@lucide/angular` | `^1.51.0` | `frontend/package.json` | Modern SVG iconography. |
| **Backend Runtime** | Java JDK (Eclipse Temurin) | `21` | `backend/pom.xml:16` | LTS Java runtime with virtual threads support. |
| **Backend Framework** | Spring Boot | `3.3.4` | `backend/pom.xml:20` | Core enterprise microservices framework. |
| **Service Mesh / Cloud** | Spring Cloud | `2023.0.3` (Leyton)| `backend/pom.xml:21` | Eureka Discovery and Cloud Gateway. |
| **Build Automation** | Apache Maven | `3.13.0` (Compiler)| `backend/pom.xml:71` | Multi-module build management and jar packaging. |
| **Auxiliary Backend** | Node.js / Express | `Node 20 / Express 4.x` | `social-image-service/package.json` | High-speed image rasterizer worker. |
| **Image Engine** | Sharp / libvips | `sharp ^0.33.x` | `social-image-service/package.json` | SVG to PNG/JPEG rasterization. |
| **Relational Database** | MySQL Server | `8.0` | `docker-compose.yml:5` | ACID persistent relational storage. |
| **Container Engine** | Docker & Compose | Compose `3.8` | `docker-compose.yml:1` | Multi-container local orchestration. |
| **Orchestration Mesh**| Kubernetes | v1 Core / Apps | `k8s/*.yaml` | Production cluster container orchestration. |
| **Continuous Integration**| GitHub Actions | v4 Actions | `.github/workflows/ci-cd.yml`| Automated Maven tests and frontend builds. |

---

## 2. Port Allocation & Network Matrix

| Service Identifier | Runtime Engine | Internal Port | External Host Port | Primary Protocol | URL Endpoint |
|---|---|---|---|---|---|
| `frontend` | Vite / Nginx | `5173` (Dev) / `80` (Prod) | `5173` / `80` | HTTP | `http://localhost:5173` |
| `gateway-service` | Spring Cloud Gateway (Netty) | `8080` | `8080` | HTTP / REST / SSE | `http://localhost:8080` |
| `discovery-server` | Spring Cloud Netflix Eureka | `8761` | `8761` | HTTP (Discovery) | `http://localhost:8761` |
| `auth-service` | Spring Boot (Tomcat) | `8081` | `8081` | HTTP / REST | `http://localhost:8081` |
| `learning-service` | Spring Boot (Tomcat) | `8082` | `8082` | HTTP / REST | `http://localhost:8082` |
| `tools-news-service` | Spring Boot (Tomcat) | `8083` | `8083` | HTTP / REST / SSE | `http://localhost:8083` |
| `social-image-service`| Node.js (Express) | `8084` | `8084` | HTTP / REST | `http://localhost:8084` |
| `mysql-db` | MySQL 8.0 Daemon | `3306` | `3306` | MySQL TCP (JDBC) | `localhost:3306` |

---

## 3. Configuration Management

Configuration is hierarchically resolved through Spring Boot's externalized configuration mechanisms:

1. **Default Profiles (`application.yml`):**
   - Packaged inside `src/main/resources` within each service module.
   - Configures default database URLs targeting `localhost:3306`.
2. **Container Profiles (Environment Overrides):**
   - Configured in `docker-compose.yml` and `k8s/configmap.yaml`.
   - Overrides datasource URLs targeting container names:
     `SPRING_DATASOURCE_URL=jdbc:mysql://mysql-db:3306/ai_auth_db?...`
   - Overrides Eureka client default zone:
     `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://discovery-server:8761/eureka/`
3. **Hibernate Auto-DDL:**
   - Configured as `spring.jpa.hibernate.ddl-auto: update` across all microservices, allowing JPA entities to validate and update database tables on startup.

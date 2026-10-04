# GitHub Copilot Agentic SDLC Lifecycle Map

This document establishes the end-to-end mapping between the **Software Development Lifecycle (SDLC) stages** and the **Standardized GitHub Copilot Agents** (`.github/agents/*.agent.md`).

---

## SDLC Phase Mapping Overview

```
+---------------------------------------------------------------------------------------------------------+
|                                        SDLC LIFECYCLE TOPOLOGY                                          |
+---------------------------------------------------------------------------------------------------------+
| Phase 1: Product Discovery & Requirements                                                                |
| ├── product-manager.agent.md                                                                            |
| ├── business-analyst.agent.md                                                                           |
| ├── requirements-engineer.agent.md                                                                      |
| └── requirements-validator.agent.md                                                                     |
|     └── Gate: GATE-01 (Requirements Gate)                                                               |
+---------------------------------------------------------------------------------------------------------+
| Phase 2: Architecture & System Design                                                                    |
| ├── solution-architect.agent.md                                                                         |
| ├── software-architect.agent.md                                                                         |
| ├── architecture-reviewer.agent.md                                                                      |
| ├── hld-designer.agent.md                                                                               |
| ├── lld-designer.agent.md                                                                               |
| ├── database-designer.agent.md                                                                          |
| ├── database-developer.agent.md                                                                         |
| ├── api-designer.agent.md                                                                               |
| └── integration-designer.agent.md                                                                       |
|     └── Gate: GATE-02 (Architecture Gate) & GATE-03 (Design Gate)                                        |
+---------------------------------------------------------------------------------------------------------+
| Phase 3: Implementation & Development                                                                    |
| ├── frontend-developer.agent.md                                                                         |
| ├── backend-developer.agent.md                                                                          |
| ├── database-developer.agent.md                                                                         |
| └── ai-engineer.agent.md                                                                                |
|     └── Gate: GATE-04 (Development Clean Build Gate)                                                     |
+---------------------------------------------------------------------------------------------------------+
| Phase 4: Quality Assurance & Code Review                                                                |
| ├── code-reviewer.agent.md                                                                              |
| └── test-engineer.agent.md                                                                              |
|     └── Gate: GATE-05 (Code Review Gate) & GATE-06 (Testing Quality Gate)                                |
+---------------------------------------------------------------------------------------------------------+
| Phase 5: DevSecOps, Security & Performance                                                              |
| ├── security-engineer.agent.md                                                                          |
| └── performance-engineer.agent.md                                                                       |
|     └── Gate: GATE-07 (Security Gate) & GATE-08 (Performance Gate)                                       |
+---------------------------------------------------------------------------------------------------------+
| Phase 6: Cloud Platform, Delivery & Documentation                                                       |
| ├── devops-engineer.agent.md                                                                            |
| ├── cloud-engineer.agent.md                                                                             |
| └── documentation-engineer.agent.md                                                                     |
|     └── Supporting artifact updates across all phases                                                   |
+---------------------------------------------------------------------------------------------------------+
| Phase 7: Release & Production Deployment                                                                 |
| └── release-manager.agent.md                                                                            |
|     └── Gate: GATE-09 (Release Readiness Gate) & GATE-10 (Production Deployment Gate)                    |
+---------------------------------------------------------------------------------------------------------+
| Phase 8: Operations, Observability & Incident Response                                                   |
| ├── sre-engineer.agent.md                                                                               |
| └── incident-manager.agent.md                                                                           |
+---------------------------------------------------------------------------------------------------------+
```

---

## Detailed SDLC Stage Specifications

### Stage 1: Product Discovery & Strategy
- **Lead Agent**: `product-manager.agent.md`
- **Collaborating Agents**: `business-analyst.agent.md`, `software-engineering-orchestrator.agent.md`
- **Deliverables**: PRD (`.context/product/prd.md`), personas, roadmap, MoSCoW prioritization.
- **Exit Criteria**: PRD published with clear user personas and MVP boundaries.

### Stage 2: Business Analysis & Domain Modeling
- **Lead Agent**: `business-analyst.agent.md`
- **Collaborating Agents**: `product-manager.agent.md`, `requirements-engineer.agent.md`
- **Deliverables**: BPMN Process Workflows, Business Rules (`BR-XXX`), Ubiquitous Domain Dictionary, Gap Analysis.
- **Exit Criteria**: End-to-end workflows and business rules documented in `.context/requirements/`.

### Stage 3: Requirements Engineering & User Story Decomposition
- **Lead Agent**: `requirements-engineer.agent.md`
- **Auditing Agent**: `requirements-validator.agent.md`
- **Deliverables**: SRS (`FR-XXX`, `NFR-XXX`), INVEST User Stories, Gherkin acceptance criteria, Traceability Matrix.
- **Quality Gate**: **GATE-01 (Requirements Gate)** — Audited and certified by `requirements-validator.agent.md`.

### Stage 4: Architecture & Technology Strategy
- **Lead Agents**: `solution-architect.agent.md` & `software-architect.agent.md`
- **Auditing Agent**: `architecture-reviewer.agent.md`
- **Deliverables**: Solution Architecture Blueprint, C4 models, ADRs (`.context/decisions/`).
- **Quality Gate**: **GATE-02 (Architecture Gate)** — Bounded contexts verified, ADRs accepted.

### Stage 5: Detailed System Design (HLD & LLD)
- **Lead Agents**: `hld-designer.agent.md`, `lld-designer.agent.md`, `database-designer.agent.md`, `api-designer.agent.md`, `integration-designer.agent.md`
- **Deliverables**: HLD topology, LLD class diagrams, Mermaid sequence flows, ERDs, OpenAPI 3.0 spec, event schemas.
- **Quality Gate**: **GATE-03 (Design Gate)** — Sequence diagrams complete, OpenAPI spec linted, ERD published.

### Stage 6: Implementation & Development
- **Lead Agents**: `backend-developer.agent.md`, `frontend-developer.agent.md`, `database-developer.agent.md`, `ai-engineer.agent.md`
- **Deliverables**: Clean Java 21 / Spring Boot code, Angular 22 components, Flyway migrations (`V*__*.sql`), AI pipelines.
- **Quality Gate**: **GATE-04 (Development Clean Build Gate)** — Zero compilation errors, spotless formatting.

### Stage 7: Code Review & Quality Assurance
- **Lead Agents**: `code-reviewer.agent.md` & `test-engineer.agent.md`
- **Deliverables**: PR Review Scorecards, Integration tests (Testcontainers), E2E tests (Playwright), JaCoCo reports.
- **Quality Gates**:
  - **GATE-05 (Code Review Gate)**: Verified clean code and SOLID compliance by `code-reviewer.agent.md`.
  - **GATE-06 (Testing Gate)**: Line and branch coverage >= 80%, 100% pass rate by `test-engineer.agent.md`.

### Stage 8: DevSecOps, Security & Performance Engineering
- **Lead Agents**: `security-engineer.agent.md` & `performance-engineer.agent.md`
- **Deliverables**: STRIDE threat models, SAST/SCA reports, secret scans, k6 load testing benchmarks, JVM profiling.
- **Quality Gates**:
  - **GATE-07 (Security Gate)**: Zero Critical/High CVEs, clean secret scan by `security-engineer.agent.md`.
  - **GATE-08 (Performance Gate)**: Latency P95 meets SLA (< 200ms), throughput >= 500 RPS by `performance-engineer.agent.md`.

### Stage 9: CI/CD, Cloud & Living Documentation
- **Lead Agents**: `devops-engineer.agent.md`, `cloud-engineer.agent.md`, `documentation-engineer.agent.md`
- **Deliverables**: GitHub Actions CI/CD workflows, multi-stage Dockerfiles, Terraform IaC, K8s manifests, `CHANGELOG.md`.

### Stage 10: Release Management & Production Delivery
- **Lead Agent**: `release-manager.agent.md`
- **Deliverables**: Pre-flight checks, human release authorization, progressive Canary rollout (5%->100%), automated rollback plan.
- **Quality Gates**:
  - **GATE-09 (Release Readiness Gate)**: Upstream gates 01-08 verified green, pre-flight certified.
  - **GATE-10 (Production Gate)**: Canary healthy, error rate < 0.01%, git release tagged (`vX.Y.Z`).

### Stage 11: Production Observability & Incident Response
- **Lead Agents**: `sre-engineer.agent.md` & `incident-manager.agent.md`
- **Deliverables**: SLIs/SLOs, Prometheus multi-burn-rate alerts, Grafana dashboards, OpenTelemetry traces, blameless 5 Whys RCAs.

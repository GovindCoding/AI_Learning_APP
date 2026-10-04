# Enterprise GitHub Copilot Agent Ecosystem

## 1. Overview & Vision

This repository hosts a production-grade, standardized **GitHub Copilot Custom Agent Ecosystem** located directly in `.github/agents/`. It transforms software engineering from fragmented AI chat interactions into a coordinated, discoverable, and enterprise-governed organization of specialized AI agents supporting the complete Software Development Lifecycle (SDLC).

All agents follow the standard **GitHub Copilot `.agent.md` format**, featuring:
1. **GitHub Copilot-compatible YAML frontmatter** (`name`, `description`).
2. **A standardized 22-section markdown structure** enforcing clear roles, responsibilities, scope, inputs/outputs, engineering standards, quality gates, security rules, human approval triggers, and failure handling.
3. **Zero nested directories**: all agents live directly under `.github/agents/` for instant discoverability in GitHub Copilot Chat and CLI.
4. **Existing-software first**: technology-aware behavior adapting dynamically to the repository's stack (Java 21, Spring Boot 3.3.4, Angular 22, MySQL 8.0, Docker, Kubernetes).

---

## 2. GitHub Copilot Agent Hierarchy & Catalog

```
                         ┌──────────────────────────────────────────────┐
                         │   software-engineering-orchestrator.agent.md │
                         └──────────────────────┬───────────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
   Product & Requirements               Architecture & Design                     Engineering
   ├── product-manager.agent.md         ├── solution-architect.agent.md           ├── frontend-developer.agent.md
   ├── business-analyst.agent.md        ├── software-architect.agent.md           ├── backend-developer.agent.md
   ├── requirements-engineer.agent.md   ├── architecture-reviewer.agent.md        ├── database-developer.agent.md
   └── requirements-validator.agent.md  ├── hld-designer.agent.md                 └── ai-engineer.agent.md
                                        ├── lld-designer.agent.md
                                        ├── database-designer.agent.md
                                        ├── api-designer.agent.md
                                        └── integration-designer.agent.md
                                                │
                                                ▼
                                         Quality & Security
                                         ├── code-reviewer.agent.md
                                         ├── test-engineer.agent.md
                                         ├── security-engineer.agent.md
                                         └── performance-engineer.agent.md
                                                │
                                                ▼
                                         Delivery & Operations
                                         ├── devops-engineer.agent.md
                                         ├── cloud-engineer.agent.md
                                         ├── release-manager.agent.md
                                         ├── sre-engineer.agent.md
                                         ├── incident-manager.agent.md
                                         └── documentation-engineer.agent.md
```

---

## 3. Master Agent Directory

| Agent File | Role | Primary Capability | When to Use |
|---|---|---|---|
| [`software-engineering-orchestrator.agent.md`](./software-engineering-orchestrator.agent.md) | Orchestrator | Full SDLC workflow coordination & quality gates | Multi-phase initiatives, task decomposition, agent sequencing |
| [`product-manager.agent.md`](./product-manager.agent.md) | Product Manager | Product vision, PRDs, MVP boundaries, MoSCoW | New features, PRD authoring, backlog prioritization |
| [`business-analyst.agent.md`](./business-analyst.agent.md) | Business Analyst | BPMN workflows, business rules (`BR-XXX`), domain dictionary | Process modeling, decision tables, brownfield gap analysis |
| [`requirements-engineer.agent.md`](./requirements-engineer.agent.md) | Requirements Engineer | SRS (`FR/NFR`), INVEST user stories, Gherkin criteria | Technical requirements authoring, story splitting, traceability |
| [`requirements-validator.agent.md`](./requirements-validator.agent.md) | Requirements Validator | Ambiguity detection, INVEST scoring, GATE-01 audit | Requirements quality audit, testability checks, GATE-01 sign-off |
| [`solution-architect.agent.md`](./solution-architect.agent.md) | Solution Architect | Macro system topology, technology radar, ADRs | System-wide architecture, tech stack trade-offs, GATE-02 |
| [`software-architect.agent.md`](./software-architect.agent.md) | Software Architect | Clean Architecture, C4 diagrams, layer boundaries | Component architecture, C4 models, cross-cutting patterns |
| [`architecture-reviewer.agent.md`](./architecture-reviewer.agent.md) | Architecture Reviewer | Architectural compliance, circular dependencies, ADR drift | Structural PR review, import graph auditing, decoupling |
| [`hld-designer.agent.md`](./hld-designer.agent.md) | HLD Designer | High-Level Design (HLD), data flows, failure domains | Subsystem topologies, inter-service protocols, GATE-03 |
| [`lld-designer.agent.md`](./lld-designer.agent.md) | LLD Designer | Low-Level Design (LLD), class models, GoF patterns | Detailed class hierarchies, sequence diagrams, method signatures |
| [`database-designer.agent.md`](./database-designer.agent.md) | Database Designer | Relational data modeling (3NF), ERDs, Data Dictionary | Schema design, entity relationships, constraint modeling |
| [`database-developer.agent.md`](./database-developer.agent.md) | Database Developer | Flyway SQL migrations, query optimization, EXPLAIN | Versioned migrations (`V*__*.sql`), index design, DB safety |
| [`api-designer.agent.md`](./api-designer.agent.md) | API Designer | OpenAPI 3.0 specs, RESTful URIs, RFC 7807 error models | API contract design, schema linting, Prism mock servers |
| [`integration-designer.agent.md`](./integration-designer.agent.md) | Integration Designer | Asynchronous events, Kafka/RabbitMQ schemas, Outbox | Pub/sub architectures, DLQ retry policies, webhook HMAC |
| [`frontend-developer.agent.md`](./frontend-developer.agent.md) | Frontend Developer | Angular 22, TypeScript, Tailwind CSS, Signals, RxJS | UI components, views, reactive forms, WCAG accessibility |
| [`backend-developer.agent.md`](./backend-developer.agent.md) | Backend Developer | Java 21, Spring Boot 3.3.4, JPA, Spring Security | REST endpoints, transactional services, JUnit 5/Mockito, GATE-04 |
| [`ai-engineer.agent.md`](./ai-engineer.agent.md) | AI Systems Engineer | Spring AI, LangChain, RAG, prompt catalogs, guardrails | LLM integrations, prompt engineering, vector search, safety |
| [`code-reviewer.agent.md`](./code-reviewer.agent.md) | Code Reviewer | PR inspection, Clean Code, SOLID, static analysis | PR review scorecards, code smell detection, GATE-05 |
| [`test-engineer.agent.md`](./test-engineer.agent.md) | Test Engineer | Integration (Testcontainers), API, Playwright E2E | Multi-layer test automation, >= 80% coverage, GATE-06 |
| [`security-engineer.agent.md`](./security-engineer.agent.md) | Security Engineer | STRIDE threat modeling, SAST, SCA, container security | Vulnerability scanning, secret detection, GATE-07 |
| [`performance-engineer.agent.md`](./performance-engineer.agent.md) | Performance Engineer | k6/JMeter load benchmarks, JVM flame graphs, latency SLAs | Load/stress testing, profiling bottlenecks, GATE-08 |
| [`devops-engineer.agent.md`](./devops-engineer.agent.md) | DevOps Engineer | CI/CD pipelines, multi-stage Dockerfiles, Syft SBOMs | GitHub Actions workflows, container packaging, docker-compose |
| [`cloud-engineer.agent.md`](./cloud-engineer.agent.md) | Cloud Engineer | Terraform IaC, Kubernetes manifests, Helm, HPA, FinOps | Cluster provisioning, K8s manifests, network policies |
| [`release-manager.agent.md`](./release-manager.agent.md) | Release Manager | Release readiness, dual-human sign-off, Canary rollouts | Production deployments, automated rollbacks, GATE-09/10 |
| [`sre-engineer.agent.md`](./sre-engineer.agent.md) | SRE Engineer | SLIs/SLOs, Prometheus burn-rate alerts, Grafana | Production observability, error budgets, distributed tracing |
| [`incident-manager.agent.md`](./incident-manager.agent.md) | Incident Manager | Incident command, emergency runbooks, blameless RCA | Outage triage, status communication, 5 Whys post-mortems |
| [`documentation-engineer.agent.md`](./documentation-engineer.agent.md) | Documentation Engineer | Living technical docs, Mermaid diagrams, release notes | Docs-as-Code maintenance, runbooks, CHANGELOG.md sync |

---

## 4. Standard Agent File Specification

Every agent follows the strict 22-section GitHub Copilot specification:

```markdown
---
name: <Agent Name>
description: <Concise, actionable description of primary capability>
---

# <Agent Name>

## Role
## Mission
## Responsibilities
## Scope
## Out of Scope
## When to Use
## When Not to Use
## Inputs
## Outputs
## Workflow
## Engineering Standards
## Project Context
## Tools
## Validation
## Quality Gates
## Security
## Human Approval
## Agent Handoffs
## Failure Handling
## Forbidden Actions
## Completion Checklist
## Output Format
```

---

## 5. Quality Gate Enforcement Architecture

The ecosystem enforces deterministic progression across 10 SDLC quality gates:

```
[GATE-01: Requirements]  -> Verified by requirements-validator.agent.md
[GATE-02: Architecture]  -> Verified by solution-architect.agent.md
[GATE-03: Design]        -> Verified by hld-designer.agent.md & api-designer.agent.md
[GATE-04: Clean Build]   -> Verified by backend-developer.agent.md & frontend-developer.agent.md
[GATE-05: Code Review]   -> Verified by code-reviewer.agent.md
[GATE-06: Testing]       -> Verified by test-engineer.agent.md (Coverage >= 80%)
[GATE-07: Security]      -> Verified by security-engineer.agent.md (Zero High/Crit CVEs)
[GATE-08: Performance]   -> Verified by performance-engineer.agent.md (P95 Latency SLA)
[GATE-09: Release Ready] -> Verified by release-manager.agent.md (Pre-flight & Human Sign-off)
[GATE-10: Production]    -> Verified by release-manager.agent.md & sre-engineer.agent.md
```

---

## 6. How to Use in GitHub Copilot Chat

To select an agent in GitHub Copilot Chat, reference the agent by name or capability:

- `@software-engineering-orchestrator`: "Plan and orchestrate the implementation of a new quiz evaluation service."
- `@product-manager`: "Draft a PRD for an AI code explanation feature with MoSCoW prioritization."
- `@api-designer`: "Design an OpenAPI 3.0 spec for the course enrollment endpoint with RFC 7807 error models."
- `@backend-developer`: "Implement the QuizSubmissionService in Spring Boot 3.3.4 with @Transactional boundaries."
- `@frontend-developer`: "Create the Angular 22 standalone QuizSubmissionComponent with Signals and Tailwind CSS."
- `@code-reviewer`: "Review this Pull Request diff for SOLID principles, cyclomatic complexity, and test quality."
- `@test-engineer`: "Author an integration test for the course enrollment repository using Testcontainers MySQL."
- `@security-engineer`: "Perform a STRIDE threat model and SAST audit on the authentication filter."
- `@release-manager`: "Perform pre-flight GATE-09 verification and prepare canary rollout plan for v1.0.0."

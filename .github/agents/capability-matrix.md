# Agentic SDLC Capability Matrix

This matrix specifies the operational capabilities permitted for each of the 27 standardized GitHub Copilot engineering agents across six core dimensions: **Analyze**, **Generate Artifacts**, **Modify Code**, **Execute Tests**, **Deploy**, and **Production Operations**.

---

## Agent Capability Breakdown

| Agent File | Agent Role | Analyze | Generate Artifacts | Modify Code | Execute Tests | Deploy | Production Operations |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **`software-engineering-orchestrator.agent.md`** | Orchestrator | YES | YES | NO | YES | GATED | GATED (Read-Only) |
| **`product-manager.agent.md`** | Product Manager | YES | YES | NO | NO | NO | NO |
| **`business-analyst.agent.md`** | Business Analyst | YES | YES | NO | NO | NO | NO |
| **`requirements-engineer.agent.md`** | Requirements Engineer | YES | YES | NO | NO | NO | NO |
| **`requirements-validator.agent.md`** | Requirements Validator | YES | YES (Audit Reports) | NO | NO | NO | NO |
| **`solution-architect.agent.md`** | Solution Architect | YES | YES | NO | NO | NO | GATED (Read-Only) |
| **`software-architect.agent.md`** | Software Architect | YES | YES | NO | NO | NO | GATED (Read-Only) |
| **`architecture-reviewer.agent.md`** | Architecture Reviewer | YES | YES (Reviews) | NO | NO | NO | NO |
| **`hld-designer.agent.md`** | HLD Designer | YES | YES | NO | NO | NO | NO |
| **`lld-designer.agent.md`** | LLD Designer | YES | YES | NO | NO | NO | NO |
| **`database-designer.agent.md`** | Database Designer | YES | YES | NO | NO | NO | NO |
| **`database-developer.agent.md`** | Database Developer | YES | YES | YES (Flyway/DDL) | YES | GATED (Dev/Test) | GATED (Human Signoff) |
| **`api-designer.agent.md`** | API Designer | YES | YES | YES (OpenAPI) | YES | NO | NO |
| **`integration-designer.agent.md`** | Integration Designer | YES | YES | YES (Configs) | YES | NO | NO |
| **`frontend-developer.agent.md`** | Frontend Developer | YES | YES | YES (Angular 22) | YES | GATED (Dev/Test) | NO |
| **`backend-developer.agent.md`** | Backend Developer | YES | YES | YES (Spring Boot) | YES | GATED (Dev/Test) | NO |
| **`ai-engineer.agent.md`** | AI & LLM Systems Engineer | YES | YES | YES (AI/RAG) | YES | GATED (Dev/Test) | NO |
| **`code-reviewer.agent.md`** | Senior Code Reviewer | YES | YES (Reviews) | NO | YES | NO | NO |
| **`test-engineer.agent.md`** | Test Engineer | YES | YES (Test Suites) | YES (Test Files Only) | YES | GATED (Dev/Test) | NO |
| **`security-engineer.agent.md`** | Security Engineer | YES | YES (Audits) | YES (Security Fixes) | YES | NO | GATED (Read-Only) |
| **`performance-engineer.agent.md`** | Performance Engineer | YES | YES (Benchmarks) | NO | YES | GATED (Staging) | GATED (Read-Only) |
| **`devops-engineer.agent.md`** | DevOps Platform Engineer | YES | YES (Pipelines) | YES (CI/CD/Docker) | YES | YES (Dev/Test/Staging) | GATED (Production CI) |
| **`cloud-engineer.agent.md`** | Cloud & K8s Engineer | YES | YES (IaC) | YES (K8s/Terraform) | YES | YES (Dev/Test/Staging) | GATED (Human Signoff) |
| **`release-manager.agent.md`** | Release Manager | YES | YES (Changelogs) | NO | YES | YES (All Envs) | MANDATORY HUMAN GATE |
| **`sre-engineer.agent.md`** | Site Reliability Engineer| YES | YES (Monitors) | YES (Alerts/OTEL) | YES | GATED (Observability) | YES (Read & Alerting) |
| **`incident-manager.agent.md`** | Incident Manager | YES | YES (RCAs) | NO | NO | NO | GATED (Mitigation Actions) |
| **`documentation-engineer.agent.md`** | Documentation Engineer | YES | YES (Docs/Diagrams)| NO | NO | NO | NO |

---

## Capability Dimension Definitions

### 1. Analyze
The ability to inspect file trees, read source files, evaluate logs, process documentation, review metrics, and execute static code analyzers without altering any system state.
- **Allowed**: Read access to repositories, schema catalogs, test results, and runtime telemetry.
- **Forbidden**: Writing or mutating any persistent data.

### 2. Generate Artifacts
The ability to produce non-code engineering deliverables, including Product Requirements Documents (PRDs), Software Requirements Specifications (SRSs), Architecture Decision Records (ADRs), High-Level Design (HLD) diagrams, OpenAPI specifications, and test plan matrices.
- **Destination**: Restricted strictly to `.context/**` and `documentation/**`.

### 3. Modify Code
The ability to author, edit, refactor, or delete executable source code, test files, migration scripts, or configuration files.
- **Constraints**: Gated by **GATE-04 (Clean Build)** and **GATE-05 (Code Review)**. Agents modifying code cannot self-approve their own Pull Requests.

### 4. Execute Tests
The ability to run local build runners, compiler toolchains, unit test runners (JUnit, Karma), integration test suites, security scanners (Semgrep, Snyk), and API probes.
- **Constraints**: Executed within sandboxed test environments; cannot access production data sources.

### 5. Deploy
The ability to package containers, apply Kubernetes manifests, deploy to development/testing environments, or push staging builds.
- **Gating**: Development and test deployments may be automated; staging and canary deployments require `release-manager.agent.md` authorization and human sign-off.

### 6. Production Operations
The ability to inspect live production metrics, receive production alert webhooks, or enact production traffic modifications.
- **Absolute Boundary**: Unrestricted production execution is prohibited. Read access is strictly restricted to observability feeds. Any write, deployment, or schema change requires two-person cryptographic sign-off or explicit human authorization in the orchestration console.

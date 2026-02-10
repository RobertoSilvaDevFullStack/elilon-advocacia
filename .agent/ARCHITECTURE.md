# Antigravity Kit Architecture

> Comprehensive AI Agent Capability Expansion Toolkit

---

## 📋 Overview

Antigravity Kit is a modular system consisting of:

- **19 Specialist Agents** - Role-based AI personas
- **36 Skills** - Domain-specific knowledge modules
- **11 Workflows** - Slash command procedures

---

## 🏗️ Directory Structure

```plaintext
.agent/
├── ARCHITECTURE.md          # This file
├── agents/                  # 19 Specialist Agents
├── skills/                  # 36 Skills
├── workflows/               # 11 Slash Commands
├── rules/                   # Global Rules
└── scripts/                 # Master Validation Scripts
```

---

## 🤖 Agents (19)

Specialist AI personas for different domains.

| Agent                    | Focus                      | Skills Used                                          |
| ------------------------ | -------------------------- | ---------------------------------------------------- |
| `orchestrator`           | Multi-agent coordination   | parallel-agents, behavioral-modes                    |
| `project-planner`        | Discovery, task planning   | brainstorming, plan-writing, architecture            |
| `frontend-specialist`    | Web UI/UX                  | frontend-design, react-patterns, tailwind-patterns   |
| `backend-specialist`     | API, business logic        | api-patterns, nodejs-best-practices, database-design |
| `database-architect`     | Schema, SQL                | database-design, prisma-expert                       |
| `mobile-developer`       | iOS, Android, RN           | mobile-design                                        |
| `game-developer`         | Game logic, mechanics      | game-development                                     |
| `devops-engineer`        | CI/CD, Docker              | deployment-procedures, docker-expert                 |
| `security-auditor`       | Security compliance        | vulnerability-scanner, red-team-tactics              |
| `penetration-tester`     | Offensive security         | red-team-tactics                                     |
| `test-engineer`          | Testing strategies         | testing-patterns, tdd-workflow, webapp-testing       |
| `debugger`               | Root cause analysis        | systematic-debugging                                 |
| `performance-optimizer`  | Speed, Web Vitals          | performance-profiling                                |
| `seo-specialist`         | Ranking, visibility        | seo-fundamentals, geo-fundamentals                   |
| `documentation-writer`   | Manuals, docs              | documentation-templates                              |
| `product-manager`        | Requirements, user stories | plan-writing, brainstorming                          |
| `qa-automation-engineer` | E2E testing, CI pipelines  | webapp-testing, testing-patterns                     |
| `code-archaeologist`     | Legacy code, refactoring   | clean-code, code-review-checklist                    |
| `explorer-agent`         | Codebase analysis          | -                                                    |

---

## 📚 Catálogo de Skills Antigravity

Este catálogo lista as skills disponíveis na pasta global `.antigravity/skills`. Elas podem ser carregadas sob demanda.

### 🛡️ Segurança Cibernética & Pen-testing

_Foco em auditoria, testes de intrusão e segurança defensiva/ofensiva._

| Skill                           | Descrição                                    |
| :------------------------------ | :------------------------------------------- |
| `active-directory-attacks`      | Testes de segurança em AD.                   |
| `api-fuzzing-bug-bounty`        | Fuzzing de APIs para bug bounty.             |
| `api-security-best-practices`   | Boas práticas de segurança para APIs.        |
| `aws-penetration-testing`       | Testes de invasão em ambientes AWS.          |
| `broken-authentication`         | Testes de falhas de autenticação.            |
| `burp-suite-testing`            | Uso do Burp Suite para testes web.           |
| `cloud-penetration-testing`     | Pen-test genérico em nuvem.                  |
| `ethical-hacking-methodology`   | Metodologias de hacking ético.               |
| `file-path-traversal`           | Detecção de vuln. Path Traversal.            |
| `file-uploads`                  | Testes de segurança em upload de arquivos.   |
| `html-injection-testing`        | Testes de injeção de HTML.                   |
| `idor-testing`                  | Testes de Insecure Direct Object References. |
| `linux-privilege-escalation`    | Escalação de privilégios em Linux.           |
| `metasploit-framework`          | Uso do Metasploit.                           |
| `pentest-checklist`             | Checklist geral para pentest.                |
| `pentest-commands`              | Comandos úteis para pentest.                 |
| `privilege-escalation-methods`  | Métodos gerais de escalação.                 |
| `red-team-tactics`              | Táticas de Red Team.                         |
| `red-team-tools`                | Ferramentas de Red Team.                     |
| `scanning-tools`                | Ferramentas de scan de vulnerabilidades.     |
| `shodan-reconnaissance`         | Reconhecimento usando Shodan.                |
| `smtp-penetration-testing`      | Testes em servidores de e-mail.              |
| `sql-injection-testing`         | Testes de SQL Injection.                     |
| `sqlmap-database-pentesting`    | Uso do SQLMap.                               |
| `ssh-penetration-testing`       | Testes em serviços SSH.                      |
| `top-web-vulnerabilities`       | As vulnerabilidades web mais críticas.       |
| `vulnerability-scanner`         | Escaneamento automatizado.                   |
| `windows-privilege-escalation`  | Escalação de privilégios em Windows.         |
| `wireshark-analysis`            | Análise de tráfego de rede.                  |
| `wordpress-penetration-testing` | Testes de segurança em WP.                   |
| `xss-html-injection`            | Cross-Site Scripting (XSS).                  |

### 💻 Desenvolvimento Web & Software

_Frameworks, linguagens, boas práticas e arquitetura._

#### Frontend

| Skill                        | Descrição                            |
| :--------------------------- | :----------------------------------- |
| `3d-web-experience`          | Criação de experiências 3D na web.   |
| `canvas-design`              | Manipulação de HTML5 Canvas.         |
| `cc-skill-frontend-patterns` | Padrões de código Frontend.          |
| `frontend-design`            | Design de interfaces web.            |
| `frontend-dev-guidelines`    | Diretrizes de desenvolvimento front. |
| `javascript-mastery`         | Técnicas avançadas de JS.            |
| `mobile-design`              | Design para dispositivos móveis.     |
| `nextjs-best-practices`      | Boas práticas em Next.js.            |
| `nextjs-supabase-auth`       | Autenticação Next.js + Supabase.     |
| `playwright-skill`           | Testes E2E com Playwright.           |
| `react-best-practices`       | Boas práticas em React.              |
| `react-patterns`             | Padrões de projeto React.            |
| `react-ui-patterns`          | Padrões de UI em React.              |
| `remotion-best-practices`    | Vídeo programático com Remotion.     |
| `scroll-experience`          | Experiências de scroll imersivas.    |
| `tailwind-patterns`          | Padrões de uso do Tailwind CSS.      |
| `typescript-expert`          | Especialista em TypeScript.          |
| `ui-ux-pro-max`              | UX/UI avançado.                      |
| `web-design-guidelines`      | Diretrizes gerais de Web Design.     |

#### Backend & Dados

| Skill                             | Descrição                           |
| :-------------------------------- | :---------------------------------- |
| `algolia-search`                  | Implementação de busca com Algolia. |
| `api-documentation-generator`     | Gerador de docs de API.             |
| `api-patterns`                    | Padrões de design de API.           |
| `aws-serverless`                  | Arquitetura Serverless na AWS.      |
| `azure-functions`                 | Serverless no Azure.                |
| `backend-dev-guidelines`          | Diretrizes de backend.              |
| `bullmq-specialist`               | Filas com BullMQ.                   |
| `bun-development`                 | Desenvolvimento com Bun runtime.    |
| `cc-skill-backend-patterns`       | Padrões de código Backend.          |
| `cc-skill-clickhouse-io`          | Banco de dados ClickHouse.          |
| `clerk-auth`                      | Autenticação com Clerk.             |
| `database-design`                 | Modelagem de banco de dados.        |
| `firebase`                        | Desenvolvimento com Firebase.       |
| `gcp-cloud-run`                   | Deploy no Google Cloud Run.         |
| `graphql`                         | APIs GraphQL.                       |
| `hubspot-integration`             | Integração com CRM Hubspot.         |
| `inngest`                         | Orquestração de eventos Inngest.    |
| `moodle-external-api-development` | Desenvolvimento para Moodle.        |
| `neon-postgres`                   | Postgres Serverless (Neon).         |
| `nestjs-expert`                   | Framework NestJS.                   |
| `nodejs-best-practices`           | Boas práticas Node.js.              |
| `prisma-expert`                   | ORM Prisma.                         |
| `python-patterns`                 | Padrões de linguagem Python.        |
| `salesforce-development`          | Desenvolvimento Salesforce.         |
| `segment-cdp`                     | Customer Data Platform (Segment).   |
| `server-management`               | Gerenciamento de servidores.        |
| `shopify-apps`                    | Apps para Shopify.                  |
| `shopify-development`             | Desenvolvimento de lojas Shopify.   |
| `stripe-integration`              | Pagamentos com Stripe.              |
| `trigger-dev`                     | Background jobs com Trigger.dev.    |
| `twilio-communications`           | SMS e Voz com Twilio.               |
| `upstash-qstash`                  | Mensageria Serverless.              |
| `zapier-make-patterns`            | Automação com Zapier/Make.          |

#### Arquitetura & Qualidade

| Skill                            | Descrição                                |
| :------------------------------- | :--------------------------------------- |
| `architecture`                   | Arquitetura de software geral.           |
| `cc-skill-coding-standards`      | Padrões de codificação.                  |
| `clean-code`                     | Princípios de Clean Code.                |
| `code-review-checklist`          | Checklist de revisão de código.          |
| `deployment-procedures`          | Procedimentos de deploy.                 |
| `design-patterns`                | Padrões de projeto.                      |
| `docker-expert`                  | Containers Docker.                       |
| `environment-setup-guide`        | Configuração de ambiente.                |
| `git-pushing`                    | Operações Git.                           |
| `github-workflow-automation`     | GitHub Actions.                          |
| `kaizen`                         | Melhoria contínua.                       |
| `lint-and-validate`              | Linting e validação.                     |
| `performance-profiling`          | Análise de performance.                  |
| `receiving-code-review`          | Como receber reviews.                    |
| `requesting-code-review`         | Como pedir reviews.                      |
| `senior-architect`               | Visão de arquiteto sênior.               |
| `software-architecture`          | Arquitetura de software.                 |
| `systematic-debugging`           | Debugging sistemático.                   |
| `tdd-workflow`                   | Desenvolvimento guiado por testes (TDD). |
| `test-driven-development`        | TDD.                                     |
| `test-fixing`                    | Correção de testes.                      |
| `testing-patterns`               | Padrões de teste.                        |
| `vercel-deployment`              | Deploy na Vercel.                        |
| `verification-before-completion` | Verificação antes de finalizar.          |
| `webapp-testing`                 | Testes de aplicações web.                |

### 🤖 IA, Agentes & LLMs

_Criação de agentes, engenharia de prompt e integração de IA._

| Skill                         | Descrição                              |
| :---------------------------- | :------------------------------------- |
| `agent-evaluation`            | Avaliação de agentes de IA.            |
| `agent-manager-skill`         | Gerenciamento de múltiplos agentes.    |
| `agent-memory-mcp`            | Memória para agentes (MCP).            |
| `agent-memory-systems`        | Sistemas de memória.                   |
| `agent-tool-builder`          | Criação de ferramentas para agentes.   |
| `ai-agents-architect`         | Arquitetura de agentes de IA.          |
| `ai-product`                  | Produtos de IA.                        |
| `ai-wrapper-product`          | Wrappers de IA.                        |
| `autonomous-agent-patterns`   | Padrões de agentes autônomos.          |
| `autonomous-agents`           | Desenvolvimento de agentes autônomos.  |
| `behavioral-modes`            | Modos de comportamento de IA.          |
| `computer-use-agents`         | Agentes que usam o computador.         |
| `context-window-management`   | Gestão de janela de contexto.          |
| `conversation-memory`         | Memória de conversação.                |
| `crewai`                      | Framework CrewAI.                      |
| `dispatching-parallel-agents` | Agentes paralelos.                     |
| `langfuse`                    | Observabilidade de LLMs.               |
| `langgraph`                   | Agentes com LangGraph.                 |
| `llm-app-patterns`            | Padrões de Apps com LLM.               |
| `loki-mode`                   | (Modo especial do assistente).         |
| `mcp-builder`                 | Construção de servidores MCP.          |
| `notebooklm`                  | Uso do NotebookLM.                     |
| `parallel-agents`             | Execução paralela.                     |
| `prompt-caching`              | Cache de prompts.                      |
| `prompt-engineer`             | Engenharia de prompt.                  |
| `prompt-engineering`          | Técnicas de prompt.                    |
| `prompt-library`              | Biblioteca de prompts.                 |
| `rag-engineer`                | RAG (Retrieval-Augmented Generation).  |
| `rag-implementation`          | Implementação de RAG.                  |
| `subagent-driven-development` | Desenvolvimento guiado por subagentes. |
| `using-superpowers`           | Uso de capacidades avançadas.          |
| `voice-agents`                | Agentes de voz.                        |
| `voice-ai-development`        | Desenvolvimento de IA de voz.          |

### 📈 Marketing, SEO & Growth

_Otimização, conteúdo e crescimento do produto._

| Skill                          | Descrição                                       |
| :----------------------------- | :---------------------------------------------- |
| `ab-test-setup`                | Testes A/B.                                     |
| `analytics-tracking`           | Rastreamento e Analytics.                       |
| `app-store-optimization`       | ASO para lojas de apps.                         |
| `competitor-alternatives`      | Análise de concorrentes.                        |
| `content-creator`              | Criação de conteúdo.                            |
| `copy-editing`                 | Revisão de copy.                                |
| `copywriting`                  | Escrita persuasiva.                             |
| `email-sequence`               | Sequências de e-mail marketing.                 |
| `form-cro`                     | Otimização de conversão em formulários.         |
| `launch-strategy`              | Estratégia de lançamento.                       |
| `marketing-ideas`              | Ideias de marketing.                            |
| `marketing-psychology`         | Psicologia do marketing.                        |
| `onboarding-cro`               | Otimização de onboarding.                       |
| `page-cro`                     | Otimização de páginas (CRO).                    |
| `paid-ads`                     | Anúncios pagos.                                 |
| `paywall-upgrade-cro`          | Otimização de paywalls.                         |
| `popup-cro`                    | Otimização de popups.                           |
| `pricing-strategy`             | Estratégia de precificação.                     |
| `programmatic-seo`             | SEO programático.                               |
| `referral-program`             | Programas de indicação.                         |
| `schema-markup`                | Schema markup para SEO.                         |
| `seo-audit`                    | Auditoria técnica de SEO.                       |
| `seo-fundamentals`             | Fundamentos de SEO.                             |
| `signup-flow-cro`              | Otimização de fluxo de cadastro.                |
| `social-content`               | Conteúdo para redes sociais.                    |
| `viral-generator-builder`      | Criação de loops virais.                        |
| `web-performance-audit`        | Auditoria de performance web / Core Web Vitals. |
| `web-performance-optimization` | Otimização de performance.                      |

### 🛠️ Outros / Ferramentas / Produtividade

| Skill                          | Descrição                       |
| :----------------------------- | :------------------------------ |
| `bash-linux`                   | Comandos Bash.                  |
| `brainstorming`                | Técnicas de brainstorming.      |
| `cc-skill-continuous-learning` | Aprendizado contínuo.           |
| `cc-skill-strategic-compact`   | Estratégia compacta.            |
| `concise-planning`             | Planejamento conciso.           |
| `discord-bot-architect`        | Bots para Discord.              |
| `doc-coauthoring`              | Coautoria de documentos.        |
| `documentation-templates`      | Templates de documentação.      |
| `docx-official`                | Manipulação de DOCX.            |
| `file-organizer`               | Organizador de arquivos.        |
| `game-development`             | Desenvolvimento de jogos.       |
| `geo-fundamentals`             | Fundamentos de geolocalização.  |
| `i18n-localization`            | Internacionalização.            |
| `internal-comms-anthropic`     | Comunicação interna.            |
| `linux-shell-scripting`        | Scripts Shell.                  |
| `micro-saas-launcher`          | Lançamento de Micro SaaS.       |
| `network-101`                  | Fundamentos de redes.           |
| `notion-template-business`     | Templates Notion para negócios. |
| `pdf-official`                 | Manipulação de PDF.             |
| `personal-tool-builder`        | Ferramentas pessoais.           |
| `plan-writing`                 | Escrita de planos.              |
| `planning-with-files`          | Planejamento com arquivos.      |
| `powershell-windows`           | PowerShell.                     |
| `pptx-official`                | Manipulação de PPTX.            |
| `product-manager-toolkit`      | Kit para Product Managers.      |
| `skill-creator`                | Criação de novas skills.        |
| `skill-developer`              | Desenvolvimento de skills.      |
| `slack-bot-builder`            | Bots para Slack.                |
| `slack-gif-creator`            | GIFs para Slack.                |
| `telegram-bot-builder`         | Bots para Telegram.             |
| `telegram-mini-app`            | Mini Apps para Telegram.        |
| `theme-factory`                | Criação de temas.               |
| `using-git-worktrees`          | Git Worktrees.                  |
| `web-artifacts-builder`        | Construtor de artefatos web.    |
| `writing-plans`                | Planos de escrita.              |
| `writing-skills`               | Melhoria de escrita.            |
| `xlsx-official`                | Manipulação de Excel (XLSX).    |

---

## 🔄 Workflows (11)

Slash command procedures. Invoke with `/command`.

| Command          | Description              |
| ---------------- | ------------------------ |
| `/brainstorm`    | Socratic discovery       |
| `/create`        | Create new features      |
| `/debug`         | Debug issues             |
| `/deploy`        | Deploy application       |
| `/enhance`       | Improve existing code    |
| `/orchestrate`   | Multi-agent coordination |
| `/plan`          | Task breakdown           |
| `/preview`       | Preview changes          |
| `/status`        | Check project status     |
| `/test`          | Run tests                |
| `/ui-ux-pro-max` | Design with 50 styles    |

---

## 🎯 Skill Loading Protocol

```plaintext
User Request → Skill Description Match → Load SKILL.md
                                            ↓
                                    Read references/
                                            ↓
                                    Read scripts/
```

### Skill Structure

```plaintext
skill-name/
├── SKILL.md           # (Required) Metadata & instructions
├── scripts/           # (Optional) Python/Bash scripts
├── references/        # (Optional) Templates, docs
└── assets/            # (Optional) Images, logos
```

### Enhanced Skills (with scripts/references)

| Skill               | Files | Coverage                            |
| ------------------- | ----- | ----------------------------------- |
| `typescript-expert` | 5     | Utility types, tsconfig, cheatsheet |
| `ui-ux-pro-max`     | 27    | 50 styles, 21 palettes, 50 fonts    |
| `app-builder`       | 20    | Full-stack scaffolding              |

---

## � Scripts (2)

Master validation scripts that orchestrate skill-level scripts.

### Master Scripts

| Script          | Purpose                                 | When to Use              |
| --------------- | --------------------------------------- | ------------------------ |
| `checklist.py`  | Priority-based validation (Core checks) | Development, pre-commit  |
| `verify_all.py` | Comprehensive verification (All checks) | Pre-deployment, releases |

### Usage

```bash
# Quick validation during development
python .agent/scripts/checklist.py .

# Full verification before deployment
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

### What They Check

**checklist.py** (Core checks):

- Security (vulnerabilities, secrets)
- Code Quality (lint, types)
- Schema Validation
- Test Suite
- UX Audit
- SEO Check

**verify_all.py** (Full suite):

- Everything in checklist.py PLUS:
- Lighthouse (Core Web Vitals)
- Playwright E2E
- Bundle Analysis
- Mobile Audit
- i18n Check

For details, see [scripts/README.md](scripts/README.md)

---

## 📊 Statistics

| Metric              | Value                         |
| ------------------- | ----------------------------- |
| **Total Agents**    | 19                            |
| **Total Skills**    | 36                            |
| **Total Workflows** | 11                            |
| **Total Scripts**   | 2 (master) + 18 (skill-level) |
| **Coverage**        | ~90% web/mobile development   |

---

## 🔗 Quick Reference

| Need     | Agent                 | Skills                                |
| -------- | --------------------- | ------------------------------------- |
| Web App  | `frontend-specialist` | react-patterns, nextjs-best-practices |
| API      | `backend-specialist`  | api-patterns, nodejs-best-practices   |
| Mobile   | `mobile-developer`    | mobile-design                         |
| Database | `database-architect`  | database-design, prisma-expert        |
| Security | `security-auditor`    | vulnerability-scanner                 |
| Testing  | `test-engineer`       | testing-patterns, webapp-testing      |
| Debug    | `debugger`            | systematic-debugging                  |
| Plan     | `project-planner`     | brainstorming, plan-writing           |

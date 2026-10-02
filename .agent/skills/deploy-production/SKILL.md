---
name: deploy-production
description: Production release runbook, pre-flight verification checklist, multi-platform deployment protocols (Vercel, Railway, Docker), health monitoring, and rollback strategies. Use when preparing, executing, or verifying production deployments and releases.
---

# Production Deployment & Release Runbook

## Overview
Esta Skill documenta o protocolo operacional canônico de implantação em produção, checklist de pré-voo (pre-flight checks), procedimentos de verificação pós-deploy (smoke tests & health checks) e estratégias de rollback para as aplicações do escritório **Elilon Lopes Advogados**.

Esta Skill é a referência operacional de release para os agentes do Harness Engineering (`devops-engineer` e `engineering-lead`).

---

## 1. Protocolo de Implantação em 5 Fases

O ciclo de vida de release segue rigidamente o modelo de 5 fases para garantir previsibilidade, zero downtime e integridade dos dados:

```
┌──────────────────┐
│  1. PREPARE      │ Pre-flight quality gates, branch clean, env vars
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  2. BACKUP       │ Database snapshot, tag release, backup env state
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  3. DEPLOY       │ Platform build & rollout (Vercel, Railway, Docker)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  4. VERIFY       │ Smoke tests, health check 200 OK, DB ping, logs
└────────┬─────────┘
         │
   Healthy? ──No──► ROLLBACK (Instant revert to previous release)
         │
        Yes
         │
         ▼
┌──────────────────┐
│  5. CONFIRM      │ Tag git release, update status, announce release
└──────────────────┘
```

---

## 2. Checklist Pré-Voo (Pre-Flight Checklist)

Nenhum deploy para produção deve ser acionado sem que todos os itens obrigatórios estejam validados localmente:

### A. Qualidade de Código & Tipagem
- [ ] **Typecheck:** `npx tsc --noEmit` executado sem nenhum erro de compilação.
- [ ] **Testes Automatizados:** `npm test` (ou framework correspondente) passando com 100% de sucesso.
- [ ] **Build de Produção Local:** `npm run build` executado com sucesso gerando o bundle otimizado sem avisos críticos.

### B. Segurança & Segredos
- [ ] **Sem Segredos Expostos:** Nenhum token, chave de API privada (`RESEND_API_KEY`, senhas de banco ou secrets do n8n) comitados no código.
- [ ] **Auditoria de Dependências:** `npm audit` revisado contra vulnerabilidades de severidade crítica/alta.
- [ ] **Variáveis de Ambiente:** Arquivo `.env.example` atualizado e variáveis de produção conferidas no painel de infraestrutura.

### C. Performance & Higiene
- [ ] **Console Logs:** Remoção ou desligamento de `console.log` de depuração sensível em rotas de produção.
- [ ] **Imagens & Assets:** Imagens comprimidas (WebP/SVG) e caminhos estáticos validados.

---

## 3. Matriz de Plataformas & Comandos de Deploy

| Plataforma | Comando de Produção | Flags & Recomendações |
|------------|---------------------|------------------------|
| **Vercel** (Frontend / Next.js / Vite) | `vercel --prod` | Garante build na infraestrutura oficial da Vercel com aliases de produção. |
| **Railway** (Backend / Workers / n8n) | `railway up` | Sobe container com as variáveis injetadas via dashboard. |
| **Fly.io** (Edge / Containers) | `fly deploy` | Requer `flyctl` autenticado e `fly.toml` validado. |
| **Docker Compose** (Self-hosted) | `docker compose -f docker-compose.prod.yml up -d --build` | Realiza rebuild das imagens e sobe em modo daemon detached. |

---

## 4. Verificação Pós-Deploy (Smoke Tests & Health Checks)

Assim que o comando de deploy finalizar com sucesso, execute a rotina de validação imediata:

1. **HTTP 200 OK nas Rotas Críticas:**
   - Landing page / Home: status `200 OK`
   - Endpoint de Health check (se existente): `GET /api/health` -> `{"status": "ok"}`
   - Páginas de captura de leads e áreas de atuação jurídica.

2. **Conectividade de Serviços Externos:**
   - Webhook n8n de recebimento de leads: ping e teste de envio de payload sintético.
   - Provedor de e-mail transacional (ex: Resend) pronto para disparo.
   - Banco de dados conectado e respondendo a queries básicas.

3. **Verificação de SSL e Cabeçalhos:**
   - Certificado HTTPS ativo e válido.
   - Cabeçalhos de segurança (`X-Content-Type-Options`, `X-Frame-Options`) ativos.

---

## 5. Procedimentos de Rollback (Plano de Contingência)

Se qualquer anomalia crítica for identificada nos primeiros 10 minutos após o deploy:

### Rollback Instantâneo por Plataforma
- **Vercel:** No painel da Vercel (ou via `vercel rollback`), promova o deployment imediatamente anterior (v1.x.prev) para produção com 1 clique (Rollback instantâneo via DNS/Edge Routing).
- **Railway:** Reverta para o deployment anterior através do histórico de deployments na dashboard.
- **Docker Compose:** Execute `docker compose -f docker-compose.prod.yml rollback` ou recoloque a tag de imagem anterior no arquivo de composição.

### Rollback a Nível de Git
Caso o erro tenha sido promovido para a branch principal:
```bash
git revert HEAD -m "revert: rollback release due to [motivo]"
git push origin <main-branch>
```

---

## 6. Governança e Relatório de Release

Ao concluir o deploy com sucesso, registre o resumo operacional:

```markdown
### 🚀 Relatório de Release em Produção
- **Versão / Tag:** vX.Y.Z
- **Commit SHA:** [hash]
- **Ambiente:** Produção
- **Plataforma:** [Vercel / Railway / Docker]
- **Status dos Health Checks:**
  - Landing Page: 200 OK
  - Webhooks / APIs: 200 OK
  - Banco de Dados: Conectado
- **Ações Pós-Deploy:** Nenhuma pendência / Sistema operacional
```

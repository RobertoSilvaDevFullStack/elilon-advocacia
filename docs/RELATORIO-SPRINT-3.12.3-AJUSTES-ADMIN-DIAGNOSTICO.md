# Relatório — Sprint 3.12.3: Ajustes Admin Diagnóstico Tributário

**Data:** 22/06/2026  
**Escopo:** Legenda de risco, correção do modal de respostas, controle do chat no admin e em produção.

---

## 1. Resumo executivo

Três problemas identificados no painel **Diagnóstico Tributário** (`/admin`) foram corrigidos:

| # | Problema | Status |
|---|----------|--------|
| 1 | Tags de risco sem explicação | ✅ Legenda + tooltip no hover |
| 2 | Respostas do diagnóstico exibidas caractere a caractere | ✅ Parse JSON no backend e frontend |
| 3 | Chat visível no admin e risco de ativação em produção | ✅ Oculto no admin; gate duplo (flag + N8N) |

---

## 2. Análise técnica

### 2.1 Tags de Risco sem legenda

**Sintoma:** Coluna "Risco" exibia tags Alto/Médio/Baixo sem contexto.

**Critérios de classificação** (alinhados ao quiz público em `pages/DiagnosticoTributario.tsx`):

| Nível | Score | Significado |
|-------|-------|-------------|
| **Alto** | ≥ 11 | Alta exposição à Reforma Tributária (IBS/CBS); análise jurídica urgente |
| **Médio** | 7–10 | Impactos pontuais; planejamento preventivo recomendado |
| **Baixo** | ≤ 6 | Menor exposição imediata; monitoramento periódico |

**Solução:**
- Utilitário centralizado `utils/diagnosticoRisk.ts` com metadados (`RISCO_META`).
- Componente `RiskBadge` com tooltip ao passar o mouse.
- Bloco "Legenda — Níveis de Risco" acima da tabela no admin.

### 2.2 Modal "Ver detalhes" — respostas bugadas

**Causa raiz:** Campo `respostas` armazenado no SQLite como **string JSON**. O frontend executava `Object.entries()` sobre a string, iterando **cada caractere** (`{`, `"`, `r`, `e`, `g`, `i`, `m`, `e`...).

**Solução:**
- Backend: `backend/utils/parseLeadRespostas.js` + `normalizeDiagnosticoLead()` aplicado em `list`, `getById` e `updateStatus`.
- Frontend: `parseRespostas()` e `formatQuestionKey()` no modal, com labels legíveis (ex.: `regime` → "Regime tributário").

### 2.3 Chat no ambiente admin e produção

**Sintoma:** Widget de chat ("Avalie seu caso gratuitamente") aparecia em `/admin`.

**Decisão:** Chat **não deve** aparecer no painel administrativo. Em produção, o chat só deve estar ativo quando o workflow N8N estiver finalizado.

**Solução:**
- Componente `PublicWidgets` em `App.tsx` — oculta `ChatWidget` e `DiagnosticoPopup` em rotas `/admin*`.
- Gate duplo para o chat:
  1. `VITE_ENABLE_CHAT=true` (explícito)
  2. `VITE_N8N_CHAT_WEBHOOK_URL` preenchida (`isN8NConfigured()`)
- `.env.example` atualizado: `VITE_ENABLE_CHAT=false` e webhook vazio por padrão.

**Comportamento em produção (FileZilla):**

| Variável | Valor recomendado agora | Efeito |
|----------|-------------------------|--------|
| `VITE_ENABLE_CHAT` | `false` | Chat desligado |
| `VITE_N8N_CHAT_WEBHOOK_URL` | *(vazio)* | Integração N8N inativa |

Quando o N8N estiver pronto: definir a URL do webhook **e** `VITE_ENABLE_CHAT=true`, rebuild e deploy.

---

## 3. Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `utils/diagnosticoRisk.ts` | Metadados de risco, parse e labels de perguntas |
| `backend/utils/parseLeadRespostas.js` | Normalização JSON → objeto |
| `backend/controllers/DiagnosticoLeadController.js` | Parse em list/getById/updateStatus |
| `components/DiagnosticoAdminView.tsx` | Legenda, RiskBadge, modal corrigido |
| `App.tsx` | PublicWidgets, gate chat + N8N |
| `.env.example` | Documentação flags de chat |

---

## 4. Testes recomendados antes do deploy

1. **Admin → Diagnóstico Tributário:** verificar legenda e tooltip nas tags.
2. **Ver detalhes:** respostas exibidas como pares pergunta/resposta (não caracteres soltos).
3. **Admin (`/admin`):** confirmar ausência do chat e do popup de diagnóstico.
4. **Site público:** popup de diagnóstico continua visível; chat permanece oculto com env padrão.
5. **Build:** `npm run build` sem erros.

---

## 5. Deploy via FileZilla

1. Build local: `npm run build`
2. Enviar pasta `dist/` para o hosting do frontend.
3. Garantir `.env` de produção com `VITE_ENABLE_CHAT=false` e webhook N8N vazio.
4. Backend: reiniciar após deploy dos controllers atualizados.

---

## 6. Próximos passos (quando N8N estiver pronto)

1. Finalizar workflow em `n8n/workflow-n8n-v1.json`.
2. Configurar `VITE_N8N_CHAT_WEBHOOK_URL` no `.env` de produção.
3. Definir `VITE_ENABLE_CHAT=true`.
4. Rebuild + deploy do frontend.
5. Testar fluxo conversacional end-to-end no site público.

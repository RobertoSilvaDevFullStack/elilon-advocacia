# PLANO DE AÇÃO: ELEVAR NOTA DE 7.5 PARA 9.0+
## Sprint 3.4.2 - Checklist Executivo

**Objetivo**: Sistema pronto para integração Hermes  
**Deadline**: 5 dias úteis (21/06/2026)  
**Nota Atual**: 7.5/10 → **Meta**: 9.0+/10

---

## 📊 SCORECARD DE QUALIDADE

| Categoria | Atual | Meta | Gap | Status |
|-----------|-------|------|-----|--------|
| Funcionalidade | 8.0 | 9.0 | 1.0 | 🟡 |
| Confiabilidade | 7.0 | 9.0 | 2.0 | 🔴 |
| Usabilidade | 8.0 | 9.0 | 1.0 | 🟡 |
| Performance | 8.0 | 9.0 | 1.0 | 🟡 |
| Segurança | 7.0 | 9.0 | 2.0 | 🔴 |
| **TOTAL** | **7.5** | **9.0** | **1.5** | 🟡 |

---

## ✅ CHECKLIST DE AÇÕES

### FASE 1: CRÍTICO (Nota 7.5 → 8.2)
**Prazo**: Dia 1-2  
**Esforço Total**: 10 horas

| # | Ação | Categoria | Esforço | Responsável | Status | Impacto Nota |
|---|------|-----------|---------|-------------|--------|--------------|
| 1.1 | Criar script seed para usuário admin | Confiabilidade | 2h | Backend | 🔄 | +0.3 |
| 1.2 | Implementar retry com exponential backoff | Confiabilidade | 3h | Backend | 🔄 | +0.2 |
| 1.3 | Configurar logs estruturados (Winston) | Confiabilidade | 3h | Backend | 🔄 | +0.3 |
| 1.4 | Documentar processo de primeiro deploy | Confiabilidade | 2h | Tech Lead | 🔄 | +0.2 |

**Entregável**: Sistema robusto para deploy inicial  
**Nota Esperada**: 8.2/10

---

### FASE 2: SEGURANÇA (Nota 8.2 → 8.8)
**Prazo**: Dia 3  
**Esforço Total**: 8 horas

| # | Ação | Categoria | Esforço | Responsável | Status | Impacto Nota |
|---|------|-----------|---------|-------------|--------|--------------|
| 2.1 | Implementar rate limiting (express-rate-limit) | Segurança | 2h | Backend | 🔄 | +0.4 |
| 2.2 | Adicionar validação de magic numbers para arquivos | Segurança | 4h | Backend | 🔄 | +0.3 |
| 2.3 | Criar health check endpoint | Confiabilidade | 2h | Backend | 🔄 | +0.2 |

**Entregável**: Sistema seguro e monitorável  
**Nota Esperada**: 8.8/10

---

### FASE 3: POLIMENTO (Nota 8.8 → 9.0+)
**Prazo**: Dia 4  
**Esforço Total**: 6 horas

| # | Ação | Categoria | Esforço | Responsável | Status | Impacto Nota |
|---|------|-----------|---------|-------------|--------|--------------|
| 3.1 | Corrigir responsividade em 320px | Usabilidade | 4h | Frontend | 🔄 | +0.2 |
| 3.2 | Otimizar queries do dashboard | Performance | 2h | Backend | 🔄 | +0.2 |

**Entregável**: Sistema polido e profissional  
**Nota Esperada**: 9.2/10

---

### FASE 4: VALIDAÇÃO (Nota 9.2 consolidada)
**Prazo**: Dia 5  
**Esforço Total**: 6 horas

| # | Ação | Categoria | Esforço | Responsável | Status |
|---|------|-----------|---------|-------------|--------|
| 4.1 | Executar todos os testes automatizados | Validação | 3h | QA/Dev | 🔄 |
| 4.2 | Revisão de código final | Qualidade | 2h | Tech Lead | 🔄 |
| 4.3 | Gerar relatório de qualidade atualizado | Documentação | 1h | Tech Lead | 🔄 |

**Entregável**: Sistema aprovado para Hermes  
**Nota Final**: 9.0+/10

---

## 📅 CRONOGRAMA VISUAL

```
SEMANA 1 (16/06 - 21/06)
═══════════════════════════════════════════════════════════════

TER 16/06          QUA 17/06          QUI 18/06
├─ ✅ CORS          ├─ 🔄 Seed Admin    ├─ 🔄 Rate Limit
├─ ✅ Middleware    ├─ 🔄 Retry         ├─ 🔄 Magic Numbers
├─ ✅ UUID          ├─ 🔄 Logs          └─ 🔄 Health Check
└─ ✅ Testes         └─ 🔄 Docs
     [7.5 → 8.0]         [8.0 → 8.2]         [8.2 → 8.8]

SEX 19/06          SEG 21/06
├─ 🔄 Responsividade  ├─ 🔄 Testes Finais
└─ 🔄 Otimização      └─ 🎯 NOTA 9.0+
     [8.8 → 9.2]         [APROVADO]

═══════════════════════════════════════════════════════════════
```

---

## 🎯 DETALHAMENTO DAS AÇÕES

### Ação 1.1: Script de Seed Admin
**Objetivo**: Permitir primeiro acesso ao dashboard após deploy

```javascript
// backend/scripts/seed-admin.js
const bcrypt = require('bcryptjs');
const db = require('../database');

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@elilon.adv.br';
  const adminPassword = process.env.ADMIN_PASSWORD || require('crypto').randomBytes(8).toString('hex');
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  await db.query(`
    INSERT INTO users (email, password, role, name, created_at)
    VALUES ($1, $2, 'admin', 'Administrador', NOW())
    ON CONFLICT (email) DO NOTHING
  `, [adminEmail, hashedPassword]);
  
  console.log(`✅ Admin criado: ${adminEmail} / Senha: ${adminPassword}`);
}

seedAdmin();
```

**Critério de Aceite**: 
- [ ] Script executa sem erros
- [ ] Cria usuário admin se não existir
- [ ] Gera senha segura aleatória
- [ ] Loga credenciais no console

---

### Ação 1.2: Retry com Exponential Backoff
**Objetivo**: Evitar timeouts em operações de banco

```javascript
// backend/utils/retry.js
async function withRetry(operation, maxRetries = 3, baseDelay = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⏳ Retry ${i + 1}/${maxRetries} em ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Uso em controllers
await withRetry(() => PreAtendimentoRepository.create(data));
```

**Critério de Aceite**:
- [ ] Função utilitária criada
- [ ] Integrada em operações críticas
- [ ] Logs de retry visíveis
- [ ] Massa de testes passa sem falhas

---

### Ação 1.3: Logs Estruturados (Winston)
**Objetivo**: Facilitar debugging e monitoramento

```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

**Critério de Aceite**:
- [ ] Winston configurado
- [ ] Logs em formato JSON
- [ ] Arquivos separados por nível
- [ ] Console legível em dev

---

### Ação 2.1: Rate Limiting
**Objetivo**: Proteger contra abuso de APIs

```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});

exports.uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 uploads por minuto
  message: {
    success: false,
    error: 'Limite de uploads excedido. Aguarde 1 minuto.'
  }
});
```

**Critério de Aceite**:
- [ ] Limiter configurado
- [ ] Aplicado em rotas públicas
- [ ] Mensagens em português
- [ ] Testado com carga

---

### Ação 2.2: Validação de Magic Numbers
**Objetivo**: Garantir integridade de arquivos

```javascript
// backend/utils/fileValidator.js
const MAGIC_NUMBERS = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  jpg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  docx: [0x50, 0x4B, 0x03, 0x04], // ZIP header
};

function validateFileContent(buffer, expectedType) {
  const signature = MAGIC_NUMBERS[expectedType];
  if (!signature) return true;
  
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}
```

**Critério de Aceite**:
- [ ] Validador implementado
- [ ] Integrado no middleware de upload
- [ ] Rejeita arquivos corrompidos
- [ ] Testes com arquivos válidos/inválidos

---

### Ação 3.1: Responsividade 320px
**Objetivo**: Suporte a dispositivos antigos

```css
/* Adicionar em index.css ou componente */
@media (max-width: 360px) {
  .chat-widget {
    width: 100vw;
    padding: 8px;
  }
  
  .chat-area-button {
    font-size: 12px;
    padding: 8px 12px;
    min-height: 44px;
  }
  
  .chat-form-input {
    font-size: 16px; /* Prevenir zoom em iOS */
  }
  
  .dashboard-table {
    font-size: 12px;
  }
}
```

**Critério de Aceite**:
- [ ] Layout testado em 320px
- [ ] Nenhum overflow horizontal
- [ ] Botões clicáveis (min 44px)
- [ ] Texto legível

---

## 🏆 CRITÉRIOS DE SUCESSO

### Aprovação para Hermes

Para que o sistema seja aprovado para integração com Hermes, todos os itens abaixo devem estar ✅:

**FASE 1 (Obrigatório)**:
- [ ] Script seed admin funcional
- [ ] Retry implementado
- [ ] Logs estruturados
- [ ] Documentação de deploy

**FASE 2 (Segurança)**:
- [ ] Rate limiting ativo
- [ ] Validação de arquivos
- [ ] Health check respondendo

**FASE 3 (Polimento)**:
- [ ] Responsividade 320px OK
- [ ] Performance dashboard < 2s

**FASE 4 (Validação)**:
- [ ] Todos os testes passando
- [ ] Review de código aprovado
- [ ] Nota atualizada ≥ 9.0/10

---

## 📈 PROJEÇÃO DE NOTA

```
DIA 0 (Hoje):     7.5/10 ⭐
                  ├─ ✅ Críticos corrigidos
                  └─ ⚠️ Moderados pendentes

DIA 2:            8.2/10 ⭐⭐
                  ├─ 🔄 Seed + Retry + Logs
                  └─ 🔄 Documentação

DIA 3:            8.8/10 ⭐⭐⭐
                  ├─ 🔄 Rate Limiting
                  ├─ 🔄 File Validation
                  └─ 🔄 Health Check

DIA 4:            9.2/10 ⭐⭐⭐⭐
                  ├─ 🔄 Responsividade
                  └─ 🔄 Performance

DIA 5:            9.0+/10 ⭐⭐⭐⭐⭐ 🎯
                  └─ ✅ APROVADO PARA HERMES!
```

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Atraso no cronograma | Média | Meta não atingida | Foco nas ações P1 primeiro |
| Complexidade inesperada | Baixa | Esforço maior | Revisar após Dia 2 |
| Conflitos de código | Baixa | Merge difícil | Pull requests pequenos |
| Dependências bloqueantes | Baixa | Ação impossível | Alternativas documentadas |

---

## 👥 RESPONSÁVEIS

| Papel | Responsável | Foco |
|-------|-------------|------|
| Backend Dev | [Nome] | Ações 1.1, 1.2, 1.3, 2.1, 2.2, 2.3 |
| Frontend Dev | [Nome] | Ação 3.1 |
| Tech Lead | [Nome] | Ações 1.4, 4.2, 4.3 |
| QA/Dev | [Nome] | Ação 4.1 |

---

## 📝 COMUNICAÇÃO

**Daily Sync**: 09:00 (15 min)  
**Review**: Dia 4, 16:00  
**Go/No-Go**: Dia 5, 10:00

**Escalonamento**:  
- Bloqueio > 2h → Tech Lead  
- Risco de prazo → Stakeholder

---

**Plano criado em**: 16/06/2026  
**Última atualização**: 16/06/2026  
**Versão**: 1.0

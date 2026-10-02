# Relatório Técnico - Sprint 3.2: Persistência e Protocolo

## Data: 16/06/2026

---

## Resumo

Implementação da persistência de pré-atendimentos no banco de dados PostgreSQL, com geração automática de protocolos únicos no formato `JUR-YYYYMMDD-XXXX` e integração frontend-backend.

---

## Arquitetura da Persistência

```
Frontend (ChatWidget)
        ↓ POST /api/chat/pre-atendimento
Backend (Express)
        ↓ ChatLeadController
        ↓ CreatePreAtendimentoService
        ↓ PreAtendimentoRepository
        ↓ PostgreSQL
        ↓ Retorna protocolo
Frontend (Exibe confirmação)
```

---

## Arquivos Criados/Modificados

### 1. Backend

#### Migration: `backend/migrations/create_chat_pre_atendimentos.sql`

```sql
CREATE TABLE IF NOT EXISTS chat_pre_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(50) UNIQUE NOT NULL,
  area VARCHAR(100) NOT NULL,
  subarea VARCHAR(100) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(10) NOT NULL,
  descricao_caso TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'novo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_chat_pre_atendimentos_protocolo ON chat_pre_atendimentos(protocolo);
CREATE INDEX idx_chat_pre_atendimentos_status ON chat_pre_atendimentos(status);
CREATE INDEX idx_chat_pre_atendimentos_area ON chat_pre_atendimentos(area);
CREATE INDEX idx_chat_pre_atendimentos_created_at ON chat_pre_atendimentos(created_at DESC);
```

#### Repository: `backend/repositories/PreAtendimentoRepository.js`

**Métodos:**
- `create(data)` - Cria pré-atendimento
- `findByProtocolo(protocolo)` - Busca por protocolo
- `findById(id)` - Busca por UUID
- `findAll(options)` - Lista com filtros e paginação
- `updateStatus(id, status)` - Atualiza status
- `countByDate(date)` - Conta atendimentos do dia (para geração de protocolo)

#### Service: `backend/services/CreatePreAtendimentoService.js`

**Responsabilidades:**
1. Gerar protocolo único: `JUR-YYYYMMDD-XXXX`
2. Chamar repository para persistir
3. Retornar resultado formatado

**Geração de Protocolo:**
```javascript
async generateProtocolo() {
  const dateStr = "YYYYMMDD"; // Data atual
  const count = await PreAtendimentoRepository.countByDate(dateStr);
  const nextNumber = count + 1;
  const sequential = String(nextNumber).padStart(4, "0");
  return `JUR-${dateStr}-${sequential}`;
}
```

**Exemplo:**
- 1º atendimento de 2025-07-23 → `JUR-20250723-0001`
- 2º atendimento de 2025-07-23 → `JUR-20250723-0002`

**Retorno Preparado para Futuro:**
```javascript
{
  success: true,
  protocolo: "JUR-20250723-0001",
  atendimentoId: "uuid",
  status: "novo",
  encaminhadoN8N: false,      // Preparação para Sprint 4
  analisadoHermes: false,     // Preparação para Sprint 5
  createdAt: "2025-07-23T10:30:00Z"
}
```

#### Controller: `backend/controllers/ChatLeadController.js`

**Endpoints:**

##### POST `/api/chat/pre-atendimento`
Cria novo pré-atendimento.

**Request Body:**
```json
{
  "area": "Previdenciário",
  "subarea": "Aposentadoria",
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "email": "joao@email.com",
  "cidade": "São Paulo",
  "estado": "SP",
  "descricaoCaso": "Meu benefício foi negado pelo INSS..."
}
```

**Response Sucesso (201):**
```json
{
  "success": true,
  "message": "Pré-atendimento registrado com sucesso",
  "data": {
    "protocolo": "JUR-20250723-0001",
    "atendimentoId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "novo",
    "encaminhadoN8N": false,
    "analisadoHermes": false,
    "createdAt": "2025-07-23T10:30:00.000Z"
  }
}
```

**Response Erro (400):**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    "Nome completo é obrigatório (mínimo 3 caracteres)",
    "Telefone inválido. Use o formato: (11) 99999-9999"
  ]
}
```

**Response Erro (500):**
```json
{
  "success": false,
  "error": "Erro interno",
  "message": "Não foi possível registrar o pré-atendimento. Tente novamente."
}
```

**Validações Implementadas:**
- Todos os campos obrigatórios
- Nome: mínimo 3 caracteres
- Telefone: formato brasileiro (10-11 dígitos)
- Email: formato válido
- Estado: 2 caracteres (sigla)
- Descrição: 20-3000 caracteres

##### GET `/api/chat/pre-atendimento/:protocolo`
Busca atendimento por protocolo (para consulta).

**Response:**
```json
{
  "success": true,
  "data": { /* objeto completo do atendimento */ }
}
```

#### Rotas: `backend/routes/apiRoutes.js`

```javascript
const chatLeadController = require("../controllers/ChatLeadController");

// Sprint 3.2: Chat Pré-Atendimento (Public - NO AUTH REQUIRED)
router.post("/chat/pre-atendimento", chatLeadController.create);
router.get("/chat/pre-atendimento/:protocolo", chatLeadController.findByProtocolo);
```

---

### 2. Frontend

#### ChatWidget: `src/modules/chat/presentation/components/ChatWidget/ChatWidget.tsx`

**Novos Estados:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [protocolo, setProtocolo] = useState<string | null>(null);
const [submissionError, setSubmissionError] = useState<string | null>(null);
```

**Nova Função: `submitPreAtendimento`**
```typescript
const submitPreAtendimento = useCallback(async () => {
  const payload = {
    area: context.areaSelecionada,
    subarea: context.subareaSelecionada,
    nome: dados.nome,
    telefone: dados.telefone,
    email: dados.email,
    cidade: dados.cidade,
    estado: dados.estado,
    descricaoCaso: dados.descricaoCaso
  };

  const response = await fetch(
    `${API_BASE_URL}/chat/pre-atendimento`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  // Retorna { success, protocolo } ou { success, error }
}, [context]);
```

**Fluxo Atualizado: `showQualificationSummary`**
```
1. Exibe resumo com "_Enviando dados..._"
2. Chama submitPreAtendimento()
3. Se sucesso: mostra mensagem com protocolo
4. Se erro: mostra mensagem de erro amigável
```

**Novas Mensagens:**
```typescript
// Com protocolo (sucesso)
const MENSAGEM_CONCLUSAO_COM_PROTOCOLO = (protocolo: string) => 
`✅ **Pré-atendimento registrado**

**Protocolo:** ${protocolo}

Nossa equipe jurídica analisará as informações e entrará em contato.`;

// Erro (falha)
const MENSAGEM_ERRO_PERSISTENCIA = 
`❌ **Erro ao registrar**

Não foi possível salvar seu pré-atendimento no momento.

Por favor, tente novamente ou entre em contato pelo WhatsApp.`;
```

**Fluxo de UX:**

```
Usuário completa descrição do caso
        ↓
Chat exibe: "Obrigado pelas informações..."
        ↓
[Digitação 1s]
        ↓
Chat exibe resumo com "_Enviando dados..._"
        ↓
[Chamada API - POST /api/chat/pre-atendimento]
        ↓
    ┌─────────┴─────────┐
    ↓                   ↓
  Sucesso             Erro
    ↓                   ↓
[Digitação 0.6s]    [Digitação 0.6s]
    ↓                   ↓
"✅ Pré-atendimento  "❌ Erro ao registrar
 registrado          

Protocolo:           Por favor, tente
JUR-20250723-0001    novamente..."
```

---

## Estrutura de Dados

### Payload da API

```json
{
  "area": "Previdenciário",
  "subarea": "Aposentadoria",
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "email": "joao@email.com",
  "cidade": "São Paulo",
  "estado": "SP",
  "descricaoCaso": "Meu benefício foi negado pelo INSS..."
}
```

### Registro no Banco

```sql
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  protocolo: "JUR-20250723-0001",
  area: "Previdenciário",
  subarea: "Aposentadoria",
  nome: "João Silva",
  telefone: "(11) 99999-9999",
  email: "joao@email.com",
  cidade: "São Paulo",
  estado: "SP",
  descricao_caso: "Meu benefício foi negado pelo INSS...",
  status: "novo",
  created_at: "2025-07-23T10:30:00Z",
  updated_at: "2025-07-23T10:30:00Z"
}
```

### Contexto FSM Completo

```typescript
{
  areaSelecionada: "Previdenciário",
  subareaSelecionada: "Aposentadoria",
  qualificacaoCompleta: true,
  dadosColetados: {
    nome: "João Silva",
    telefone: "(11) 99999-9999",
    email: "joao@email.com",
    cidade: "São Paulo",
    estado: "SP",
    descricaoCaso: "Meu benefício foi negado..."
  },
  caseAnalysis: {
    area: "Previdenciário",
    subarea: "Aposentadoria",
    descricaoCaso: "Meu benefício foi negado..."
  }
}
```

---

## Padrão de Protocolo

### Formato

```
JUR-YYYYMMDD-XXXX
```

### Componentes

| Componente | Descrição | Exemplo |
|------------|-----------|---------|
| `JUR` | Prefixo jurídico fixo | JUR |
| `YYYYMMDD` | Data do atendimento | 20250723 |
| `XXXX` | Sequencial diário (4 dígitos) | 0001 |

### Regras

1. **Único**: Protocolo nunca se repete
2. **Incremental**: Número sequencial por dia
3. **Persistido**: Salvo no banco como VARCHAR(50)
4. **Indexado**: Índice único para busca rápida

### Exemplos

| Data | 1º Atendimento | 2º Atendimento | 100º Atendimento |
|------|----------------|----------------|------------------|
| 2025-07-23 | JUR-20250723-0001 | JUR-20250723-0002 | JUR-20250723-0100 |
| 2025-07-24 | JUR-20250724-0001 | JUR-20250724-0002 | JUR-20250724-0150 |

---

## Fluxo Completo V3.2

```
START
  ↓
AWAITING_AREA_SELECTION
  ↓ (seleciona área)
AREA_SELECTED
  ↓
AWAITING_SUBAREA_SELECTION
  ↓ (seleciona subárea)
SUBAREA_SELECTED
  ↓
AWAITING_NAME → NAME_COLLECTED
  ↓
AWAITING_PHONE → PHONE_COLLECTED
  ↓
AWAITING_EMAIL → EMAIL_COLLECTED
  ↓
AWAITING_CITY → CITY_COLLECTED
  ↓
AWAITING_STATE → STATE_COLLECTED
  ↓
AWAITING_CASE_DESCRIPTION
  ↓ (envia descrição)
CASE_DESCRIPTION_COLLECTED
  ↓
QUALIFICATION_COMPLETE
  ↓
[PERSISTÊNCIA - POST /api/chat/pre-atendimento]
  ↓
    ┌─────────┴─────────┐
    ↓                   ↓
  Sucesso             Erro
    ↓                   ↓
Exibe protocolo     Exibe erro
JUR-XXXXXX-XXXX     amigável
```

---

## Tratamento de Erros

### Falha de Rede

```typescript
try {
  const response = await fetch(...);
} catch (error) {
  // Erro de conexão, timeout, etc.
  return { success: false, error: "Erro de conexão" };
}
```

**Mensagem ao usuário:**
```
❌ **Erro ao registrar**

Não foi possível salvar seu pré-atendimento no momento.

Por favor, tente novamente ou entre em contato pelo WhatsApp.
```

### Falha de Persistência

```typescript
if (!response.ok) {
  throw new Error(data.message || "Erro ao registrar");
}
```

**Códigos HTTP tratados:**
- `400` - Dados inválidos
- `409` - Conflito (protocolo duplicado)
- `500` - Erro interno

### Payload Inválido

**Validações no Controller:**
```javascript
const errors = [];

if (!data.nome || data.nome.trim().length < 3) {
  errors.push("Nome completo é obrigatório (mínimo 3 caracteres)");
}

if (!emailRegex.test(data.email)) {
  errors.push("E-mail inválido. Use o formato: exemplo@email.com");
}

// ... outras validações
```

**Resposta:**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    "Nome completo é obrigatório",
    "E-mail inválido"
  ]
}
```

---

## Preparação para Futuro

### Estrutura de Retorno Estendida

```javascript
{
  protocolo: "JUR-20250723-0001",
  atendimentoId: "uuid",
  status: "novo",
  
  // Campos preparados para futuras sprints:
  encaminhadoN8N: false,    // Sprint 4: Integração N8N
  analisadoHermes: false,   // Sprint 5: Análise IA Hermes
  
  createdAt: "2025-07-23T10:30:00Z"
}
```

### Próximos Passos

| Sprint | Funcionalidade | Status |
|--------|---------------|--------|
| 3.2 | Persistência e Protocolo | ✅ Implementado |
| 4 | Integração N8N | 📝 Preparado (encaminhadoN8N: false) |
| 5 | Análise Hermes | 📝 Preparado (analisadoHermes: false) |

---

## Teste Rápido

### Cenário 1: Sucesso Completo

1. Abrir chat
2. Selecionar área: Previdenciário
3. Selecionar subárea: Aposentadoria
4. Preencher dados:
   - Nome: João Silva
   - Telefone: (11) 99999-9999
   - Email: joao@email.com
   - Cidade: São Paulo
   - Estado: SP
5. Descrever caso: "Meu benefício foi negado..."
6. Verificar:
   - Resumo exibido
   - "_Enviando dados..._" aparece
   - Protocolo retornado: `JUR-20250723-XXXX`
   - Mensagem de sucesso com protocolo

### Cenário 2: Erro de Rede

1. Desconectar backend ou simular offline
2. Completar fluxo normal
3. Verificar:
   - Resumo exibido
   - Tentativa de envio
   - Mensagem de erro amigável aparece

### Cenário 3: Validação Backend

1. Enviar requisição POST manualmente com dados inválidos
2. Verificar resposta 400 com lista de erros

---

## Status

✅ **IMPLEMENTADO**

- [x] Migration PostgreSQL
- [x] Repository (CRUD + busca por protocolo)
- [x] Service (geração de protocolo JUR-YYYYMMDD-XXXX)
- [x] Controller (validação + endpoints)
- [x] Rota POST /api/chat/pre-atendimento
- [x] Rota GET /api/chat/pre-atendimento/:protocolo
- [x] Integração frontend com API
- [x] Exibição de protocolo ao usuário
- [x] Tratamento de erros (rede, persistência, payload)
- [x] Mensagens amigáveis de erro
- [x] Preparação para futuro (N8N, Hermes)

---

## Próximos Passos (Sprint 4)

1. **Integração N8N**: Webhook para orquestração de workflows
2. **Dashboard Admin**: Visualizar lista de pré-atendimentos
3. **Notificação Email**: Enviar confirmação para cliente
4. **Kinbox Integration**: Encaminhar para CRM

---

## Arquivos do Sprint 3.2

```
backend/
├── migrations/
│   └── create_chat_pre_atendimentos.sql    ✅ Nova tabela
├── repositories/
│   └── PreAtendimentoRepository.js          ✅ CRUD + busca
├── services/
│   └── CreatePreAtendimentoService.js     ✅ Protocolo + persistência
├── controllers/
│   └── ChatLeadController.js              ✅ Validação + endpoints
└── routes/
    └── apiRoutes.js                         ✅ Rotas públicas

src/modules/chat/presentation/components/ChatWidget/
└── ChatWidget.tsx                           ✅ Integração API + protocolo
```

---

## Resumo Técnico

| Aspecto | Implementação |
|---------|---------------|
| Protocolo | JUR-YYYYMMDD-XXXX, incremental diário |
| Banco | PostgreSQL, tabela chat_pre_atendimentos |
| API | POST /api/chat/pre-atendimento (pública) |
| Validação | Controller valida todos os campos |
| Frontend | fetch() com tratamento de erro |
| UX | Loading "Enviando dados..." + feedback |
| Segurança | Sem auth (endpoint público) |
| Extensibilidade | Estrutura preparada para N8N e Hermes |

---

## Documentação Relacionada

- `RELATORIO-FLUXO-QUALIFICACAO.md` - V1: Fluxo inicial
- `RELATORIO-EVOLUCAO-SUBAREAS.md` - V2: Subáreas
- `RELATORIO-COLETA-DADOS.md` - V3: Coleta de dados
- `RELATORIO-SPRINT-3.1-DESCRICAO-CASO.md` - V3.1: Descrição
- `RELATORIO-SPRINT-3.2-PERSISTENCIA.md` - V3.2: Este documento

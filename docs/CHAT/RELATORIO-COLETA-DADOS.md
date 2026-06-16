# Relatório Técnico - Coleta Sequencial de Dados Chat Jurídico

## Data: 15/06/2026

---

## Resumo

Implementação completa do fluxo de coleta sequencial de dados do cliente após seleção de subárea. Inclui validação em tempo real, correção de campos inválidos, e resumo final formatado. Preparado para persistência futura no PostgreSQL.

---

## Estados FSM Implementados

### Novos Estados de Coleta

| Estado | Descrição | Próximo Estado |
|--------|-----------|----------------|
| `AWAITING_NAME` | Aguardando nome do cliente | `NAME_COLLECTED` |
| `NAME_COLLECTED` | Nome coletado | `AWAITING_PHONE` |
| `AWAITING_PHONE` | Aguardando telefone | `PHONE_COLLECTED` |
| `PHONE_COLLECTED` | Telefone coletado | `AWAITING_EMAIL` |
| `AWAITING_EMAIL` | Aguardando email | `EMAIL_COLLECTED` |
| `EMAIL_COLLECTED` | Email coletado | `AWAITING_CITY` |
| `AWAITING_CITY` | Aguardando cidade | `CITY_COLLECTED` |
| `CITY_COLLECTED` | Cidade coletada | `AWAITING_STATE` |
| `AWAITING_STATE` | Aguardando estado | `STATE_COLLECTED` |
| `STATE_COLLECTED` | Estado coletado | `QUALIFICATION_COMPLETE` |
| `QUALIFICATION_COMPLETE` | Qualificação finalizada | - |

### Diagrama do Fluxo Completo

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
QUALIFICATION_COMPLETE
```

---

## Arquivos Criados/Modificados

### 1. `src/modules/chat/presentation/utils/validation.ts` (NOVO)

Utilitários de validação para todos os campos de coleta.

#### Funções de Validação

```typescript
validateEmail(email: string): ValidationResult
validatePhone(phone: string): ValidationResult
validateName(name: string): ValidationResult
validateCity(city: string): ValidationResult
validateState(state: string): ValidationResult
validateField(field: DataField, value: string): ValidationResult
```

#### Regras de Validação

| Campo | Regras | Normalização |
|-------|--------|--------------|
| **Nome** | Mínimo 3 chars, máximo 100, deve conter espaço (nome + sobrenome) | Trim, remove espaços múltiplos |
| **Telefone** | Mínimo 10 dígitos, máximo 11, DDD válido (11-99) | Formato: (XX) XXXXX-XXXX |
| **Email** | Formato válido com @ e domínio | Lowercase, trim |
| **Cidade** | Mínimo 2 chars, máximo 50 | Trim |
| **Estado** | Exatamente 2 letras, sigla válida | Uppercase |

#### Estados Brasileiros Válidos

```typescript
const VALID_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
```

#### Mensagens de Erro

```typescript
getValidationErrorMessage(field: DataField): string
getFieldPromptMessage(field: DataField, isRetry: boolean): string
```

---

### 2. `src/modules/chat/presentation/utils/index.ts` (NOVO)

Exportação centralizada dos utilitários.

```typescript
export {
  validateEmail,
  validatePhone,
  validateName,
  validateCity,
  validateState,
  validateField,
  getValidationErrorMessage,
  getFieldPromptMessage,
} from "./validation";
```

---

### 3. `src/modules/chat/presentation/types/chat.types.ts`

#### Novos Estados FSM

```typescript
export type ChatState =
  | "START"
  | "AWAITING_AREA_SELECTION"
  | "AREA_SELECTED"
  | "AWAITING_SUBAREA_SELECTION"
  | "SUBAREA_SELECTED"
  // Novos estados de coleta
  | "AWAITING_NAME"
  | "NAME_COLLECTED"
  | "AWAITING_PHONE"
  | "PHONE_COLLECTED"
  | "AWAITING_EMAIL"
  | "EMAIL_COLLECTED"
  | "AWAITING_CITY"
  | "CITY_COLLECTED"
  | "AWAITING_STATE"
  | "STATE_COLLECTED"
  | "QUALIFICATION_COMPLETE"
  // ... estados legados
```

#### Novos Eventos FSM

```typescript
export type FSMEvent =
  | { type: "SELECT_AREA"; area: AreaJuridica }
  | { type: "SELECT_SUBAREA"; subarea: SubareaJuridica; area: AreaJuridica }
  // Novos eventos de dados
  | { type: "SUBMIT_NAME"; name: string }
  | { type: "SUBMIT_PHONE"; phone: string }
  | { type: "SUBMIT_EMAIL"; email: string }
  | { type: "SUBMIT_CITY"; city: string }
  | { type: "SUBMIT_STATE"; state: string }
  | { type: "VALIDATION_ERROR"; field: string; error: string }
  | { type: "CORRECT_FIELD"; field: string }
  // ... eventos existentes
```

#### Tipos de Campos

```typescript
export type DataField = "name" | "phone" | "email" | "city" | "state";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedValue?: string;
}
```

#### Interface de Resumo

```typescript
export interface QualificationSummary {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  protocolo?: string;
  timestamp: string;
}
```

#### Interface para PostgreSQL

```typescript
export interface ClientDataDTO {
  sessionId: string;
  area: AreaJuridica;
  subarea: SubareaJuridica;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
}
```

---

### 4. `src/modules/chat/presentation/components/ChatWidget/ChatWidget.tsx`

#### Estados Adicionados

```typescript
// Estado para retry de campo inválido
const [awaitingCorrection, setAwaitingCorrection] = 
  useState<{ field: DataField; originalValue: string } | null>(null);

// Sequência de campos
const fieldSequence: DataField[] = ["name", "phone", "email", "city", "state"];

// Map de estados para campos
const stateToFieldMap: Record<string, DataField> = {
  AWAITING_NAME: "name",
  AWAITING_PHONE: "phone",
  AWAITING_EMAIL: "email",
  AWAITING_CITY: "city",
  AWAITING_STATE: "state",
};

// Map de campos para próximos estados
const fieldNextStateMap: Record<DataField, { collected: ChatState; nextAwaiting: ChatState }> = {
  name: { collected: "NAME_COLLECTED", nextAwaiting: "AWAITING_PHONE" },
  phone: { collected: "PHONE_COLLECTED", nextAwaiting: "AWAITING_EMAIL" },
  email: { collected: "EMAIL_COLLECTED", nextAwaiting: "AWAITING_CITY" },
  city: { collected: "CITY_COLLECTED", nextAwaiting: "AWAITING_STATE" },
  state: { collected: "STATE_COLLECTED", nextAwaiting: "QUALIFICATION_COMPLETE" },
};
```

#### Funções Principais

**requestNextField** - Solicita próximo campo na sequência
```typescript
const requestNextField = useCallback(
  async (field: DataField, isRetry: boolean = false) => {
    setCurrentState(stateMap[field]);
    const prompt = getFieldPromptMessage(field, isRetry);
    await addBotMessage(prompt, { typingDuration: 600 });
  },
  [addBotMessage]
);
```

**startDataCollection** - Inicia coleta após subárea
```typescript
const startDataCollection = useCallback(async () => {
  await addBotMessage(MENSAGEM_INTRODUCAO_DADOS, { typingDuration: 800 });
  await requestNextField("name");
}, [addBotMessage, requestNextField]);
```

**processCollectedData** - Valida e processa cada campo
```typescript
const processCollectedData = useCallback(
  async (field: DataField, value: string) => {
    const validation = validateField(field, value);

    if (!validation.valid) {
      // Campo inválido - solicitar correção
      setAwaitingCorrection({ field, originalValue: value });
      await addBotMessage(
        `${validation.error}\n\nVamos tentar novamente.`,
        { typingDuration: 500 }
      );
      await requestNextField(field, true);
      return;
    }

    // Campo válido - atualizar contexto
    setContext((prev) => ({
      ...prev,
      dadosColetados: {
        ...prev.dadosColetados,
        [field === "name" ? "nome" :
          field === "phone" ? "telefone" :
          field === "email" ? "email" :
          field === "city" ? "cidade" :
          "estado"]: validation.normalizedValue || value,
      },
    }));

    // Transicionar e solicitar próximo campo
    setCurrentState(nextStateConfig.collected);
    
    if (field === "state") {
      await showQualificationSummary();
    } else {
      const nextField = fieldSequence[fieldSequence.indexOf(field) + 1];
      await requestNextField(nextField);
    }
  },
  [addBotMessage, requestNextField, simulateTyping]
);
```

**showQualificationSummary** - Exibe resumo formatado
```typescript
const showQualificationSummary = useCallback(async () => {
  const dados = context.dadosColetados || {};

  const resumo = `📋 **Resumo do Pré-Atendimento**

**Área:** ${context.areaSelecionada || "-"}
**Subárea:** ${context.subareaSelecionada || "-"}
**Nome:** ${dados.nome || "-"}
**Telefone:** ${dados.telefone || "-"}
**E-mail:** ${dados.email || "-"}
**Cidade:** ${dados.cidade || "-"}
**Estado:** ${dados.estado || "-"}

Perfeito! Seu pré-atendimento foi registrado.`;

  setCurrentState("QUALIFICATION_COMPLETE");
  context.qualificacaoCompleta = true;
  await addBotMessage(resumo, { typingDuration: 800 });
}, [addBotMessage, context]);
```

#### Fluxo de Mensagens

```typescript
const MENSAGEM_INTRODUCAO_DADOS = 
  "Perfeito! Agora preciso de algumas informações para registrar seu atendimento.";

const MENSAGEM_CONCLUSAO = 
  "Perfeito! Seu pré-atendimento foi registrado.";
```

#### Perguntas do Fluxo

1. "Qual é o seu nome completo?"
2. "Obrigado. Qual é o seu telefone com WhatsApp?"
3. "Qual é o seu melhor e-mail?"
4. "Em qual cidade você mora?"
5. "Qual é o seu estado? (sigla de 2 letras, ex: SP)"

#### handleSendMessage Atualizado

```typescript
const handleSendMessage = useCallback(
  async (content: string) => {
    // Verificar estado de coleta
    const currentField = stateToFieldMap[currentState];
    if (currentField) {
      addUserMessage(content, { type: "data_input", field: currentField });
      await processCollectedData(currentField, content);
      return;
    }

    // Se qualificação completa, agradecer
    if (currentState === "QUALIFICATION_COMPLETE") {
      addUserMessage(content);
      await simulateTyping(600);
      const response: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "BOT",
        content: "Obrigado! Seu pré-atendimento já foi registrado...",
        // ...
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // ... resposta genérica
  },
  [addUserMessage, currentState, processCollectedData]
);
```

---

## Fluxo UX Completo

### Diagrama de Sequência

```
Usuário → Chat: Abrir
Chat → Usuário: "Olá! Sou a assistente... qual área?"
Chat → Usuário: [Botões: ⚖️ 💼 🏛️ 📋]

Usuário → Chat: Seleciona "⚖️ Previdenciário"
Chat → Usuário: "Entendi. Qual assunto...?"
Chat → Usuário: [Botões: BPC/LOAS, Aposentadoria...]

Usuário → Chat: Seleciona "Aposentadoria"
Chat → Usuário: "Perfeito! Agora preciso de informações..."
Chat → Usuário: "Qual é o seu nome completo?"

Usuário → Chat: Digita "João"
Chat → Usuário: "Nome muito curto... Vamos tentar novamente."
Chat → Usuário: "Qual é o seu nome completo?"

Usuário → Chat: Digita "João Silva"
Chat → Usuário: "Obrigado. Qual é o seu telefone...?"

Usuário → Chat: Digita "1199999-9999"
Chat → Usuário: "Qual é o seu melhor e-mail?"

Usuário → Chat: Digita "joao@email"
Chat → Usuário: "E-mail inválido... Vamos tentar novamente."
Chat → Usuário: "Qual é o seu e-mail?"

Usuário → Chat: Digita "joao@email.com"
Chat → Usuário: "Em qual cidade você mora?"

Usuário → Chat: Digita "São Paulo"
Chat → Usuário: "Qual é o seu estado? (sigla de 2 letras)"

Usuário → Chat: Digita "SP"
Chat → Usuário: [Resumo formatado]
Chat → Usuário: "Perfeito! Seu pré-atendimento foi registrado."
```

---

## Validações em Tempo Real

### Exemplos de Validação

| Entrada | Validação | Resultado |
|---------|-----------|-----------|
| "João" | Nome curto, sem sobrenome | ❌ Erro: "Digite nome completo" |
| "João Silva" | Válido | ✅ Normalizado: "João Silva" |
| "123456" | Telefone curto | ❌ Erro: "DDD + número" |
| "11999999999" | Válido | ✅ Normalizado: "(11) 99999-9999" |
| "joao@email" | Sem domínio | ❌ Erro: "Formato inválido" |
| "joao@email.com" | Válido | ✅ Normalizado: "joao@email.com" |
| "SP" | Sigla válida | ✅ Normalizado: "SP" |
| "XX" | Sigla inválida | ❌ Erro: "Estado não existe" |

### Correção de Campos

Quando um campo é inválido:
1. Exibe mensagem de erro específica
2. Marca `awaitingCorrection` com campo e valor original
3. Re-solicita o mesmo campo com flag `isRetry: true`
4. Usa mensagem alternativa: "Vamos tentar novamente..."

---

## Contexto FSM Preenchido

Após qualificação completa:

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
    estado: "SP"
  }
}
```

---

## Preparação para PostgreSQL

### Estrutura da Tabela (Sugerida)

```sql
CREATE TABLE chat_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(50) NOT NULL,
  area VARCHAR(50) NOT NULL,
  subarea VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state CHAR(2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_complete BOOLEAN DEFAULT FALSE,
  
  -- Índices para consultas
  INDEX idx_session_id (session_id),
  INDEX idx_area (area),
  INDEX idx_created_at (created_at),
  INDEX idx_is_complete (is_complete)
);
```

### Mapeamento para Inserção

```typescript
const qualificationData: ClientDataDTO = {
  sessionId: context.sessionId,
  area: context.areaSelecionada!,
  subarea: context.subareaSelecionada!,
  name: context.dadosColetados!.nome!,
  phone: context.dadosColetados!.telefone!,
  email: context.dadosColetados!.email!,
  city: context.dadosColetados!.cidade!,
  state: context.dadosColetados!.estado!,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isComplete: true
};
```

---

## Componentes e Hooks

### Estrutura Atual

```
ChatWidget
├── ChatButton (sem alterações)
├── ChatWindow
│   ├── MessageList
│   │   ├── MessageBubble
│   │   ├── AreaSelector
│   │   └── SubareaSelector
│   └── ChatInput
└── utils/validation.ts (NOVO)
```

### Responsabilidades

| Componente | Responsabilidade |
|------------|------------------|
| `ChatWidget` | Orquestração do FSM, validação, fluxo completo |
| `ChatWindow` | Layout, passagem de props |
| `MessageList` | Renderização condicional de botões |
| `AreaSelector` | Botões de área (4 opções) |
| `SubareaSelector` | Botões de subárea (dinâmico) |
| `validation.ts` | Validação de todos os campos |

---

## Teste Rápido

### Casos de Teste

1. **Fluxo Feliz**
   - Abrir chat → Selecionar área → Selecionar subárea
   - Preencher: Nome completo, telefone, email, cidade, estado
   - Verificar resumo formatado

2. **Validação de Nome**
   - Tentar: "João" → Erro
   - Corrigir: "João Silva" → Aceito

3. **Validação de Email**
   - Tentar: "joao" → Erro
   - Tentar: "joao@" → Erro
   - Corrigir: "joao@email.com" → Aceito

4. **Validação de Estado**
   - Tentar: "São Paulo" → Erro (muito longo)
   - Tentar: "XX" → Erro (não existe)
   - Corrigir: "SP" → Aceito

5. **Resumo Final**
   - Verificar formatação em markdown
   - Confirmar todos os dados exibidos

---

## Status

✅ **IMPLEMENTADO**

- [x] Estados FSM para coleta sequencial (10 estados)
- [x] Validação de email (formato, domínio)
- [x] Validação de telefone brasileiro (DDD, formato)
- [x] Validação de nome (mínimo, sobrenome)
- [x] Validação de cidade e estado
- [x] Correção de campos inválidos (retry)
- [x] Resumo final formatado em markdown
- [x] Interface ClientDataDTO para PostgreSQL
- [x] Persistência no contexto FSM
- [x] Sem integração backend (local only)
- [x] Sem integração Hermes (local only)

---

## Próximos Passos (Sprint 4)

1. **Persistência PostgreSQL**: Criar endpoint POST /api/chat/qualify
2. **Geração de Protocolo**: Criar número único de atendimento
3. **Integração N8N**: Enviar webhook com dados completos
4. **Notificação Email**: Enviar confirmação para cliente
5. **Dashboard Admin**: Visualizar qualificações pendentes

---

## Código de Referência

### Estrutura de Dados Final

```typescript
// Contexto completo após qualificação
interface CompleteFSMContext {
  areaSelecionada: AreaJuridica;
  subareaSelecionada: SubareaJuridica;
  qualificacaoCompleta: true;
  dadosColetados: {
    nome: string;      // Validado: nome + sobrenome
    telefone: string;  // Formatado: (XX) XXXXX-XXXX
    email: string;     // Validado: lowercase
    cidade: string;    // Trimmed
    estado: string;    // Uppercase, 2 chars
  };
}

// Payload para API
interface QualificationPayload {
  sessionId: string;
  area: string;
  subarea: string;
  clientData: {
    name: string;
    phone: string;
    email: string;
    city: string;
    state: string;
  };
  timestamp: string;
  metadata: {
    source: "chat_widget";
    version: "3.0";
  };
}
```

---

## Arquitetura de Validação

```
┌─────────────────────────────────────────┐
│  Entrada do Usuário (Input de Texto)    │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  validateField(field, value)            │
│  • Seleciona validador específico       │
│  • Executa regras de negócio           │
└─────────────┬───────────────────────────┘
              ↓
        ┌─────┴─────┐
        ↓           ↓
   ┌────────┐  ┌────────┐
   │ Válido │  │Inválido│
   └────┬───┘  └───┬────┘
        ↓          ↓
  Normaliza    Mensagem
  Valor        de Erro
        ↓          ↓
  Próximo Campo  Retry
```

---

## Resumo Técnico

| Aspecto | Implementação |
|---------|---------------|
| Estados FSM | 11 estados (4 de coleta + 5 coletados + 2 de controle) |
| Campos | 5 campos sequenciais |
| Validações | 5 validadores customizados |
| Correção | Retry automático com mensagens alternativas |
| Normalização | Trim, lowercase, formatação |
| Persistência | Contexto FSM (preparado para PostgreSQL) |
| Resumo | Markdown formatado com emoji |
| Type Safety | TypeScript completo, tipos estritos |

---

## Documentação Relacionada

- `RELATORIO-FLUXO-QUALIFICACAO.md` - Fluxo inicial V1
- `RELATORIO-EVOLUCAO-SUBAREAS.md` - Subáreas V2
- `RELATORIO-COLETA-DADOS.md` - Este documento (V3)

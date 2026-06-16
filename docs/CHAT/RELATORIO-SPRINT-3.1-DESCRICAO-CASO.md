# Relatório Técnico - Sprint 3.1: Descrição do Caso

## Data: 16/06/2026

---

## Resumo

Implementação da coleta da descrição do caso jurídico após a conclusão da coleta de dados básicos do cliente. Preparação para futura integração com Hermes (sem implementar IA ainda).

---

## Novos Estados FSM

```
STATE_COLLECTED
  ↓
AWAITING_CASE_DESCRIPTION
  ↓ (descrição enviada)
CASE_DESCRIPTION_COLLECTED
  ↓
QUALIFICATION_COMPLETE
```

### Estados Adicionados

| Estado | Código | Descrição |
|--------|--------|-----------|
| `AWAITING_CASE_DESCRIPTION` | `"AWAITING_CASE_DESCRIPTION"` | Aguardando descrição do caso |
| `CASE_DESCRIPTION_COLLECTED` | `"CASE_DESCRIPTION_COLLECTED"` | Descrição coletada |

---

## Arquivos Alterados

### 1. `src/modules/chat/presentation/types/chat.types.ts`

#### Novos Estados FSM

```typescript
export type ChatState =
  // ... estados anteriores
  | "STATE_COLLECTED"
  | "AWAITING_CASE_DESCRIPTION"      // NOVO
  | "CASE_DESCRIPTION_COLLECTED"     // NOVO
  | "QUALIFICATION_COMPLETE"
  // ... outros estados
```

#### Novo Evento FSM

```typescript
export type FSMEvent =
  // ... eventos anteriores
  | { type: "SUBMIT_STATE"; state: string }
  | { type: "SUBMIT_CASE_DESCRIPTION"; description: string }  // NOVO
  | { type: "VALIDATION_ERROR"; field: string; error: string }
  // ... outros eventos
```

#### Campo de Dados Atualizado

```typescript
export type DataField = 
  | "name" 
  | "phone" 
  | "email" 
  | "city" 
  | "state" 
  | "caseDescription";  // NOVO
```

#### Interface CaseDescriptionData (Preparação Hermes)

```typescript
export interface CaseDescriptionData {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  descricaoCaso: string;
  
  // Campos opcionais para futura análise da IA (Hermes)
  extractedEntities?: {
    dates?: string[];
    values?: string[];
    organizations?: string[];
    people?: string[];
  };
  classification?: {
    urgency?: "low" | "medium" | "high" | "urgent";
    complexity?: "simple" | "moderate" | "complex";
  };
  sentiment?: "negative" | "neutral" | "positive";
}
```

#### Resumo de Qualificação Atualizado

```typescript
export interface QualificationSummary {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  caseDescription?: string;  // NOVO
  protocolo?: string;
  timestamp: string;
}
```

#### Contexto FSM Atualizado

```typescript
export interface FSMContext {
  areaSelecionada?: AreaJuridica;
  subareaSelecionada?: SubareaJuridica;
  qualificacaoCompleta?: boolean;
  dadosColetados?: {
    nome?: string;
    email?: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
    descricaoCaso?: string;  // NOVO
  };
  caseAnalysis?: CaseDescriptionData;  // NOVO - Preparação Hermes
  [key: string]: any;
}
```

#### ClientDataDTO Atualizado

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
  caseDescription?: string;  // Nova campo Sprint 3.1
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
}
```

---

### 2. `src/modules/chat/presentation/utils/validation.ts`

#### Validação de Descrição do Caso

```typescript
export function validateCaseDescription(description: string): ValidationResult {
  const trimmed = description.trim();

  if (!trimmed) {
    return { valid: false, error: "Por favor, descreva brevemente sua situação jurídica." };
  }

  if (trimmed.length < 20) {
    return { valid: false, error: "Por favor, descreva um pouco mais sobre sua situação para que possamos compreender seu caso." };
  }

  if (trimmed.length > 3000) {
    return { valid: false, error: "A descrição é muito longa. Use no máximo 3000 caracteres." };
  }

  // Normaliza: remove espaços múltiplos, mantém quebras de linha
  const normalized = trimmed.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

  return { valid: true, normalizedValue: normalized };
}
```

#### Mensagens Atualizadas

```typescript
export function getValidationErrorMessage(field: DataField): string {
  const messages: Record<DataField, string> = {
    // ... mensagens anteriores
    caseDescription: "Descrição inválida. Use entre 20 e 3000 caracteres para descrever seu caso.",
  };
  return messages[field];
}

export function getFieldPromptMessage(field: DataField, isRetry: boolean = false): string {
  const messages: Record<DataField, { initial: string; retry: string }> = {
    // ... mensagens anteriores
    caseDescription: {
      initial: `Perfeito! Agora conte brevemente o que aconteceu no seu caso.

Quanto mais detalhes você fornecer, melhor poderemos direcionar seu atendimento.`,
      retry: "Vamos tentar novamente. Por favor, descreva sua situação com mais detalhes.",
    },
  };
  return isRetry ? messages[field].retry : messages[field].initial;
}
```

---

### 3. `src/modules/chat/presentation/utils/index.ts`

#### Exportações Atualizadas

```typescript
export {
  validateEmail,
  validatePhone,
  validateName,
  validateCity,
  validateState,
  validateField,
  validateCaseDescription,  // NOVO
  getValidationErrorMessage,
  getFieldPromptMessage,
} from "./validation";
```

---

### 4. `src/modules/chat/presentation/components/ChatWidget/ChatWidget.tsx`

#### Mensagens do Fluxo

```typescript
// Mensagem de conclusão atualizada
const MENSAGEM_CONCLUSAO = `Perfeito!

Seu pré-atendimento foi registrado com sucesso.

Na próxima etapa suas informações poderão ser encaminhadas para análise da equipe jurídica.`;

// Mensagem de agradecimento pela descrição
const MENSAGEM_AGRADECIMENTO_DESCRICAO = "Obrigado pelas informações.\n\nEstamos organizando os dados do seu pré-atendimento.";
```

#### Sequência de Campos Atualizada

```typescript
const fieldSequence: DataField[] = [
  "name", 
  "phone", 
  "email", 
  "city", 
  "state", 
  "caseDescription"  // NOVO
];
```

#### Map de Estados para Campos

```typescript
const stateToFieldMap: Record<string, DataField> = {
  AWAITING_NAME: "name",
  AWAITING_PHONE: "phone",
  AWAITING_EMAIL: "email",
  AWAITING_CITY: "city",
  AWAITING_STATE: "state",
  AWAITING_CASE_DESCRIPTION: "caseDescription",  // NOVO
};
```

#### Map de Campos para Próximos Estados

```typescript
const fieldNextStateMap: Record<DataField, { collected: ChatState; nextAwaiting: ChatState }> = {
  name: { collected: "NAME_COLLECTED", nextAwaiting: "AWAITING_PHONE" },
  phone: { collected: "PHONE_COLLECTED", nextAwaiting: "AWAITING_EMAIL" },
  email: { collected: "EMAIL_COLLECTED", nextAwaiting: "AWAITING_CITY" },
  city: { collected: "CITY_COLLECTED", nextAwaiting: "AWAITING_STATE" },
  state: { collected: "STATE_COLLECTED", nextAwaiting: "AWAITING_CASE_DESCRIPTION" },  // ATUALIZADO
  caseDescription: { collected: "CASE_DESCRIPTION_COLLECTED", nextAwaiting: "QUALIFICATION_COMPLETE" },  // NOVO
};
```

#### Processamento de Dados

```typescript
const processCollectedData = useCallback(
  async (field: DataField, value: string) => {
    // Validador específico para descrição do caso
    const validation = field === "caseDescription"
      ? validateCaseDescription(value)
      : validateField(field, value);

    // ... lógica de validação

    // Atualizar contexto com mapeamento correto
    setContext((prev) => ({
      ...prev,
      dadosColetados: {
        ...prev.dadosColetados,
        [field === "name" ? "nome" :
          field === "phone" ? "telefone" :
          field === "email" ? "email" :
          field === "city" ? "cidade" :
          field === "caseDescription" ? "descricaoCaso" :  // NOVO
          "estado"]: normalizedValue,
      },
    }));

    // Lógica de fluxo atualizada
    if (field === "caseDescription") {
      setCurrentState("CASE_DESCRIPTION_COLLECTED");
      await simulateTyping(1000);
      await addBotMessage(MENSAGEM_AGRADECIMENTO_DESCRICAO, { typingDuration: 600 });
      await simulateTyping(800);
      await showQualificationSummary();
    } else if (field === "state") {
      const nextField = fieldSequence[fieldSequence.indexOf(field) + 1];
      await requestNextField(nextField);
    }
    // ...
  },
  [addBotMessage, requestNextField, simulateTyping]
);
```

#### Resumo Atualizado com Preparação Hermes

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
**Descrição do Caso:** ${dados.descricaoCaso || "-"}

${MENSAGEM_CONCLUSAO}`;

  setCurrentState("QUALIFICATION_COMPLETE");
  context.qualificacaoCompleta = true;

  // Preparar estrutura para futura análise do Hermes (sem integrar ainda)
  if (context.areaSelecionada && context.subareaSelecionada && dados.descricaoCaso) {
    setContext((prev) => ({
      ...prev,
      caseAnalysis: {
        area: context.areaSelecionada!,
        subarea: context.subareaSelecionada!,
        descricaoCaso: dados.descricaoCaso!,
        // Campos opcionais para futura análise da IA (Hermes)
        // Serão preenchidos quando Hermes for integrado
      },
    }));
  }

  await addBotMessage(resumo, { typingDuration: 800 });
}, [addBotMessage, context]);
```

---

## Fluxo UX Completo (Sprint 3.1)

### Diagrama de Sequência

```
Usuário → Chat: Abrir
Chat → Usuário: "Olá! Sou a assistente... qual área?"
Chat → Usuário: [Botões: ⚖️ 💼 🏛️ 📋]

Usuário → Chat: Seleciona "⚖️ Previdenciário"
Chat → Usuário: "Entendi. Qual assunto...?"
Chat → Usuário: [Botões de subárea]

Usuário → Chat: Seleciona "Aposentadoria"
Chat → Usuário: "Perfeito! Agora preciso de informações..."

// Coleta de dados básicos
Chat → Usuário: "Qual é o seu nome completo?"
Usuário → Chat: "João Silva"
Chat → Usuário: "Obrigado. Qual é o seu telefone...?"
Usuário → Chat: "(11) 99999-9999"
Chat → Usuário: "Qual é o seu melhor e-mail?"
Usuário → Chat: "joao@email.com"
Chat → Usuário: "Em qual cidade você mora?"
Usuário → Chat: "São Paulo"
Chat → Usuário: "Qual é o seu estado?"
Usuário → Chat: "SP"

// NOVO: Coleta de descrição do caso
Chat → Usuário: "Perfeito! Agora conte brevemente o que aconteceu..."
Chat → Usuário: "Quanto mais detalhes você fornecer..."

Usuário → Chat: Digita descrição (20-3000 chars)
Chat → Usuário: [Indicador de digitação - 1 segundo]
Chat → Usuário: "Obrigado pelas informações. Estamos organizando..."
Chat → Usuário: [Resumo completo com todos os dados]
Chat → Usuário: "Perfeito! Seu pré-atendimento foi registrado..."
```

### Fluxo de Validação da Descrição

```
Usuário envia descrição
        ↓
[Validação]
  • Mínimo 20 caracteres
  • Máximo 3000 caracteres
  • Não vazio
        ↓
    ┌─────┴─────┐
    ↓           ↓
┌────────┐  ┌────────┐
│ Válida │  │Inválida│
└────┬───┘  └───┬────┘
     ↓           ↓
Normaliza    "Por favor, descreva um pouco mais..."
  ↓                ↓
Salva         Re-solicita
  ↓                ↓
Continua      Aguarda nova entrada
```

---

## Estados FSM Completos (v3.1)

```
START
  ↓
AWAITING_AREA_SELECTION → AREA_SELECTED
  ↓
AWAITING_SUBAREA_SELECTION → SUBAREA_SELECTED
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
AWAITING_CASE_DESCRIPTION → CASE_DESCRIPTION_COLLECTED  // NOVO
  ↓
QUALIFICATION_COMPLETE
```

---

## Validações da Descrição

| Regra | Valor | Mensagem de Erro |
|-------|-------|------------------|
| Obrigatório | Não vazio | "Por favor, descreva brevemente sua situação jurídica." |
| Mínimo | 20 caracteres | "Por favor, descreva um pouco mais sobre sua situação para que possamos compreender seu caso." |
| Máximo | 3000 caracteres | "A descrição é muito longa. Use no máximo 3000 caracteres." |

### Normalização

- Remove espaços múltiplos
- Mantém até 2 quebras de linha consecutivas
- Trim no início e fim

---

## Preparação para Hermes

### Estrutura Preparada

```typescript
// Interface preparada (ainda não populada pela IA)
interface CaseDescriptionData {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  descricaoCaso: string;
  
  // Campos futuros (Hermes):
  extractedEntities?: {
    dates?: string[];        // Datas mencionadas
    values?: string[];       // Valores monetários
    organizations?: string[]; // Órgãos/empresas
    people?: string[];       // Pessoas mencionadas
  };
  classification?: {
    urgency?: "low" | "medium" | "high" | "urgent";
    complexity?: "simple" | "moderate" | "complex";
  };
  sentiment?: "negative" | "neutral" | "positive";
}
```

### Preenchimento no Contexto

```typescript
// Ao final da qualificação, o contexto contém:
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
    descricaoCaso: "Meu benefício foi negado pelo INSS..."
  },
  caseAnalysis: {  // Preparado para Hermes
    area: "Previdenciário",
    subarea: "Aposentadoria",
    descricaoCaso: "Meu benefício foi negado pelo INSS..."
    // extractedEntities, classification, sentiment serão
    // preenchidos quando Hermes for integrado
  }
}
```

---

## Resumo Final (Exemplo)

```
📋 Resumo do Pré-Atendimento

Área: Previdenciário
Subárea: Aposentadoria
Nome: João Silva
Telefone: (11) 99999-9999
E-mail: joao@email.com
Cidade: São Paulo
Estado: SP
Descrição do Caso: Meu benefício foi negado pelo INSS. 
Trabalhei por 25 anos como operário e contribuí sempre, 
mas quando fui pedir a aposentadoria disseram que faltava 
tempo de contribuição. Preciso de ajuda para revisar isso.

Perfeito!

Seu pré-atendimento foi registrado com sucesso.

Na próxima etapa suas informações poderão ser encaminhadas 
para análise da equipe jurídica.
```

---

## Contexto FSM Preenchido (Sprint 3.1)

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
    descricaoCaso: "Meu benefício foi negado pelo INSS..."
  },
  caseAnalysis: {
    area: "Previdenciário",
    subarea: "Aposentadoria",
    descricaoCaso: "Meu benefício foi negado pelo INSS..."
  }
}
```

---

## Status

✅ **IMPLEMENTADO**

- [x] Estados FSM: AWAITING_CASE_DESCRIPTION, CASE_DESCRIPTION_COLLECTED
- [x] Interface CaseDescriptionData para futura integração Hermes
- [x] Validação de descrição (20-3000 caracteres)
- [x] Fluxo de coleta após dados básicos
- [x] Mensagem de introdução à descrição
- [x] Indicador de digitação (1 segundo)
- [x] Mensagem de agradecimento
- [x] Resumo final incluindo descrição
- [x] Preparação estrutura Hermes (sem integrar)
- [x] Contexto FSM com descricaoCaso
- [x] Sem integração backend
- [x] Sem integração N8N
- [x] Sem integração Hermes (apenas preparação)

---

## Próximos Passos (Sprint 4)

1. **Persistência PostgreSQL**: Criar tabela e endpoint POST /api/chat/qualify
2. **Geração de Protocolo**: Criar número único de atendimento
3. **Integração N8N**: Webhook para orquestração
4. **Integração Hermes**: Análise IA da descrição do caso
   - Extração de entidades
   - Classificação de urgência/complexidade
   - Análise de sentimento
5. **Dashboard Admin**: Visualizar qualificações

---

## Código de Referência

### Estrutura Completa para Hermes

```typescript
// Quando Hermes for integrado, usará esta estrutura:
interface HermesInput {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  descricaoCaso: string;
}

interface HermesOutput {
  extractedEntities: {
    dates: string[];
    values: string[];
    organizations: string[];
    people: string[];
  };
  classification: {
    urgency: "low" | "medium" | "high" | "urgent";
    complexity: "simple" | "moderate" | "complex";
  };
  sentiment: "negative" | "neutral" | "positive";
  summary: string;
  suggestedActions: string[];
}
```

---

## Arquitetura Atualizada

```
┌─────────────────────────────────────────┐
│  ChatWidget (Orquestração)              │
│  - Estados FSM (13 estados)             │
│  - Fluxo completo de qualificação       │
│  - Validação de todos os campos         │
│  - Preparação Hermes                    │
├─────────────────────────────────────────┤
│  ChatWindow (Container)                 │
│  - Layout, MessageList, ChatInput       │
├─────────────────────────────────────────┤
│  Components                             │
│  - AreaSelector (4 áreas)               │
│  - SubareaSelector (dinâmico)           │
│  - MessageList (renderização)           │
├─────────────────────────────────────────┤
│  Utils                                  │
│  - validation.ts (6 validadores)        │
│  - validateCaseDescription (novo)       │
├─────────────────────────────────────────┤
│  Types                                  │
│  - 13 estados FSM                       │
│  - CaseDescriptionData (Hermes ready)   │
│  - QualificationSummary completo        │
└─────────────────────────────────────────┘
```

---

## Resumo Técnico

| Aspecto | Valor |
|---------|-------|
| Estados FSM | 13 estados totais |
| Campos de coleta | 6 campos (5 básicos + 1 descrição) |
| Validações | 6 validadores customizados |
| Fluxo completo | Área → Subárea → Nome → Tel → Email → Cidade → Estado → Descrição → Resumo |
| Limite descrição | 20-3000 caracteres |
| Preparação Hermes | Interface pronta, sem integração |
| Persistência | Local (FSM context), preparado para PostgreSQL |

---

## Documentação Relacionada

- `RELATORIO-FLUXO-QUALIFICACAO.md` - Fluxo inicial V1
- `RELATORIO-EVOLUCAO-SUBAREAS.md` - Subáreas V2
- `RELATORIO-COLETA-DADOS.md` - Coleta de dados V3
- `RELATORIO-SPRINT-3.1-DESCRICAO-CASO.md` - Este documento (V3.1)


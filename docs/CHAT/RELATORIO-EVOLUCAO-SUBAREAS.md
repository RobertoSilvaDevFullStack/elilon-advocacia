# Relatório de Evolução - Fluxo de Subáreas Chat Jurídico

## Data: 15/06/2026

---

## Resumo

Evolução do fluxo de qualificação para incluir seleção de subáreas jurídicas após a seleção da área principal. Implementação local (V2) sem integração com backend ou Hermes.

---

## Subáreas Implementadas

### PREVIDENCIÁRIO (⚖️)
- BPC/LOAS
- Aposentadoria
- Auxílio-doença
- Pensão
- Revisão

### TRABALHISTA (💼)
- Rescisão
- FGTS
- Horas Extras
- Assédio
- Acidente de Trabalho

### TRIBUTÁRIO (🏛️)
- Impostos
- Planejamento Tributário
- Restituição
- Execução Fiscal

### CÍVEL (📋)
- Contratos
- Consumidor
- Família
- Indenização

---

## Arquivos Alterados

### 1. `src/modules/chat/presentation/types/chat.types.ts`

#### Novos tipos de subáreas:

```typescript
// Subáreas por área (tipos específicos para type safety)
export type SubareaPrevidenciario = "BPC/LOAS" | "Aposentadoria" | "Auxílio-doença" | "Pensão" | "Revisão";
export type SubareaTrabalhista = "Rescisão" | "FGTS" | "Horas Extras" | "Assédio" | "Acidente de Trabalho";
export type SubareaTributario = "Impostos" | "Planejamento Tributário" | "Restituição" | "Execução Fiscal";
export type SubareaCivel = "Contratos" | "Consumidor" | "Família" | "Indenização";

// União de todas as subáreas
export type SubareaJuridica = SubareaPrevidenciario | SubareaTrabalhista | SubareaTributario | SubareaCivel;
```

#### Interface de subárea:

```typescript
export interface SubareaOption {
  id: SubareaJuridica;
  label: string;
  area: AreaJuridica;
}
```

#### Constante de subáreas organizada por área:

```typescript
export const SUBAREAS_JURIDICAS: Record<AreaJuridica, SubareaOption[]> = {
  "Previdenciário": [
    { id: "BPC/LOAS", label: "BPC/LOAS", area: "Previdenciário" },
    { id: "Aposentadoria", label: "Aposentadoria", area: "Previdenciário" },
    { id: "Auxílio-doença", label: "Auxílio-doença", area: "Previdenciário" },
    { id: "Pensão", label: "Pensão", area: "Previdenciário" },
    { id: "Revisão", label: "Revisão", area: "Previdenciário" },
  ],
  "Trabalhista": [
    { id: "Rescisão", label: "Rescisão", area: "Trabalhista" },
    { id: "FGTS", label: "FGTS", area: "Trabalhista" },
    { id: "Horas Extras", label: "Horas Extras", area: "Trabalhista" },
    { id: "Assédio", label: "Assédio", area: "Trabalhista" },
    { id: "Acidente de Trabalho", label: "Acidente de Trabalho", area: "Trabalhista" },
  ],
  "Tributário": [
    { id: "Impostos", label: "Impostos", area: "Tributário" },
    { id: "Planejamento Tributário", label: "Planejamento Tributário", area: "Tributário" },
    { id: "Restituição", label: "Restituição", area: "Tributário" },
    { id: "Execução Fiscal", label: "Execução Fiscal", area: "Tributário" },
  ],
  "Cível": [
    { id: "Contratos", label: "Contratos", area: "Cível" },
    { id: "Consumidor", label: "Consumidor", area: "Cível" },
    { id: "Família", label: "Família", area: "Cível" },
    { id: "Indenização", label: "Indenização", area: "Cível" },
  ],
};
```

#### Estados FSM atualizados:

```typescript
export type ChatState =
  | "START"
  | "AWAITING_AREA_SELECTION"
  | "AREA_SELECTED"
  | "AWAITING_SUBAREA_SELECTION"   // NOVO
  | "SUBAREA_SELECTED"             // NOVO
  | "COLLECTING_NAME"
  | "COLLECTING_EMAIL"
  | "COLLECTING_PHONE"
  | "COLLECTING_LOCATION"
  | "SELECTING_AREA"
  | "DESCRIBING_CASE"
  | "READY_TO_CLOSE"
  | "CLOSED";
```

#### Contexto FSM atualizado:

```typescript
export interface FSMContext {
  areaSelecionada?: AreaJuridica;
  subareaSelecionada?: SubareaJuridica;  // NOVO
  qualificacaoCompleta?: boolean;
  dadosColetados?: { ... };
  [key: string]: any;
}
```

#### Eventos FSM atualizados:

```typescript
export type FSMEvent =
  | { type: "SELECT_AREA"; area: AreaJuridica }
  | { type: "SELECT_SUBAREA"; subarea: SubareaJuridica; area: AreaJuridica }  // NOVO
  | { type: "SUBMIT_DATA"; field: string; value: string }
  | { type: "NEXT_STEP" }
  | { type: "CLOSE_CHAT" }
  | { type: "RESTART" };
```

#### Props atualizadas:

```typescript
export interface ChatWindowProps {
  // ... existentes
  currentArea?: AreaJuridica | null;             // NOVO
  onSelectSubarea?: (subarea: SubareaJuridica) => void;  // NOVO
  showSubareaButtons?: boolean;                  // NOVO
}

export interface MessageListProps {
  // ... existentes
  currentArea?: AreaJuridica | null;             // NOVO
  onSelectSubarea?: (subarea: SubareaJuridica) => void;  // NOVO
  showSubareaButtons?: boolean;                  // NOVO
}

// NOVO: Props para componente de seleção de subárea
export interface SubareaSelectorProps {
  area: AreaJuridica;
  onSelect: (subarea: SubareaJuridica) => void;
  disabled?: boolean;
}
```

---

### 2. `src/modules/chat/presentation/components/ChatWidget/SubareaSelector.tsx` (NOVO)

Componente para seleção dinâmica de subáreas baseado na área selecionada:

```typescript
interface SubareaSelectorProps {
  area: AreaJuridica;
  onSelect: (subarea: SubareaJuridica) => void;
  disabled?: boolean;
}

// Lógica:
// 1. Recebe a área como prop
// 2. Busca subáreas em SUBAREAS_JURIDICAS[area]
// 3. Renderiza botões em flex-wrap gap-2
// 4. Estilo similar ao AreaSelector mas sem emoji
```

**Visual:**
- Botões arredondados (rounded-full)
- Borda vinho (`#A1333E`)
- Texto cinza escuro (`#374151`)
- Hover: bg-gray-50 + scale
- Layout flexível (wrap)

---

### 3. `src/modules/chat/presentation/components/ChatWidget/index.ts`

```typescript
export { SubareaSelector } from "./SubareaSelector";  // NOVO
```

---

### 4. `src/modules/chat/presentation/components/ChatWidget/MessageList.tsx`

#### Import adicionado:

```typescript
import { SubareaSelector } from "./SubareaSelector";
import type { ..., SubareaJuridica } from "../../types/chat.types";
```

#### Novas props:

```typescript
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  isTyping = false,
  currentState,
  currentArea,           // NOVO
  onSelectArea,
  onSelectSubarea,       // NOVO
  showAreaButtons = false,
  showSubareaButtons = false,  // NOVO
}) => {
```

#### Handler de subárea:

```typescript
// Handler para seleção de subárea
const handleSubareaSelect = (subarea: SubareaJuridica) => {
  onSelectSubarea?.(subarea);
};
```

#### Renderização condicional de botões de subárea:

```tsx
{/* Botões de seleção de subárea - exibidos após seleção de área */}
{showSubareaButtons && !isTyping && onSelectSubarea && currentArea && (
  <div className="flex items-start gap-2 mb-4">
    {/* Avatar spacer (invisível) */}
    <div className="w-8 h-8 rounded-full invisible" ...>
      <span className="text-white text-xs font-bold">E</span>
    </div>

    {/* Botões de subárea filtrados por área */}
    <SubareaSelector
      area={currentArea}
      onSelect={handleSubareaSelect}
      disabled={loading}
    />
  </div>
)}
```

---

### 5. `src/modules/chat/presentation/components/ChatWidget/ChatWindow.tsx`

#### Props atualizadas:

```typescript
export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  session,
  messages,
  onSendMessage,
  loading,
  isTyping,
  currentState,
  currentArea,           // NOVO
  onSelectArea,
  onSelectSubarea,       // NOVO
  showAreaButtons,
  showSubareaButtons,    // NOVO
}) => {
```

#### Passagem de props para MessageList:

```tsx
<MessageList
  messages={messages}
  loading={loading}
  isTyping={isTyping}
  currentState={currentState}
  currentArea={currentArea}           // NOVO
  onSelectArea={onSelectArea}
  onSelectSubarea={onSelectSubarea}   // NOVO
  showAreaButtons={showAreaButtons}
  showSubareaButtons={showSubareaButtons}  // NOVO
/>
```

---

### 6. `src/modules/chat/presentation/components/ChatWidget/ChatWidget.tsx`

#### Import atualizado:

```typescript
import type {
  ChatMessage,
  ChatState,
  AreaJuridica,
  SubareaJuridica,  // NOVO
  FSMContext,
} from "../../types/chat.types";
```

#### Constante de mensagem de subárea:

```typescript
// Mensagem de solicitação de subárea
const MENSAGEM_SUBAREA = "Entendi. Qual assunto melhor descreve sua situação?";
```

#### Estados adicionados:

```typescript
const [showSubareaButtons, setShowSubareaButtons] = useState(false);  // NOVO
const [currentArea, setCurrentArea] = useState<AreaJuridica | null>(null);  // NOVO
```

#### Handler de seleção de área - ATUALIZADO:

```typescript
const handleSelectArea = useCallback(
  async (area: AreaJuridica) => {
    // Registrar no contexto FSM
    setContext((prev) => ({ ...prev, areaSelecionada: area }));

    // Salvar área atual para filtrar subáreas
    setCurrentArea(area);  // NOVO

    // Ocultar botões de área
    setShowAreaButtons(false);

    // Adicionar mensagem do usuário
    addUserMessage(`${area}`, { type: "area_selection", area });

    // Transição: AWAITING_AREA_SELECTION → AREA_SELECTED
    setCurrentState("AREA_SELECTED");

    // Simular digitação (800ms)
    await simulateTyping(800);

    // Mensagem solicitando subárea
    const subareaMessage: ChatMessage = {
      id: generateId(),
      sessionId,
      senderType: "BOT",
      content: MENSAGEM_SUBAREA,  // NOVO
      createdAt: new Date().toISOString(),
      metadata: {
        type: "subarea_request",
        area,
        state: "AWAITING_SUBAREA_SELECTION",
      },
    };

    setMessages((prev) => [...prev, subareaMessage]);

    // Transição: AREA_SELECTED → AWAITING_SUBAREA_SELECTION
    setCurrentState("AWAITING_SUBAREA_SELECTION");  // NOVO

    // Exibir botões de subárea após mensagem
    setTimeout(() => setShowSubareaButtons(true), 300);  // NOVO
  },
  [addUserMessage, sessionId, simulateTyping]
);
```

#### Handler de seleção de subárea - NOVO:

```typescript
const handleSelectSubarea = useCallback(
  async (subarea: SubareaJuridica) => {
    if (!currentArea) return;

    // Registrar no contexto FSM
    setContext((prev) => ({ ...prev, subareaSelecionada: subarea }));

    // Ocultar botões de subárea
    setShowSubareaButtons(false);

    // Adicionar mensagem do usuário
    addUserMessage(`${subarea}`, { 
      type: "subarea_selection", 
      subarea, 
      area: currentArea 
    });

    // Transição: AWAITING_SUBAREA_SELECTION → SUBAREA_SELECTED
    setCurrentState("SUBAREA_SELECTED");

    // Simular digitação (800ms)
    await simulateTyping(800);

    // Mensagem de confirmação final
    const confirmMessage: ChatMessage = {
      id: generateId(),
      sessionId,
      senderType: "BOT",
      content: `Perfeito! Você selecionou: ${currentArea} > ${subarea}.\n\nEm breve nossa equipe especializada entrará em contato para dar continuidade ao seu atendimento.`,
      createdAt: new Date().toISOString(),
      metadata: {
        type: "confirmation",
        area: currentArea,
        subarea,
        state: "SUBAREA_SELECTED",
      },
    };

    setMessages((prev) => [...prev, confirmMessage]);
  },
  [addUserMessage, currentArea, sessionId, simulateTyping]
);
```

#### Passagem de props para ChatWindow:

```tsx
<ChatWindow
  isOpen={isOpen}
  onClose={handleClose}
  session={null} // V2: sem backend
  messages={messages}
  onSendMessage={handleSendMessage}
  loading={false}
  isTyping={isTyping}
  currentState={currentState}
  currentArea={currentArea}              // NOVO
  onSelectArea={handleSelectArea}
  onSelectSubarea={handleSelectSubarea}  // NOVO
  showAreaButtons={showAreaButtons}
  showSubareaButtons={showSubareaButtons}  // NOVO
/>
```

---

## Fluxo UX Atualizado

### Diagrama Completo

```
Usuário clica no botão Chat
         ↓
    ┌─────────────────┐
    │  Chat abre      │
    │  (sem mensagens) │
    └────────┬────────┘
             ↓
    ┌─────────────────┐
    │  500ms delay     │
    └────────┬────────┘
             ↓
    ┌──────────────────────────────────────┐
    │  Estado: START → AWAITING_AREA        │
    │  isTyping: true (1000ms)              │
    │  "Assistente está digitando..."       │
    └────────┬───────────────────────────────┘
             ↓
    ┌──────────────────────────────────────┐
    │  Mensagem inicial:                    │
    │  "Olá! Sou a assistente...            │
    │   qual área melhor representa..."    │
    │  showAreaButtons: true                │
    └────────┬───────────────────────────────┘
             ↓
    ┌──────────────────────────────────────┐
    │  Exibe 4 botões de área:              │
    │  ⚖️ Previdenciário                    │
    │  💼 Trabalhista                       │
    │  🏛️ Tributário                       │
    │  📋 Cível                             │
    └────────┬───────────────────────────────┘
             ↓ (usuário clica em área)
    ┌──────────────────────────────────────┐
    │  • Oculta botões de área              │
    │  • Adiciona msg do usuário            │
    │  • Estado: AREA_SELECTED                │
    │  • isTyping: true (800ms)             │
    └────────┬───────────────────────────────┘
             ↓
    ┌──────────────────────────────────────┐
    │  Mensagem de subárea:                 │
    │  "Entendi. Qual assunto melhor        │
    │   descreve sua situação?"            │
    │  Estado: AWAITING_SUBAREA_SELECTION   │
    │  showSubareaButtons: true             │
    └────────┬───────────────────────────────┘
             ↓
    ┌──────────────────────────────────────┐
    │  Exibe botões de subárea              │
    │  (5 opções baseadas na área)          │
    │  Ex: Previdenciário:                  │
    │    • BPC/LOAS                         │
    │    • Aposentadoria                    │
    │    • Auxílio-doença                   │
    │    • Pensão                           │
    │    • Revisão                          │
    └────────┬───────────────────────────────┘
             ↓ (usuário clica em subárea)
    ┌──────────────────────────────────────┐
    │  • Oculta botões de subárea           │
    │  • Adiciona msg do usuário            │
    │  • Estado: SUBAREA_SELECTED           │
    │  • isTyping: true (800ms)             │
    └────────┬───────────────────────────────┘
             ↓
    ┌──────────────────────────────────────┐
    │  Mensagem de confirmação:             │
    │  "Perfeito! Você selecionou:          │
    │   Área > Subárea"                     │
    │  "Em breve nossa equipe..."           │
    └──────────────────────────────────────┘
```

### Estados FSM V2

```
START
  ↓ (auto ao abrir chat)
AWAITING_AREA_SELECTION
  ↓ (onSelectArea)
AREA_SELECTED
  ↓ (auto após 800ms)
AWAITING_SUBAREA_SELECTION
  ↓ (onSelectSubarea)
SUBAREA_SELECTED
  ↓ (futuro: coleta de dados)
COLLECTING_NAME
  ↓ ...
```

### Contexto FSM V2

```typescript
{
  areaSelecionada: "Previdenciário",      // Preenchido após área
  subareaSelecionada: "Aposentadoria",    // Preenchido após subárea
  qualificacaoCompleta: false,
  dadosColetados: { ... }
}
```

---

## Componentes Modificados

| Componente | Alterações |
|------------|------------|
| `chat.types.ts` | + Tipos de subárea, + Estados FSM, + Props, + Constantes |
| `SubareaSelector.tsx` | **NOVO**: Seleção dinâmica de subáreas |
| `AreaSelector.tsx` | (sem alterações) |
| `MessageList.tsx` | + Renderização condicional de subáreas |
| `ChatWindow.tsx` | + Passagem de props de subárea |
| `ChatWidget.tsx` | + Fluxo completo de subárea, + Estados, + Handlers |
| `index.ts` | + Export SubareaSelector |

---

## Teste Rápido

### Verificar funcionamento:

1. Abrir o chat → mensagem inicial + botões de área
2. Clicar em "⚖️ Previdenciário" → mensagem do usuário
3. Verificar "digitando..." por ~800ms
4. Mensagem "Entendi. Qual assunto..." aparece
5. Botões de subárea aparecem:
   - BPC/LOAS
   - Aposentadoria
   - Auxílio-doença
   - Pensão
   - Revisão
6. Clicar em "Aposentadoria" → mensagem do usuário
7. Verificar "digitando..." por ~800ms
8. Mensagem de confirmação:
   "Perfeito! Você selecionou: Previdenciário > Aposentadoria"

### Testar outras áreas:

- Trabalhista → 5 opções diferentes
- Tributário → 4 opções diferentes
- Cível → 4 opções diferentes

---

## Status

✅ **IMPLEMENTADO**

- [x] Tipos de subáreas para 4 áreas jurídicas
- [x] Estados FSM: AWAITING_SUBAREA_SELECTION, SUBAREA_SELECTED
- [x] Componente SubareaSelector dinâmico
- [x] Fluxo: Área → Digitação → Subárea → Confirmação
- [x] Mensagem "Entendi. Qual assunto melhor descreve sua situação?"
- [x] Salvamento no contexto FSM
- [x] Sem integração backend
- [x] Sem integração Hermes
- [x] Persistência local apenas

---

## Próximos Passos (Sprints Futuras)

1. **Sprint 3**: Coleta de dados do lead (nome, email, telefone)
2. **Sprint 4**: Integração com PostgreSQL
3. **Sprint 5**: Integração N8N para orquestração
4. **Sprint 6**: Integração com Kinbox (CRM)

---

## Estrutura FSM Expandida

O sistema agora suporta:

```typescript
// 2 níveis de qualificação
Area (4 opções)
  └── Subárea (4-5 opções cada)

// Estados bem definidos
START
  → AWAITING_AREA_SELECTION
    → AREA_SELECTED
      → AWAITING_SUBAREA_SELECTION
        → SUBAREA_SELECTED
          → (futuro) COLLECTING_DATA...

// Eventos estruturados
SELECT_AREA → SELECT_SUBAREA → SUBMIT_DATA → ...
```

**Pronto para expansão em cascata com múltiplos níveis de qualificação.**

---

## Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│  ChatWidget (Orquestração)          │
│  - Estados FSM                      │
│  - Fluxo de qualificação            │
│  - Contexto                         │
├─────────────────────────────────────┤
│  ChatWindow (Container)             │
│  - Layout                           │
│  - Props drill                      │
├─────────────────────────────────────┤
│  MessageList (Apresentação)         │
│  - Render mensagens                 │
│  - Botões condicionais              │
├─────────────────────────────────────┤
│  AreaSelector / SubareaSelector     │
│  (Componentes de UI)                │
│  - Botões                           │
│  - Event handlers                   │
└─────────────────────────────────────┘
```

---

## Código de Referência: Subáreas

```typescript
// Acesso rápido às subáreas por área
const subareas = {
  previdenciario: ["BPC/LOAS", "Aposentadoria", "Auxílio-doença", "Pensão", "Revisão"],
  trabalhista: ["Rescisão", "FGTS", "Horas Extras", "Assédio", "Acidente de Trabalho"],
  tributario: ["Impostos", "Planejamento Tributário", "Restituição", "Execução Fiscal"],
  civel: ["Contratos", "Consumidor", "Família", "Indenização"],
};
```

---

## Resumo da Evolução

| Aspecto | V1 (Anterior) | V2 (Atual) |
|---------|---------------|------------|
| Níveis de qualificação | 1 (Área) | 2 (Área + Subárea) |
| Estados FSM | 2 | 4 |
| Opções de área | 4 | 4 |
| Opções de subárea | 0 | 17 (total) |
| Mensagens do bot | 2 | 3 |
| Componentes de seleção | 1 | 2 |

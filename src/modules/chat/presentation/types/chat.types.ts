/**
 * Tipos TypeScript do módulo Chat
 * Sprint 1: Tipos básicos
 */

// Tipos de remetente
export type SenderType = "USER" | "BOT" | "SYSTEM";

// Estados da máquina de estados (FSM - Finite State Machine)
// Preparado para integração futura com N8N
export type ChatState =
  | "START"
  | "AWAITING_AREA_SELECTION"    // Novo: Aguardando seleção de área
  | "AREA_SELECTED"              // Novo: Área foi selecionada
  | "COLLECTING_NAME"
  | "COLLECTING_EMAIL"
  | "COLLECTING_PHONE"
  | "COLLECTING_LOCATION"
  | "SELECTING_AREA"
  | "DESCRIBING_CASE"
  | "READY_TO_CLOSE"
  | "CLOSED";

// Áreas jurídicas disponíveis
export type AreaJuridica = "Previdenciário" | "Trabalhista" | "Tributário" | "Cível";

// Configuração de cada área para os botões
export interface AreaOption {
  id: AreaJuridica;
  label: string;
  emoji: string;
  description?: string;
}

// Áreas disponíveis para seleção
export const AREAS_JURIDICAS: AreaOption[] = [
  { id: "Previdenciário", label: "Previdenciário", emoji: "⚖️" },
  { id: "Trabalhista", label: "Trabalhista", emoji: "💼" },
  { id: "Tributário", label: "Tributário", emoji: "🏛️" },
  { id: "Cível", label: "Cível", emoji: "📋" },
];

// Contexto da FSM - preparado para expansão futura
export interface FSMContext {
  areaSelecionada?: AreaJuridica;
  qualificacaoCompleta?: boolean;
  dadosColetados?: {
    nome?: string;
    email?: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
  };
  // Extensível para novos campos
  [key: string]: any;
}

// Eventos da FSM (para integração futura com N8N)
export type FSMEvent =
  | { type: "SELECT_AREA"; area: AreaJuridica }
  | { type: "SUBMIT_DATA"; field: string; value: string }
  | { type: "NEXT_STEP" }
  | { type: "CLOSE_CHAT" }
  | { type: "RESTART" };

// Interface de Mensagem
export interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: SenderType;
  content: string;
  contentHtml?: string;
  metadata?: {
    type?: string;
    nextState?: string;
    requiresAction?: boolean;
    [key: string]: any;
  };
  createdAt: string;
}

// Interface de Cliente
export interface ChatClient {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  areaJuridica?: string;
  subarea?: string;
  createdAt: string;
}

// Interface de Sessão
export interface ChatSession {
  id: string;
  clientId?: string;
  currentState: ChatState;
  context?: Record<string, any>;
  source?: string;
  consentLgpd: boolean;
  createdAt: string;
  expiresAt: string;
  closedAt?: string;
  protocolNumber?: string;
  // Dados do cliente (joined)
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

// DTOs para API
export interface CreateSessionDTO {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  source?: string;
  consentLgpd?: boolean;
}

export interface SendMessageDTO {
  content: string;
}

// Respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  state: ChatState;
  expiresAt: string;
  welcomeMessage: ChatMessage;
}

export interface GetSessionResponse {
  session: ChatSession;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  botResponse: ChatMessage;
  currentState: ChatState;
}

// Props dos componentes
export interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

export interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  loading: boolean;
  isTyping?: boolean;                    // Indicador de digitação
  currentState?: ChatState;              // Estado atual da FSM
  onSelectArea?: (area: AreaJuridica) => void;  // Callback seleção de área
  showAreaButtons?: boolean;             // Mostrar botões de área
}

export interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  isTyping?: boolean;                    // Indicador de "digitando..."
  currentState?: ChatState;              // Para decisões de UI
  onSelectArea?: (area: AreaJuridica) => void;  // Callback para seleção
  showAreaButtons?: boolean;             // Controlar exibição dos botões
}

// Props para componente de seleção de área
export interface AreaSelectorProps {
  onSelect: (area: AreaJuridica) => void;
  disabled?: boolean;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
}

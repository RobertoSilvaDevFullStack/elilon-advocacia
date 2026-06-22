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
  | "AWAITING_AREA_SELECTION"        // Aguardando seleção de área
  | "AREA_SELECTED"                  // Área foi selecionada
  | "AWAITING_SUBAREA_SELECTION"     // Aguardando seleção de subárea
  | "SUBAREA_SELECTED"               // Subárea foi selecionada
  // Estados de coleta de dados do cliente
  | "AWAITING_NAME"                  // Aguardando nome
  | "NAME_COLLECTED"                 // Nome coletado
  | "AWAITING_PHONE"                 // Aguardando telefone
  | "PHONE_COLLECTED"                // Telefone coletado
  | "AWAITING_EMAIL"                 // Aguardando email
  | "EMAIL_COLLECTED"                // Email coletado
  | "AWAITING_CITY"                  // Aguardando cidade
  | "CITY_COLLECTED"                 // Cidade coletada
  | "AWAITING_STATE"                 // Aguardando estado
  | "STATE_COLLECTED"                // Estado coletado
  | "AWAITING_CASE_DESCRIPTION"      // Aguardando descrição do caso
  | "CASE_DESCRIPTION_COLLECTED"     // Descrição coletada
  // Estados de upload de documentos (Sprint 3.4)
  | "AWAITING_DOCUMENT_UPLOAD_OPTION"  // Aguardando escolha sobre upload
  | "DOCUMENT_UPLOAD_OPTION_SELECTED"  // Opção de upload selecionada
  | "UPLOADING_DOCUMENTS"              // Processando upload
  | "DOCUMENTS_UPLOADED"               // Documentos enviados
  | "QUALIFICATION_COMPLETE"         // Qualificação completa
  | "AWAITING_SUMMARY_CONFIRMATION"  // Aguardando confirmação do resumo N8N (Sprint 4.0.2)
  | "SUMMARY_CONFIRMED"              // Resumo confirmado pelo cliente
  | "AWAITING_AI_QUESTION"           // Aguardando resposta do usuário para pergunta da IA
  | "AI_INVESTIGATION_COMPLETE"      // IA concluiu investigação do caso
  // Estados legados (mantidos para compatibilidade)
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

// Subáreas jurídicas por área
export type SubareaPrevidenciario = "BPC/LOAS" | "Aposentadoria" | "Auxílio-doença" | "Pensão" | "Revisão";
export type SubareaTrabalhista = "Rescisão" | "FGTS" | "Horas Extras" | "Assédio" | "Acidente de Trabalho";
export type SubareaTributario = "Impostos" | "Planejamento Tributário" | "Restituição" | "Execução Fiscal";
export type SubareaCivel = "Contratos" | "Consumidor" | "Família" | "Indenização";

export type SubareaJuridica = SubareaPrevidenciario | SubareaTrabalhista | SubareaTributario | SubareaCivel;

// Configuração de cada área para os botões
export interface AreaOption {
  id: AreaJuridica;
  label: string;
  emoji: string;
  description?: string;
}

// Configuração de cada subárea
export interface SubareaOption {
  id: SubareaJuridica;
  label: string;
  area: AreaJuridica;
}

// Áreas disponíveis para seleção
export const AREAS_JURIDICAS: AreaOption[] = [
  { id: "Previdenciário", label: "Previdenciário", emoji: "⚖️" },
  { id: "Trabalhista", label: "Trabalhista", emoji: "💼" },
  { id: "Tributário", label: "Tributário", emoji: "🏛️" },
  { id: "Cível", label: "Cível", emoji: "📋" },
];

// Subáreas organizadas por área
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

// Contexto da FSM - preparado para expansão futura
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
    descricaoCaso?: string;
  };
  // Sprint 3.4: Documentos enviados
  documentos?: DocumentUploadData;
  // Preparação para Hermes (análise da descrição)
  caseAnalysis?: CaseDescriptionData;
  // Extensível para novos campos
  [key: string]: any;
}

// Eventos da FSM (para integração futura com N8N)
export type FSMEvent =
  | { type: "SELECT_AREA"; area: AreaJuridica }
  | { type: "SELECT_SUBAREA"; subarea: SubareaJuridica; area: AreaJuridica }
  | { type: "SUBMIT_NAME"; name: string }
  | { type: "SUBMIT_PHONE"; phone: string }
  | { type: "SUBMIT_EMAIL"; email: string }
  | { type: "SUBMIT_CITY"; city: string }
  | { type: "SUBMIT_STATE"; state: string }
  | { type: "SUBMIT_CASE_DESCRIPTION"; description: string }
  | { type: "SELECT_DOCUMENT_UPLOAD_OPTION"; option: "UPLOAD_NOW" | "UPLOAD_LATER" }
  | { type: "UPLOAD_DOCUMENTS"; files: UploadedDocument[] }
  | { type: "DOCUMENTS_UPLOAD_COMPLETE"; documents: UploadedDocument[] }
  | { type: "VALIDATION_ERROR"; field: string; error: string }
  | { type: "CORRECT_FIELD"; field: string }
  | { type: "SUBMIT_DATA"; field: string; value: string }
  | { type: "NEXT_STEP" }
  | { type: "CLOSE_CHAT" }
  | { type: "RESTART" };

// Campos de coleta de dados
export type DataField = "name" | "phone" | "email" | "city" | "state" | "caseDescription";

// Sprint 3.4: Tipos de documento aceitos
export type AllowedDocumentType = "PDF" | "JPG" | "JPEG" | "PNG" | "DOCX";

// Sprint 3.4: Interface para metadados do documento
export interface DocumentMetadata {
  originalName: string;
  fileName: string;
  extension: AllowedDocumentType;
  size: number; // em bytes
  mimeType: string;
  uploadedAt: string;
  // Preparação para futura integração MinIO
  storagePath?: string;
  bucket?: string;
  url?: string;
}

// Sprint 3.4: Interface para documento enviado
export interface UploadedDocument {
  id: string;
  file: File;
  metadata: DocumentMetadata;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

// Sprint 3.4: Interface para dados de upload
export interface DocumentUploadData {
  documents: UploadedDocument[];
  totalSize: number;
  count: number;
  skipped: boolean; // true se usuário escolheu "Enviar depois"
}

// Resultado de validação
export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedValue?: string;
}

// Interface para resumo de qualificação
export interface QualificationSummary {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  caseDescription?: string;
  protocolo?: string;
  timestamp: string;
  // Sprint 3.4: Documentos no resumo
  documents?: DocumentUploadData;
}

// Interface para dados de descrição do caso (preparação para Hermes)
export interface CaseDescriptionData {
  area: AreaJuridica;
  subarea: SubareaJuridica;
  descricaoCaso: string;
  // Campos opcionais para futura análise da IA
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

// Interface preparada para persistência PostgreSQL
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
  // Sprint 3.4: Documentos (preparação para futura persistência)
  documents?: DocumentUploadData;
  createdAt: string;
  updatedAt: string;
  isComplete: boolean;
}

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
  isTyping?: boolean;                            // Indicador de digitação
  currentState?: ChatState;                      // Estado atual da FSM
  currentArea?: AreaJuridica | null;             // Área atualmente selecionada
  onSelectArea?: (area: AreaJuridica) => void;   // Callback seleção de área
  onSelectSubarea?: (subarea: SubareaJuridica) => void;  // Callback seleção de subárea
  showAreaButtons?: boolean;                     // Mostrar botões de área
  showSubareaButtons?: boolean;                  // Mostrar botões de subárea
  // Sprint 3.4: Props para upload de documentos
  showDocumentOption?: boolean;                  // Mostrar botões de opção de upload
  showDocumentUploader?: boolean;                // Mostrar interface de upload
  documentErrors?: string[];                       // Erros de validação de documentos
  onSelectDocumentOption?: (option: "UPLOAD_NOW" | "UPLOAD_LATER") => void;
  onDocumentUpload?: (files: FileList | null) => void;
  onSkipDocumentUpload?: () => void;
  isN8NLoading?: boolean;                        // Sprint 4.0.2: Aguardando resposta N8N
}

export interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  isTyping?: boolean;                            // Indicador de "digitando..."
  currentState?: ChatState;                      // Para decisões de UI
  currentArea?: AreaJuridica | null;             // Área atual para filtrar subáreas
  onSelectArea?: (area: AreaJuridica) => void;   // Callback para seleção de área
  onSelectSubarea?: (subarea: SubareaJuridica) => void;  // Callback seleção de subárea
  showAreaButtons?: boolean;                     // Controlar exibição dos botões de área
  showSubareaButtons?: boolean;                  // Controlar exibição dos botões de subárea
  // Sprint 3.4: Props para upload de documentos
  showDocumentOption?: boolean;                  // Mostrar botões de opção de upload
  showDocumentUploader?: boolean;                // Mostrar interface de upload
  documentErrors?: string[];                       // Erros de validação de documentos
  onSelectDocumentOption?: (option: "UPLOAD_NOW" | "UPLOAD_LATER") => void;
  onDocumentUpload?: (files: FileList | null) => void;
  onSkipDocumentUpload?: () => void;
}

// Props para componente de seleção de área
export interface AreaSelectorProps {
  onSelect: (area: AreaJuridica) => void;
  disabled?: boolean;
}

// Props para componente de seleção de subárea
export interface SubareaSelectorProps {
  area: AreaJuridica;
  onSelect: (subarea: SubareaJuridica) => void;
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

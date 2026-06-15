/**
 * Exportação centralizada do módulo Chat
 */

// Components
export { ChatWidget, ChatButton, ChatWindow } from "./presentation/components";

// Hooks
export { useChatSession, useChatMessages } from "./presentation/hooks";

// Types
export type {
  ChatSession,
  ChatMessage,
  ChatClient,
  ChatState,
  SenderType,
  CreateSessionDTO,
  SendMessageDTO,
} from "./presentation/types/chat.types";

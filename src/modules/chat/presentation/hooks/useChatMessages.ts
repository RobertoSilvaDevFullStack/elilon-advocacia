/**
 * Hook useChatMessages - Gerenciamento de mensagens do chat
 * Sprint 1: Enviar e receber mensagens
 */

import { useState, useCallback } from "react";
import { getApiBaseUrl } from "@/utils/api";
import type {
  ChatMessage,
  SendMessageDTO,
  SendMessageResponse,
  ApiResponse,
} from "../types/chat.types";

const API_URL = getApiBaseUrl();

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  addLocalMessage: (message: ChatMessage) => void;
}

export const useChatMessages = (
  sessionId: string | null
): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar mensagens da sessão
  const loadMessages = useCallback(
    async (sid: string) => {
      if (!sid) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/chat/session/${sid}/messages`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar mensagens");
        }

        const result: ApiResponse<{ messages: ChatMessage[] }> =
          await response.json();

        if (result.success && result.data) {
          setMessages(result.data.messages);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao carregar mensagens:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/chat/session/${sessionId}/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content.trim() } as SendMessageDTO),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao enviar mensagem");
        }

        const result: ApiResponse<SendMessageResponse> = await response.json();

        if (result.success && result.data) {
          // Adicionar mensagem do usuário
          const userMsg: ChatMessage = {
            ...result.data.userMessage,
            createdAt: new Date().toISOString(),
          };

          // Adicionar resposta do bot
          const botMsg: ChatMessage = {
            ...result.data.botResponse,
            createdAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, userMsg, botMsg]);
        } else {
          throw new Error(result.message || "Erro ao enviar mensagem");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao enviar mensagem:", err);
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  // Adicionar mensagem localmente (mensagens de sistema, etc)
  const addLocalMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMessages,
    addLocalMessage,
  };
};

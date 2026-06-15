/**
 * Hook useChatSession - Gerenciamento de sessão do chat
 * Sprint 1: Criar, recuperar e fechar sessões
 */

import { useState, useEffect, useCallback } from "react";
import { getApiBaseUrl } from "@/utils/api";
import type {
  ChatSession,
  CreateSessionDTO,
  CreateSessionResponse,
  ApiResponse,
} from "../types/chat.types";

const API_URL = getApiBaseUrl();
const SESSION_STORAGE_KEY = "chat_session_id";

interface UseChatSessionReturn {
  session: ChatSession | null;
  loading: boolean;
  error: string | null;
  startSession: (data?: CreateSessionDTO) => Promise<void>;
  recoverSession: () => Promise<void>;
  closeSession: () => Promise<void>;
  clearSession: () => void;
}

export const useChatSession = (): UseChatSessionReturn => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar sessão existente no localStorage ao montar
  useEffect(() => {
    const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSessionId && !session) {
      recoverSession();
    }
  }, []);

  // Criar nova sessão
  const startSession = useCallback(async (data: CreateSessionDTO = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "widget",
          consentLgpd: true,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao iniciar atendimento");
      }

      const result: ApiResponse<CreateSessionResponse> = await response.json();

      if (result.success && result.data) {
        const sessionData: ChatSession = {
          id: result.data.sessionId,
          currentState: result.data.state,
          expiresAt: result.data.expiresAt,
          consentLgpd: true,
          createdAt: new Date().toISOString(),
          source: "widget",
        };

        setSession(sessionData);
        localStorage.setItem(SESSION_STORAGE_KEY, result.data.sessionId);
      } else {
        throw new Error(result.message || "Erro ao criar sessão");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Erro ao iniciar sessão:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recuperar sessão existente
  const recoverSession = useCallback(async () => {
    const sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/chat/session/${sessionId}`);

      if (!response.ok) {
        // Sessão expirada ou inválida - limpar
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return;
      }

      const result: ApiResponse<{ session: ChatSession; messages: any[] }> =
        await response.json();

      if (result.success && result.data) {
        setSession(result.data.session);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Erro ao recuperar sessão:", err);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fechar sessão
  const closeSession = useCallback(async () => {
    if (!session) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/chat/session/${session.id}/close`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const result: ApiResponse<{ protocolNumber: string }> =
          await response.json();

        if (result.success && result.data) {
          // Atualizar sessão com protocolo
          setSession((prev) =>
            prev
              ? { ...prev, protocolNumber: result.data.protocolNumber }
              : null
          );
        }

        // Limpar após um delay para mostrar o protocolo
        setTimeout(() => {
          clearSession();
        }, 5000);
      }
    } catch (err) {
      console.error("Erro ao fechar sessão:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Limpar sessão local
  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  return {
    session,
    loading,
    error,
    startSession,
    recoverSession,
    closeSession,
    clearSession,
  };
};

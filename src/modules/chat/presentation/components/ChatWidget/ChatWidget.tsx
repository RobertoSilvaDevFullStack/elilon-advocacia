/**
 * ChatWidget - Componente principal integrador
 * Atualizado: Fluxo de qualificação local, mensagem inicial automática
 * FSM preparada para integração futura com N8N
 */

import React, { useEffect, useCallback, useState, useRef } from "react";
import { ChatButton } from "./ChatButton";
import { ChatWindow } from "./ChatWindow";
import type {
  ChatMessage,
  ChatState,
  AreaJuridica,
  FSMContext,
} from "../../types/chat.types";

// Chaves para localStorage
const CTA_CLOSED_KEY = "chat_cta_closed_at";
const CTA_COOLDOWN_HOURS = 24;

// ID único para mensagens locais
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mensagem inicial do assistente
const MENSAGEM_INICIAL = `Olá! 👋

Sou a assistente virtual do escritório Elilon Lopes Advogados.

Posso ajudar você a identificar a melhor solução para o seu caso jurídico.

Para começarmos, qual área melhor representa sua necessidade?`;

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCta, setShowCta] = useState(false);

  // Estado local do chat (qualificação V1 - sem backend)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentState, setCurrentState] = useState<ChatState>("START");
  const [isTyping, setIsTyping] = useState(false);
  const [showAreaButtons, setShowAreaButtons] = useState(false);
  const [context, setContext] = useState<FSMContext>({});
  const [sessionId] = useState(() => generateId()); // ID local da sessão

  const hasInitialized = useRef(false);

  // Alternar visibilidade do chat
  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Fechar chat
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Simular digitação do assistente
  const simulateTyping = useCallback((duration: number = 1000) => {
    setIsTyping(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, duration);
    });
  }, []);

  // Adicionar mensagem do bot
  const addBotMessage = useCallback(
    async (content: string, showButtons: boolean = false) => {
      await simulateTyping(1000);

      const newMessage: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "BOT",
        content,
        createdAt: new Date().toISOString(),
        metadata: {
          type: "bot_response",
          state: currentState,
        },
      };

      setMessages((prev) => [...prev, newMessage]);

      if (showButtons) {
        setTimeout(() => setShowAreaButtons(true), 300);
      }
    },
    [currentState, sessionId, simulateTyping]
  );

  // Adicionar mensagem do usuário
  const addUserMessage = useCallback(
    (content: string, metadata?: Record<string, any>) => {
      const newMessage: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "USER",
        content,
        createdAt: new Date().toISOString(),
        metadata,
      };

      setMessages((prev) => [...prev, newMessage]);
    },
    [sessionId]
  );

  // Iniciar fluxo de qualificação
  const startQualification = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Transição de estado: START → AWAITING_AREA_SELECTION
    setCurrentState("AWAITING_AREA_SELECTION");

    // Exibir mensagem inicial com simulação de digitação
    await addBotMessage(MENSAGEM_INICIAL, true);
  }, [addBotMessage]);

  // Handler para seleção de área
  const handleSelectArea = useCallback(
    async (area: AreaJuridica) => {
      // Registrar seleção no contexto FSM
      setContext((prev) => ({
        ...prev,
        areaSelecionada: area,
      }));

      // Ocultar botões imediatamente
      setShowAreaButtons(false);

      // Adicionar mensagem do usuário
      addUserMessage(`${area}`, { type: "area_selection", area });

      // Transição de estado: AWAITING_AREA_SELECTION → AREA_SELECTED
      setCurrentState("AREA_SELECTED");

      // Resposta de confirmação
      await simulateTyping(800);

      const confirmMessage: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "BOT",
        content: `Entendido! Você selecionou a área ${area}.\n\nEm breve nossa equipe especializada entrará em contato para dar continuidade ao seu atendimento.`,
        createdAt: new Date().toISOString(),
        metadata: {
          type: "confirmation",
          area,
          state: "AREA_SELECTED",
        },
      };

      setMessages((prev) => [...prev, confirmMessage]);
    },
    [addUserMessage, sessionId, simulateTyping]
  );

  // Enviar mensagem manual (input de texto)
  const handleSendMessage = useCallback(
    async (content: string) => {
      // Se ainda não iniciou, começar qualificação
      if (currentState === "START" && messages.length === 0) {
        addUserMessage(content);
        await startQualification();
        return;
      }

      // Adicionar mensagem do usuário normalmente
      addUserMessage(content);

      // Simular resposta genérica (V1 - sem backend)
      await simulateTyping(1000);

      const genericResponse: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "BOT",
        content:
          "Recebemos sua mensagem. Nossa equipe analisará e retornará em breve.",
        createdAt: new Date().toISOString(),
        metadata: { type: "generic_response" },
      };

      setMessages((prev) => [...prev, genericResponse]);
    },
    [addUserMessage, currentState, messages.length, sessionId, simulateTyping, startQualification]
  );

  // Iniciar qualificação automaticamente ao abrir o chat
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasInitialized.current) {
      // Pequeno delay para animação suave
      const timer = setTimeout(() => {
        startQualification();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length, startQualification]);

  // Verificar se CTA deve ser exibido (não fechado nas últimas 24h)
  const shouldShowCta = useCallback(() => {
    try {
      const closedAt = localStorage.getItem(CTA_CLOSED_KEY);
      if (!closedAt) return true;

      const closedTime = new Date(closedAt).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - closedTime) / (1000 * 60 * 60);

      return hoursDiff >= CTA_COOLDOWN_HOURS;
    } catch {
      return true;
    }
  }, []);

  // Mostrar CTA após 3 segundos
  useEffect(() => {
    if (!isOpen && shouldShowCta()) {
      const timer = setTimeout(() => {
        setShowCta(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldShowCta]);

  // Fechar CTA e salvar no localStorage
  const handleCloseCta = useCallback(() => {
    setShowCta(false);
    try {
      localStorage.setItem(CTA_CLOSED_KEY, new Date().toISOString());
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
  }, []);

  // Quando abrir o chat, esconder CTA
  useEffect(() => {
    if (isOpen && showCta) {
      setShowCta(false);
    }
  }, [isOpen, showCta]);

  return (
    <>
      {/* Botão flutuante */}
      <ChatButton
        onClick={toggleChat}
        isOpen={isOpen}
        unreadCount={0}
        showCta={showCta}
        onCloseCta={handleCloseCta}
      />

      {/* Janela do chat */}
      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        session={null} // V1: sem backend
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={false}
        isTyping={isTyping}
        currentState={currentState}
        onSelectArea={handleSelectArea}
        showAreaButtons={showAreaButtons}
      />
    </>
  );
};

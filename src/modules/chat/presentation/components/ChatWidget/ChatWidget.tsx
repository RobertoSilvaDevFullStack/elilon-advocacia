/**
 * ChatWidget - Componente principal integrador
 * Sprint 3: Fluxo de qualificação com coleta sequencial de dados
 * FSM preparada para integração futura com N8N
 */

import React, { useEffect, useCallback, useState, useRef } from "react";
import { ChatButton } from "./ChatButton";
import { ChatWindow } from "./ChatWindow";
import type {
  ChatMessage,
  ChatState,
  AreaJuridica,
  SubareaJuridica,
  FSMContext,
  DataField,
} from "../../types/chat.types";
import { validateField, getFieldPromptMessage } from "../../utils/validation";

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

// Mensagem de solicitação de subárea
const MENSAGEM_SUBAREA = "Entendi. Qual assunto melhor descreve sua situação?";

// Mensagem de introdução à coleta de dados
const MENSAGEM_INTRODUCAO_DADOS = `Perfeito! Agora preciso de algumas informações para registrar seu atendimento.`;

// Mensagem de conclusão
const MENSAGEM_CONCLUSAO = "Perfeito! Seu pré-atendimento foi registrado.";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCta, setShowCta] = useState(false);

  // Estado local do chat (qualificação V3 - com coleta de dados)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentState, setCurrentState] = useState<ChatState>("START");
  const [isTyping, setIsTyping] = useState(false);
  const [showAreaButtons, setShowAreaButtons] = useState(false);
  const [showSubareaButtons, setShowSubareaButtons] = useState(false);
  const [currentArea, setCurrentArea] = useState<AreaJuridica | null>(null);
  const [context, setContext] = useState<FSMContext>({});
  const [sessionId] = useState(() => generateId()); // ID local da sessão

  // Estado para retry de campo inválido
  const [awaitingCorrection, setAwaitingCorrection] = useState<{ field: DataField; originalValue: string } | null>(null);

  const hasInitialized = useRef(false);

  // Sequência de campos para coleta
  const fieldSequence: DataField[] = ["name", "phone", "email", "city", "state"];

  // Map de estados FSM para campos
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

  // Adicionar mensagem do bot (sobrecarga com typingDuration)
  const addBotMessage = useCallback(
    async (content: string, options?: { showAreaButtons?: boolean; typingDuration?: number; showSubareaButtons?: boolean }) => {
      const typingDuration = options?.typingDuration ?? 800;
      await simulateTyping(typingDuration);

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

      if (options?.showAreaButtons) {
        setTimeout(() => setShowAreaButtons(true), 300);
      }

      if (options?.showSubareaButtons) {
        setTimeout(() => setShowSubareaButtons(true), 300);
      }
    },
    [currentState, sessionId, simulateTyping]
  );

  // Solicitar próximo campo na sequência
  const requestNextField = useCallback(
    async (field: DataField, isRetry: boolean = false) => {
      const stateMap: Record<DataField, ChatState> = {
        name: "AWAITING_NAME",
        phone: "AWAITING_PHONE",
        email: "AWAITING_EMAIL",
        city: "AWAITING_CITY",
        state: "AWAITING_STATE",
      };

      setCurrentState(stateMap[field]);

      const prompt = getFieldPromptMessage(field, isRetry);
      await addBotMessage(prompt, { typingDuration: 600 });
    },
    [addBotMessage]
  );

  // Iniciar coleta de dados após seleção de subárea
  const startDataCollection = useCallback(async () => {
    // Mensagem de introdução
    await addBotMessage(MENSAGEM_INTRODUCAO_DADOS, { typingDuration: 800 });

    // Iniciar com primeiro campo (nome)
    await requestNextField("name");
  }, [addBotMessage, requestNextField]);

  // Processar dado coletado e validar
  const processCollectedData = useCallback(
    async (field: DataField, value: string) => {
      // Validar campo
      const validation = validateField(field, value);

      if (!validation.valid) {
        // Campo inválido - solicitar correção
        setAwaitingCorrection({ field, originalValue: value });

        // Mensagem de erro
        await addBotMessage(
          `${validation.error}\n\nVamos tentar novamente.`,
          { typingDuration: 500 }
        );

        // Re-solicitar o mesmo campo
        await requestNextField(field, true);
        return;
      }

      // Campo válido - limpar estado de correção
      setAwaitingCorrection(null);

      const normalizedValue = validation.normalizedValue || value;
      const nextStateConfig = fieldNextStateMap[field];

      // Atualizar contexto FSM
      setContext((prev) => ({
        ...prev,
        dadosColetados: {
          ...prev.dadosColetados,
          [field === "name" ? "nome" :
            field === "phone" ? "telefone" :
            field === "email" ? "email" :
            field === "city" ? "cidade" :
            "estado"]: normalizedValue,
        },
      }));

      // Transição para estado coletado
      setCurrentState(nextStateConfig.collected);

      // Se for o último campo (estado), mostrar resumo
      if (field === "state") {
        // Pequeno delay antes do resumo
        await simulateTyping(600);
        await showQualificationSummary();
      } else {
        // Solicitar próximo campo
        const nextField = fieldSequence[fieldSequence.indexOf(field) + 1];
        await requestNextField(nextField);
      }
    },
    [addBotMessage, requestNextField, simulateTyping]
  );

  // Mostrar resumo da qualificação
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

${MENSAGEM_CONCLUSAO}`;

    setCurrentState("QUALIFICATION_COMPLETE");
    context.qualificacaoCompleta = true;

    await addBotMessage(resumo, { typingDuration: 800 });
  }, [addBotMessage, context]);

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
    await addBotMessage(MENSAGEM_INICIAL, { showAreaButtons: true, typingDuration: 1000 });
  }, [addBotMessage]);

  // Handler para seleção de área
  const handleSelectArea = useCallback(
    async (area: AreaJuridica) => {
      // Registrar seleção no contexto FSM
      setContext((prev) => ({
        ...prev,
        areaSelecionada: area,
      }));

      // Salvar área atual para filtrar subáreas
      setCurrentArea(area);

      // Ocultar botões de área imediatamente
      setShowAreaButtons(false);

      // Adicionar mensagem do usuário
      addUserMessage(`${area}`, { type: "area_selection", area });

      // Transição de estado: AWAITING_AREA_SELECTION → AREA_SELECTED
      setCurrentState("AREA_SELECTED");

      // Simular digitação (800ms)
      await simulateTyping(800);

      // Mensagem solicitando subárea
      await addBotMessage(MENSAGEM_SUBAREA, { showSubareaButtons: true, typingDuration: 800 });

      // Transição de estado: AREA_SELECTED → AWAITING_SUBAREA_SELECTION
      setCurrentState("AWAITING_SUBAREA_SELECTION");
    },
    [addUserMessage, sessionId, simulateTyping]
  );

  // Handler para seleção de subárea
  const handleSelectSubarea = useCallback(
    async (subarea: SubareaJuridica) => {
      if (!currentArea) return;

      // Registrar seleção no contexto FSM
      setContext((prev) => ({
        ...prev,
        subareaSelecionada: subarea,
      }));

      // Ocultar botões de subárea imediatamente
      setShowSubareaButtons(false);

      // Adicionar mensagem do usuário
      addUserMessage(`${subarea}`, { type: "subarea_selection", subarea, area: currentArea });

      // Transição de estado: AWAITING_SUBAREA_SELECTION → SUBAREA_SELECTED
      setCurrentState("SUBAREA_SELECTED");

      // Simular digitação (800ms)
      await simulateTyping(800);

      // Mensagem de confirmação da subárea
      const confirmMessage: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "BOT",
        content: `Perfeito! Você selecionou: ${currentArea} > ${subarea}.`,
        createdAt: new Date().toISOString(),
        metadata: {
          type: "subarea_confirmation",
          area: currentArea,
          subarea,
          state: "SUBAREA_SELECTED",
        },
      };

      setMessages((prev) => [...prev, confirmMessage]);

      // Iniciar coleta de dados sequencial
      await startDataCollection();
    },
    [addUserMessage, currentArea, sessionId, simulateTyping, startDataCollection]
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

      // Verificar se estamos em estado de coleta de dados
      const currentField = stateToFieldMap[currentState];
      if (currentField) {
        // Adicionar mensagem do usuário
        addUserMessage(content, { type: "data_input", field: currentField });

        // Processar dado coletado
        await processCollectedData(currentField, content);
        return;
      }

      // Se qualificação já está completa, apenas agradecer
      if (currentState === "QUALIFICATION_COMPLETE") {
        addUserMessage(content);
        await simulateTyping(600);

        const response: ChatMessage = {
          id: generateId(),
          sessionId,
          senderType: "BOT",
          content: "Obrigado! Seu pré-atendimento já foi registrado. Nossa equipe entrará em contato em breve.",
          createdAt: new Date().toISOString(),
          metadata: { type: "post_qualification" },
        };
        setMessages((prev) => [...prev, response]);
        return;
      }

      // Resposta genérica para outros estados
      addUserMessage(content);
      await simulateTyping(800);

      const genericResponse: ChatMessage = {
        id: generateId(),
        sessionId,
        senderType: "BOT",
        content: "Recebemos sua mensagem. Nossa equipe analisará e retornará em breve.",
        createdAt: new Date().toISOString(),
        metadata: { type: "generic_response" },
      };

      setMessages((prev) => [...prev, genericResponse]);
    },
    [addUserMessage, currentState, messages.length, sessionId, simulateTyping, startQualification, processCollectedData]
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
        session={null} // V2: sem backend
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={false}
        isTyping={isTyping}
        currentState={currentState}
        currentArea={currentArea}
        onSelectArea={handleSelectArea}
        onSelectSubarea={handleSelectSubarea}
        showAreaButtons={showAreaButtons}
        showSubareaButtons={showSubareaButtons}
      />
    </>
  );
};

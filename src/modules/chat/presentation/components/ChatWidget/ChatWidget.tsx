/**
 * ChatWidget - Componente principal integrador
 * Sprint 3.2: Persistência e Protocolo
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
import { validateField, validateCaseDescription, getFieldPromptMessage } from "../../utils/validation";

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

// Mensagem de conclusão (sem protocolo - será substituída)
const MENSAGEM_CONCLUSAO_BASE = `Perfeito!

Seu pré-atendimento foi registrado com sucesso.

Na próxima etapa suas informações poderão ser encaminhadas para análise da equipe jurídica.`;

// Mensagem de conclusão com protocolo
const MENSAGEM_CONCLUSAO_COM_PROTOCOLO = (protocolo: string) => `✅ **Pré-atendimento registrado**

**Protocolo:** ${protocolo}

Nossa equipe jurídica analisará as informações e entrará em contato.`;

// Mensagem de erro na persistência
const MENSAGEM_ERRO_PERSISTENCIA = `❌ **Erro ao registrar**

Não foi possível salvar seu pré-atendimento no momento.

Por favor, tente novamente ou entre em contato pelo WhatsApp.`;

// Mensagem de agradecimento pela descrição
const MENSAGEM_AGRADECIMENTO_DESCRICAO = "Obrigado pelas informações.\n\nEstamos organizando os dados do seu pré-atendimento.";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCta, setShowCta] = useState(false);

  // Estado local do chat (qualificação V3.2 - com persistência)
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

  // Sprint 3.2: Estado para persistência
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const hasInitialized = useRef(false);

  // Sequência de campos para coleta
  const fieldSequence: DataField[] = ["name", "phone", "email", "city", "state", "caseDescription"];

  // Map de estados FSM para campos
  const stateToFieldMap: Record<string, DataField> = {
    AWAITING_NAME: "name",
    AWAITING_PHONE: "phone",
    AWAITING_EMAIL: "email",
    AWAITING_CITY: "city",
    AWAITING_STATE: "state",
    AWAITING_CASE_DESCRIPTION: "caseDescription",
  };

  // Map de campos para próximos estados
  const fieldNextStateMap: Record<DataField, { collected: ChatState; nextAwaiting: ChatState }> = {
    name: { collected: "NAME_COLLECTED", nextAwaiting: "AWAITING_PHONE" },
    phone: { collected: "PHONE_COLLECTED", nextAwaiting: "AWAITING_EMAIL" },
    email: { collected: "EMAIL_COLLECTED", nextAwaiting: "AWAITING_CITY" },
    city: { collected: "CITY_COLLECTED", nextAwaiting: "AWAITING_STATE" },
    state: { collected: "STATE_COLLECTED", nextAwaiting: "AWAITING_CASE_DESCRIPTION" },
    caseDescription: { collected: "CASE_DESCRIPTION_COLLECTED", nextAwaiting: "QUALIFICATION_COMPLETE" },
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
        caseDescription: "AWAITING_CASE_DESCRIPTION",
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
      // Validar campo (usa validador específico para descrição do caso)
      const validation = field === "caseDescription"
        ? validateCaseDescription(value)
        : validateField(field, value);

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
            field === "caseDescription" ? "descricaoCaso" :
            "estado"]: normalizedValue,
        },
      }));

      // Transição para estado coletado
      setCurrentState(nextStateConfig.collected);

      // Se for o último campo (descrição), mostrar mensagem de agradecimento e depois resumo
      if (field === "caseDescription") {
        // Transição para estado coletado
        setCurrentState("CASE_DESCRIPTION_COLLECTED");

        // Mensagem de agradecimento (com digitação de 1 segundo)
        await simulateTyping(1000);
        await addBotMessage(MENSAGEM_AGRADECIMENTO_DESCRICAO, { typingDuration: 600 });

        // Pequeno delay antes do resumo
        await simulateTyping(800);
        await showQualificationSummary();
      } else if (field === "state") {
        // Após estado, solicitar descrição do caso
        const nextField = fieldSequence[fieldSequence.indexOf(field) + 1];
        await requestNextField(nextField);
      } else {
        // Solicitar próximo campo
        const nextField = fieldSequence[fieldSequence.indexOf(field) + 1];
        await requestNextField(nextField);
      }
    },
    [addBotMessage, requestNextField, simulateTyping]
  );

  // Sprint 3.2: Enviar dados para API
  const submitPreAtendimento = useCallback(async () => {
    const dados = context.dadosColetados || {};

    // Preparar payload
    const payload = {
      area: context.areaSelecionada,
      subarea: context.subareaSelecionada,
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email,
      cidade: dados.cidade,
      estado: dados.estado,
      descricaoCaso: dados.descricaoCaso
    };

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      const response = await fetch(`${API_BASE_URL}/chat/pre-atendimento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao registrar pré-atendimento");
      }

      // Sucesso - salvar protocolo
      setProtocolo(data.data.protocolo);
      return { success: true, protocolo: data.data.protocolo };
    } catch (error) {
      console.error("❌ Erro ao enviar pré-atendimento:", error);
      setSubmissionError(error instanceof Error ? error.message : "Erro desconhecido");
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
    } finally {
      setIsSubmitting(false);
    }
  }, [context]);

  // Mostrar resumo da qualificação e enviar para API
  const showQualificationSummary = useCallback(async () => {
    const dados = context.dadosColetados || {};

    // Exibir resumo primeiro
    const resumo = `📋 **Resumo do Pré-Atendimento**

**Área:** ${context.areaSelecionada || "-"}
**Subárea:** ${context.subareaSelecionada || "-"}
**Nome:** ${dados.nome || "-"}
**Telefone:** ${dados.telefone || "-"}
**E-mail:** ${dados.email || "-"}
**Cidade:** ${dados.cidade || "-"}
**Estado:** ${dados.estado || "-"}
**Descrição do Caso:** ${dados.descricaoCaso || "-"}

_Enviando dados..._`;

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
        },
      }));
    }

    // Enviar mensagem de resumo
    await addBotMessage(resumo, { typingDuration: 600 });

    // Enviar para API
    const result = await submitPreAtendimento();

    if (result.success && result.protocolo) {
      // Sucesso - mostrar protocolo
      await simulateTyping(600);
      await addBotMessage(MENSAGEM_CONCLUSAO_COM_PROTOCOLO(result.protocolo), { typingDuration: 600 });
    } else {
      // Erro - mostrar mensagem de erro
      await simulateTyping(600);
      await addBotMessage(MENSAGEM_ERRO_PERSISTENCIA, { typingDuration: 600 });
    }
  }, [addBotMessage, context, submitPreAtendimento, simulateTyping]);

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

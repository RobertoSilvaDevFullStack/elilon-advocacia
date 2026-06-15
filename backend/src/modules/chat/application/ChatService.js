/**
 * ChatService - Camada de aplicação (regras de negócio)
 * Sprint 1: Lógica básica de sessão e mensagens
 */

const chatRepository = require("../infrastructure/ChatRepository");

class ChatService {
  /**
   * Iniciar nova sessão de chat
   */
  async startSession(data, clientInfo) {
    // Criar cliente (dados iniciais)
    const client = await chatRepository.createClient({
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
    });

    // Criar sessão
    const session = await chatRepository.createSession({
      clientId: client.id,
      currentState: "START",
      source: data.source || "widget",
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      consentLgpd: data.consentLgpd || false,
    });

    // Criar mensagem de boas-vindas
    const welcomeMessage = await chatRepository.createMessage({
      sessionId: session.id,
      senderType: "BOT",
      content: this.getWelcomeMessage(),
      contentHtml: this.getWelcomeMessageHTML(),
      metadata: {
        type: "welcome",
        requiresAction: true,
        actionType: "collect_name",
      },
    });

    return {
      session: {
        ...session,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone,
      },
      welcomeMessage,
    };
  }

  /**
   * Recuperar sessão existente
   */
  async getSession(sessionId) {
    const session = await chatRepository.getSessionById(sessionId);

    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    if (new Date(session.expires_at) < new Date()) {
      throw new Error("Sessão expirada");
    }

    if (session.closed_at) {
      throw new Error("Sessão encerrada");
    }

    const messages = await chatRepository.getMessagesBySession(sessionId);

    return { session, messages };
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(sessionId, content, senderType = "USER") {
    // Verificar sessão
    const session = await this.getSession(sessionId);

    // Criar mensagem do usuário
    const userMessage = await chatRepository.createMessage({
      sessionId,
      senderType,
      content,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    // Gerar resposta do bot (Sprint 1: respostas estáticas/simples)
    const botResponse = await this.generateBotResponse(
      sessionId,
      session.session.current_state,
      content
    );

    return {
      userMessage,
      botResponse,
      session: session.session,
    };
  }

  /**
   * Fechar sessão
   */
  async closeSession(sessionId) {
    const session = await this.getSession(sessionId);

    // Gerar protocolo simples (Sprint 1)
    const protocolNumber = this.generateProtocolNumber();

    const closedSession = await chatRepository.closeSession(
      sessionId,
      protocolNumber
    );

    // Mensagem de encerramento
    await chatRepository.createMessage({
      sessionId,
      senderType: "SYSTEM",
      content: this.getClosingMessage(protocolNumber),
      metadata: {
        type: "closing",
        protocolNumber,
      },
    });

    return {
      session: closedSession,
      protocolNumber,
    };
  }

  /**
   * Gerar resposta do bot (Sprint 1: versão simplificada)
   */
  async generateBotResponse(sessionId, currentState, userMessage) {
    const responses = {
      START: {
        content: "Olá! Qual é o seu nome completo?",
        nextState: "COLLECTING_NAME",
        requiresAction: true,
      },
      COLLECTING_NAME: {
        content: `Prazer em conhecê-lo! Qual é o seu e-mail para contato?`,
        nextState: "COLLECTING_EMAIL",
        requiresAction: true,
      },
      COLLECTING_EMAIL: {
        content: "Obrigado! E qual é o seu telefone?",
        nextState: "COLLECTING_PHONE",
        requiresAction: true,
      },
      COLLECTING_PHONE: {
        content: "Perfeito! Em qual cidade e estado você reside?",
        nextState: "COLLECTING_LOCATION",
        requiresAction: true,
      },
      COLLECTING_LOCATION: {
        content:
          "Entendido. Qual área jurídica melhor representa sua necessidade?\n\n1. Previdenciário\n2. Trabalhista\n3. Tributário\n4. Cível",
        nextState: "SELECTING_AREA",
        requiresAction: true,
      },
      SELECTING_AREA: {
        content:
          "Ótimo! Agora, por favor, descreva brevemente seu caso ou dúvida.",
        nextState: "DESCRIBING_CASE",
        requiresAction: true,
      },
      DESCRIBING_CASE: {
        content:
          "Agradecemos as informações! Seu atendimento foi registrado. Deseja encerrar o chat agora?",
        nextState: "READY_TO_CLOSE",
        requiresAction: true,
      },
      READY_TO_CLOSE: {
        content: "Chat finalizado. Obrigado pelo contato!",
        nextState: "CLOSED",
        requiresAction: false,
      },
    };

    const responseTemplate = responses[currentState] || responses["START"];

    // Atualizar estado da sessão
    await chatRepository.updateSessionState(
      sessionId,
      responseTemplate.nextState,
      { lastInteraction: new Date().toISOString() }
    );

    // Criar mensagem do bot
    const botMessage = await chatRepository.createMessage({
      sessionId,
      senderType: "BOT",
      content: responseTemplate.content,
      metadata: {
        type: "bot_response",
        nextState: responseTemplate.nextState,
        requiresAction: responseTemplate.requiresAction,
      },
    });

    return botMessage;
  }

  /**
   * Gerar número de protocolo
   */
  generateProtocolNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `PROT-${year}-${random}`;
  }

  /**
   * Mensagem de boas-vindas
   */
  getWelcomeMessage() {
    return "Bem-vindo ao Atendimento Jurídico da Elilon Lopes Advogados! Sou seu assistente virtual. Vou coletar algumas informações para direcionar seu atendimento.";
  }

  getWelcomeMessageHTML() {
    return `<p>Bem-vindo ao <strong>Atendimento Jurídico</strong> da Elilon Lopes Advogados!</p><p>Sou seu assistente virtual. Vou coletar algumas informações para direcionar seu atendimento.</p>`;
  }

  /**
   * Mensagem de encerramento
   */
  getClosingMessage(protocolNumber) {
    return `Recebemos suas informações com sucesso!\n\nSeu protocolo de atendimento é: ${protocolNumber}\n\nEm breve nossa equipe jurídica entrará em contato através dos canais informados.\n\nTodas as informações fornecidas são tratadas com confidencialidade e em conformidade com a LGPD.`;
  }
}

module.exports = new ChatService();

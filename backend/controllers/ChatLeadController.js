/**
 * ChatLeadController
 * Sprint 3.2: Persistência e Protocolo
 * 
 * Responsabilidades:
 * - Validar payload do pré-atendimento
 * - Chamar service de criação
 * - Retornar protocolo ao cliente
 */

const CreatePreAtendimentoService = require("../services/CreatePreAtendimentoService");
const hermesService = require("../services/HermesAnalysisService");
const chatWebhookService = require("../services/ChatWebhookService");
const PreAtendimentoRepository = require("../repositories/PreAtendimentoRepository");
const { logger } = require("../config/logger");

class ChatLeadController {
  constructor() {
    this.create = this.create.bind(this);
    this.findByProtocolo = this.findByProtocolo.bind(this);
  }

  /**
   * POST /api/chat/pre-atendimento
   * Cria um novo pré-atendimento do chat
   */
  async create(req, res) {
    try {
      const {
        area,
        subarea,
        nome,
        telefone,
        email,
        cidade,
        estado,
        descricaoCaso
      } = req.body;

      // Validação de campos obrigatórios
      const validationErrors = this.validatePayload({
        area,
        subarea,
        nome,
        telefone,
        email,
        cidade,
        estado,
        descricaoCaso
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Dados inválidos",
          details: validationErrors
        });
      }

      // Criar pré-atendimento
      const result = await CreatePreAtendimentoService.execute({
        area,
        subarea,
        nome,
        telefone,
        email,
        cidade,
        estado,
        descricaoCaso
      });

      // Sprint 3.9: Disparar webhook universal (não bloqueia a resposta)
      if (result && result.atendimentoId) {
        const atendimentoRecord = await PreAtendimentoRepository.findById(result.atendimentoId);
        chatWebhookService.dispatch(result.atendimentoId, {
          atendimento: atendimentoRecord,
          documentos: [],
          hermes: null,
        }).catch((err) =>
          logger.error("[ChatWebhook] Falha no dispatch inicial", { error: err.message })
        );
      }

      // Sprint 3.5: Disparar análise Hermes (não bloqueia a resposta)
      if (result && result.atendimentoId) {
        logger.info('[Hermes] Enfileirando análise', { preAtendimentoId: result.atendimentoId });
        
        // Disparar análise em background (não aguardar)
        hermesService.analyzePreAtendimento(result.atendimentoId, {
          area,
          subarea,
          nome,
          telefone,
          email,
          cidade,
          estado,
          descricao: descricaoCaso
        }).catch(error => {
          logger.error('[Hermes] Falha em análise em background', {
            preAtendimentoId: result.id,
            error: error.message
          });
        });
      }

      // Retornar sucesso com protocolo (sem aguardar análise)
      return res.status(201).json({
        success: true,
        message: "Pré-atendimento registrado com sucesso",
        data: result
      });
    } catch (error) {
      console.error("❌ Erro no ChatLeadController:", error);
      
      // Tratamento específico de erros
      if (error.message && error.message.includes("duplicate key")) {
        return res.status(409).json({
          success: false,
          error: "Conflito de dados",
          message: "Já existe um atendimento com este protocolo"
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível registrar o pré-atendimento. Tente novamente."
      });
    }
  }

  /**
   * Valida o payload do pré-atendimento
   * @param {Object} data - Dados a serem validados
   * @returns {Array} - Lista de erros (vazia se válido)
   */
  validatePayload(data) {
    const errors = [];

    // Área
    if (!data.area || typeof data.area !== "string" || data.area.trim() === "") {
      errors.push("Área é obrigatória");
    }

    // Subárea
    if (!data.subarea || typeof data.subarea !== "string" || data.subarea.trim() === "") {
      errors.push("Subárea é obrigatória");
    }

    // Nome
    if (!data.nome || typeof data.nome !== "string" || data.nome.trim().length < 3) {
      errors.push("Nome completo é obrigatório (mínimo 3 caracteres)");
    }

    // Telefone
    if (!data.telefone || typeof data.telefone !== "string" || data.telefone.trim() === "") {
      errors.push("Telefone é obrigatório");
    } else {
      // Validação básica de formato brasileiro
      const phoneRegex = /^\(?[1-9][0-9]\)?\s?(9?[0-9]{4})[-\s]?[0-9]{4}$/;
      const cleanPhone = data.telefone.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        errors.push("Telefone inválido. Use o formato: (11) 99999-9999");
      }
    }

    // Email
    if (!data.email || typeof data.email !== "string" || data.email.trim() === "") {
      errors.push("E-mail é obrigatório");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("E-mail inválido. Use o formato: exemplo@email.com");
      }
    }

    // Cidade
    if (!data.cidade || typeof data.cidade !== "string" || data.cidade.trim() === "") {
      errors.push("Cidade é obrigatória");
    }

    // Estado
    if (!data.estado || typeof data.estado !== "string" || data.estado.trim() === "") {
      errors.push("Estado é obrigatório");
    } else if (data.estado.trim().length !== 2) {
      errors.push("Estado deve ter 2 caracteres (sigla)");
    }

    // Descrição do caso
    if (!data.descricaoCaso || typeof data.descricaoCaso !== "string") {
      errors.push("Descrição do caso é obrigatória");
    } else if (data.descricaoCaso.trim().length < 20) {
      errors.push("Descrição do caso deve ter pelo menos 20 caracteres");
    } else if (data.descricaoCaso.trim().length > 3000) {
      errors.push("Descrição do caso deve ter no máximo 3000 caracteres");
    }

    return errors;
  }

  /**
   * GET /api/chat/pre-atendimento/:protocolo
   * Busca um pré-atendimento por protocolo (para consulta)
   */
  async findByProtocolo(req, res) {
    try {
      const { protocolo } = req.params;

      if (!protocolo) {
        return res.status(400).json({
          success: false,
          error: "Protocolo é obrigatório"
        });
      }

      const PreAtendimentoRepository = require("../repositories/PreAtendimentoRepository");
      const atendimento = await PreAtendimentoRepository.findByProtocolo(protocolo);

      if (!atendimento) {
        return res.status(404).json({
          success: false,
          error: "Atendimento não encontrado"
        });
      }

      return res.status(200).json({
        success: true,
        data: atendimento
      });
    } catch (error) {
      console.error("❌ Erro ao buscar pré-atendimento:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível buscar o pré-atendimento"
      });
    }
  }
}

module.exports = new ChatLeadController();

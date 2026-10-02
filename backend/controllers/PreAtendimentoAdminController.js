/**
 * PreAtendimentoAdminController
 * Sprint 3.3: Painel Administrativo de Pré-Atendimentos
 * 
 * Responsabilidades:
 * - Listar pré-atendimentos com filtros
 * - Buscar por termo
 * - Atualizar status
 * - Estatísticas para dashboard
 */

const PreAtendimentoRepository = require("../repositories/PreAtendimentoRepository");

class PreAtendimentoAdminController {
  /**
   * GET /api/admin/chat/pre-atendimentos
   * Lista todos os pré-atendimentos com filtros e paginação
   */
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        area, 
        subarea,
        dataInicio,
        dataFim,
        search 
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const options = { 
        limit: parseInt(limit), 
        offset,
        status,
        area,
        subarea,
        dataInicio,
        dataFim
      };

      let atendimentos;

      // Se houver termo de busca, usar método de busca
      if (search && search.trim() !== "") {
        atendimentos = await PreAtendimentoRepository.search(search.trim(), options);
      } else {
        // Usar filtros avançados
        atendimentos = await PreAtendimentoRepository.findWithFilters(
          { status, area, subarea, dataInicio, dataFim },
          { limit: parseInt(limit), offset }
        );
      }

      return res.status(200).json({
        success: true,
        data: atendimentos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      });
    } catch (error) {
      console.error("❌ Erro ao listar pré-atendimentos:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível listar os pré-atendimentos"
      });
    }
  }

  /**
   * GET /api/admin/chat/pre-atendimentos/:id
   * Busca um pré-atendimento por ID (detalhes completos)
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID é obrigatório"
        });
      }

      const atendimento = await PreAtendimentoRepository.findById(id);

      if (!atendimento) {
        return res.status(404).json({
          success: false,
          error: "Pré-atendimento não encontrado"
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

  /**
   * PUT /api/admin/chat/pre-atendimentos/:id/status
   * Atualiza o status de um pré-atendimento
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Status válidos
      const validStatuses = [
        "novo",
        "em_analise",
        "contato_realizado",
        "convertido",
        "encerrado"
      ];

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID é obrigatório"
        });
      }

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status inválido",
          message: `Status deve ser um dos seguintes: ${validStatuses.join(", ")}`
        });
      }

      // Verificar se existe
      const existing = await PreAtendimentoRepository.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Pré-atendimento não encontrado"
        });
      }

      // Atualizar status
      const atendimento = await PreAtendimentoRepository.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: "Status atualizado com sucesso",
        data: atendimento
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar status:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível atualizar o status"
      });
    }
  }

  /**
   * GET /api/admin/chat/pre-atendimentos/stats
   * Estatísticas para o dashboard
   */
  async getStats(req, res) {
    try {
      const stats = await PreAtendimentoRepository.getStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno",
        message: "Não foi possível buscar as estatísticas"
      });
    }
  }

  /**
   * GET /api/admin/chat/pre-atendimentos/areas
   * Lista áreas únicas para filtros
   */
  async getAreas(req, res) {
    try {
      const query = `
        SELECT DISTINCT area FROM chat_pre_atendimentos 
        ORDER BY area
      `;
      
      const result = await require("../database/index").query(query);
      const areas = result.rows.map(row => row.area);

      return res.status(200).json({
        success: true,
        data: areas
      });
    } catch (error) {
      console.error("❌ Erro ao buscar áreas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno"
      });
    }
  }

  /**
   * GET /api/admin/chat/pre-atendimentos/subareas
   * Lista subáreas únicas para filtros
   */
  async getSubareas(req, res) {
    try {
      const { area } = req.query;
      
      let query = `
        SELECT DISTINCT subarea FROM chat_pre_atendimentos 
        WHERE 1=1
      `;
      const values = [];

      if (area) {
        query += ` AND area = $1`;
        values.push(area);
      }

      query += ` ORDER BY subarea`;
      
      const result = await require("../database/index").query(query, values);
      const subareas = result.rows.map(row => row.subarea);

      return res.status(200).json({
        success: true,
        data: subareas
      });
    } catch (error) {
      console.error("❌ Erro ao buscar subáreas:", error);
      return res.status(500).json({
        success: false,
        error: "Erro interno"
      });
    }
  }
}

module.exports = new PreAtendimentoAdminController();

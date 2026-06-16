/**
 * CreatePreAtendimentoService
 * Sprint 3.2: Persistência e Protocolo
 * 
 * Responsabilidades:
 * - Gerar protocolo único (JUR-YYYYMMDD-XXXX)
 * - Salvar atendimento
 * - Retornar resultado
 */

const PreAtendimentoRepository = require("../repositories/PreAtendimentoRepository");

class CreatePreAtendimentoService {
  /**
   * Executa a criação do pré-atendimento
   * @param {Object} data - Dados do pré-atendimento
   * @returns {Promise<Object>} - Resultado com protocolo
   */
  async execute(data) {
    try {
      // 1. Gerar protocolo único
      const protocolo = await this.generateProtocolo();

      // 2. Preparar dados para persistência
      const preAtendimentoData = {
        protocolo,
        area: data.area,
        subarea: data.subarea,
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        cidade: data.cidade,
        estado: data.estado,
        descricao_caso: data.descricaoCaso,
        status: "novo"
      };

      // 3. Persistir no banco
      const atendimento = await PreAtendimentoRepository.create(preAtendimentoData);

      // 4. Retornar resultado formatado (preparado para futuras extensões)
      return {
        success: true,
        protocolo: atendimento.protocolo,
        atendimentoId: atendimento.id,
        status: atendimento.status,
        // Preparação para futuro (não implementado ainda)
        encaminhadoN8N: false,
        analisadoHermes: false,
        createdAt: atendimento.created_at
      };
    } catch (error) {
      console.error("❌ Erro ao criar pré-atendimento:", error);
      throw error;
    }
  }

  /**
   * Gera protocolo no formato JUR-YYYYMMDD-XXXX
   * Exemplo: JUR-20250723-0001
   * @returns {Promise<string>} - Protocolo gerado
   */
  async generateProtocolo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateStr = `${year}${month}${day}`;

    // Contar quantos atendimentos já existem hoje
    const count = await PreAtendimentoRepository.countByDate(dateStr);
    
    // Próximo número sequencial (incremental)
    const nextNumber = count + 1;
    const sequential = String(nextNumber).padStart(4, "0");

    return `JUR-${dateStr}-${sequential}`;
  }
}

module.exports = new CreatePreAtendimentoService();

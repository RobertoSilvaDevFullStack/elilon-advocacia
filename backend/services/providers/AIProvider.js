/**
 * Sprint 3.5.2 - AI Provider Interface
 * Interface base para providers de IA
 * 
 * Implementações:
 * - OpenAIProvider (produção)
 * - OllamaProvider (local - futuro)
 * - ClaudeProvider (alternativo - futuro)
 */

class AIProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * Analisa um caso jurídico e retorna classificação estruturada
   * @param {object} caseData - Dados do caso
   * @param {string} caseData.area - Área jurídica
   * @param {string} caseData.subarea - Subárea jurídica
   * @param {string} caseData.nome - Nome do cliente
   * @param {string} caseData.descricao - Descrição do caso
   * @returns {Promise<object>} - Resultado da análise
   */
  async analyzeCase(caseData) {
    throw new Error('Método analyzeCase deve ser implementado pelo provider');
  }

  /**
   * Verifica se o provider está configurado e disponível
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('Método isConfigured deve ser implementado pelo provider');
  }

  /**
   * Retorna o nome do provider
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Monta o prompt de análise jurídica
   * @param {object} caseData - Dados do caso
   * @returns {string} - Prompt formatado
   */
  buildPrompt(caseData) {
    return `Você é Hermes, um analista jurídico especialista em triagem de casos para o escritório Elilon Lopes Advogados.

SUA MISSÃO:
Analisar pré-atendimentos jurídicos e gerar uma avaliação executiva para a equipe jurídica.

DADOS DO PRÉ-ATENDIMENTO:
- Área: ${caseData.area}
- Subárea: ${caseData.subarea}
- Cliente: ${caseData.nome}
- Descrição do caso: ${caseData.descricao}

CRITÉRIOS DE URGÊNCIA:
- alta: Prazo prescricional próximo, risco de inscrição em CADIN, risco de despejo iminente, saúde/segurança em risco, demissão recente sem pagamento
- media: Prazo razoável mas demanda atenção priorizada, penhora em curso, processo em andamento
- baixa: Sem urgência imediata, pode seguir fluxo normal de atendimento

CRITÉRIOS DE COMPLEXIDADE:
- alta: Múltiplas partes, matéria controvertida, necessidade de perícia, alta valoração, recurso provável
- media: Questões jurídicas padrão mas com particularidades, documentação parcial
- baixa: Questões simples, procedimentos rotineiros, documentação completa

FORNEÇA SUA ANÁLISE NO SEGUINTE FORMATO JSON:
{
  "urgencia": "baixa|media|alta",
  "complexidade": "baixa|media|alta",
  "area_confirmada": "área validada pela IA",
  "subarea_confirmada": "subárea validada",
  "resumo_executivo": "resumo em até 500 caracteres",
  "entidades_detectadas": {
    "partes": ["partes identificadas"],
    "documentos_relevantes": ["docs mencionados"],
    "prazos_potenciais": ["prazos identificados"],
    "valores_mencionados": ["valores identificados"]
  },
  "observacoes": "observações adicionais para equipe jurídica"
}

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown ou texto adicional
- Seja objetivo e técnico
- Baseie-se estritamente na descrição fornecida`;
  }

  /**
   * Valida se a resposta está no formato esperado
   * @param {object} result - Resultado da análise
   * @returns {boolean}
   */
  validateResult(result) {
    const required = ['urgencia', 'complexidade', 'area_confirmada', 'subarea_confirmada', 'resumo_executivo'];
    
    for (const field of required) {
      if (!result[field]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }

    const validUrgencia = ['baixa', 'media', 'alta'];
    const validComplexidade = ['baixa', 'media', 'alta'];

    if (!validUrgencia.includes(result.urgencia)) {
      throw new Error(`Urgência inválida: ${result.urgencia}`);
    }

    if (!validComplexidade.includes(result.complexidade)) {
      throw new Error(`Complexidade inválida: ${result.complexidade}`);
    }

    return true;
  }
}

module.exports = AIProvider;

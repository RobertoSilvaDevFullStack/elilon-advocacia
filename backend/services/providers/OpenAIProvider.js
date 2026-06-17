/**
 * Sprint 3.5.2 - OpenAI Provider
 * Implementação do provider para OpenAI API
 * Modelos suportados: GPT-4o, GPT-4, GPT-4o-mini
 */

const AIProvider = require('./AIProvider');

class OpenAIProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-4o';
    this.apiUrl = config.apiUrl || 'https://api.openai.com/v1/chat/completions';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    
    // Lazy load axios
    this.axios = null;
  }

  /**
   * Inicializa axios se necessário
   */
  async getAxios() {
    if (!this.axios) {
      this.axios = require('axios');
    }
    return this.axios;
  }

  /**
   * Verifica se o provider está configurado
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey && this.apiKey.length > 20;
  }

  /**
   * Analisa um caso jurídico via OpenAI
   * @param {object} caseData - Dados do caso
   * @returns {Promise<object>} - Resultado estruturado
   */
  async analyzeCase(caseData) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI não configurado: OPENAI_API_KEY ausente ou inválida');
    }

    const axios = await this.getAxios();
    const prompt = this.buildPrompt(caseData);

    let lastError = null;
    
    // Retry com exponential backoff
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`[OpenAI] Tentativa ${attempt}/${this.maxRetries}...`);
        
        const response = await axios.post(
          this.apiUrl,
          {
            model: this.model,
            messages: [
              {
                role: 'system',
                content: 'Você é Hermes, um analista jurídico especialista. Responda apenas em JSON válido.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3, // Baixa temperatura para respostas mais consistentes
            max_tokens: 1500,
            response_format: { type: 'json_object' } // Força JSON output
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: this.timeout
          }
        );

        const content = response.data.choices[0]?.message?.content;
        
        if (!content) {
          throw new Error('Resposta vazia da OpenAI');
        }

        // Parse do JSON
        let result;
        try {
          result = JSON.parse(content);
        } catch (parseError) {
          // Tentar extrair JSON de markdown
          const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                           content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } else {
            throw new Error('Não foi possível parsear resposta como JSON');
          }
        }

        // Validar estrutura
        this.validateResult(result);

        // Adicionar metadados
        result._metadata = {
          provider: 'openai',
          model: this.model,
          tokens_input: response.data.usage?.prompt_tokens || 0,
          tokens_output: response.data.usage?.completion_tokens || 0,
          tokens_total: response.data.usage?.total_tokens || 0
        };

        console.log(`[OpenAI] Análise concluída: ${result.urgencia}/${result.complexidade}`);
        return result;

      } catch (error) {
        lastError = error;
        console.error(`[OpenAI] Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`[OpenAI] Aguardando ${delay}ms antes de retry...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    throw new Error(`Todas as ${this.maxRetries} tentativas falharam: ${lastError.message}`);
  }

  /**
   * Estima custo da análise (aproximado)
   * @param {number} tokensInput - Tokens de entrada
   * @param {number} tokensOutput - Tokens de saída
   * @returns {number} - Custo em USD
   */
  estimateCost(tokensInput, tokensOutput) {
    // Preços aproximados (atualizar conforme modelos)
    const pricing = {
      'gpt-5': { input: 1.50, output: 2.00 },        // $ por 1M tokens
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 }
    };

    const modelPricing = pricing[this.model] || pricing['gpt-5'];
    
    const costInput = (tokensInput / 1000000) * modelPricing.input;
    const costOutput = (tokensOutput / 1000000) * modelPricing.output;
    
    return costInput + costOutput;
  }

  /**
   * Retorna informações do provider
   * @returns {object}
   */
  getInfo() {
    return {
      name: this.name,
      model: this.model,
      configured: this.isConfigured(),
      apiUrl: this.apiUrl
    };
  }
}

module.exports = OpenAIProvider;

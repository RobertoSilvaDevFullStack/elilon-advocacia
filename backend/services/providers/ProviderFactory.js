/**
 * Sprint 3.5.2 - Provider Factory
 * Factory para criar instâncias de providers de IA
 * Suporta: openai, ollama (futuro), claude (futuro)
 */

const OpenAIProvider = require('./OpenAIProvider');
const AIProvider = require('./AIProvider');

class ProviderFactory {
  constructor() {
    this.providers = {
      openai: OpenAIProvider,
      // Futuro:
      // ollama: OllamaProvider,
      // claude: ClaudeProvider
    };
  }

  /**
   * Cria uma instância do provider configurado
   * @param {string} providerName - Nome do provider (openai, ollama, etc)
   * @param {object} config - Configuração opcional
   * @returns {AIProvider} - Instância do provider
   */
  create(providerName = null, config = {}) {
    const name = providerName || process.env.AI_PROVIDER || 'openai';
    
    const ProviderClass = this.providers[name.toLowerCase()];
    
    if (!ProviderClass) {
      const available = Object.keys(this.providers).join(', ');
      throw new Error(`Provider '${name}' não encontrado. Disponíveis: ${available}`);
    }

    return new ProviderClass(config);
  }

  /**
   * Retorna lista de providers disponíveis
   * @returns {string[]}
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Verifica se um provider está disponível
   * @param {string} providerName 
   * @returns {boolean}
   */
  isAvailable(providerName) {
    return !!this.providers[providerName.toLowerCase()];
  }

  /**
   * Cria provider configurado e verifica disponibilidade
   * @returns {object} - { provider: AIProvider|null, configured: boolean, error: string|null }
   */
  createConfigured() {
    try {
      const provider = this.create();
      
      if (provider.isConfigured()) {
        return {
          provider,
          configured: true,
          error: null,
          name: provider.getName()
        };
      }

      return {
        provider,
        configured: false,
        error: `Provider ${provider.getName()} não configurado`,
        name: provider.getName()
      };

    } catch (error) {
      return {
        provider: null,
        configured: false,
        error: error.message,
        name: null
      };
    }
  }
}

// Singleton
module.exports = new ProviderFactory();

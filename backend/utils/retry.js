/**
 * Sprint 3.4.3 - Fase 4: Timeout e Retry
 * Implementação de retry com exponential backoff
 */

/**
 * Executa uma operação com retry automático
 * @param {Function} operation - Função assíncrona a ser executada
 * @param {Object} options - Opções de retry
 * @param {number} options.maxRetries - Máximo de tentativas (padrão: 3)
 * @param {number} options.baseDelay - Delay base em ms (padrão: 100)
 * @param {number} options.maxDelay - Delay máximo em ms (padrão: 5000)
 * @param {Function} options.onRetry - Callback chamado em cada retry
 * @param {Array} options.retryableErrors - Erros que devem disparar retry
 * @returns {Promise} - Resultado da operação
 */
async function withRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 100,
    maxDelay = 5000,
    onRetry = null,
    retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'SQLITE_BUSY', 'TimeoutError']
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      
      // Log de sucesso após retry
      if (attempt > 1) {
        console.log(`[Retry] Sucesso na tentativa ${attempt}/${maxRetries}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Verificar se devemos fazer retry
      const shouldRetry = attempt < maxRetries && (
        retryableErrors.includes(error.code) ||
        retryableErrors.some(err => error.message?.includes(err)) ||
        error.message?.includes('timeout') ||
        error.message?.includes('Timeout') ||
        error.message?.includes('busy') ||
        error.message?.includes('SQLITE_BUSY')
      );
      
      if (!shouldRetry) {
        // Erro não retryable, falhar imediatamente
        throw error;
      }
      
      // Calcular delay com exponential backoff + jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 100; // Adicionar jitter para evitar thundering herd
      const delay = Math.min(exponentialDelay + jitter, maxDelay);
      
      console.log(`[Retry] Tentativa ${attempt}/${maxRetries} falhou: ${error.message}`);
      console.log(`[Retry] Aguardando ${Math.round(delay)}ms antes da próxima tentativa...`);
      
      if (onRetry) {
        onRetry({ attempt, maxRetries, error, delay });
      }
      
      // Aguardar antes do retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Todas as tentativas falharam
  console.error(`[Retry] Todas as ${maxRetries} tentativas falharam`);
  throw lastError;
}

/**
 * Wrapper para operações de banco de dados
 * @param {Function} dbOperation - Operação do banco
 * @param {string} context - Contexto para logs
 * @returns {Promise}
 */
async function withDatabaseRetry(dbOperation, context = 'DB Operation') {
  return withRetry(dbOperation, {
    maxRetries: 5,
    baseDelay: 200,
    maxDelay: 3000,
    onRetry: ({ attempt, delay }) => {
      console.log(`[DB:${context}] Retry ${attempt}/5 em ${Math.round(delay)}ms`);
    },
    retryableErrors: [
      'SQLITE_BUSY',
      'SQLITE_LOCKED',
      'ECONNRESET',
      'ETIMEDOUT',
      'TimeoutError'
    ]
  });
}

/**
 * Timeout wrapper
 * @param {Promise} promise - Promise a ser executada
 * @param {number} ms - Timeout em ms
 * @param {string} context - Contexto para erro
 * @returns {Promise}
 */
async function withTimeout(promise, ms, context = 'Operation') {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TimeoutError: ${context} excedeu ${ms}ms`));
    }, ms);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

module.exports = {
  withRetry,
  withDatabaseRetry,
  withTimeout
};

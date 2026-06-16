/**
 * Sprint 3.4.3 - Fase 2: Rate Limiting
 * Proteção contra abuso de APIs públicas
 */

const rateLimit = require('express-rate-limit');

// Configuração base
const baseConfig = {
  standardHeaders: true, // Retorna headers RateLimit-*
  legacyHeaders: false,  // Desabilita X-RateLimit-*
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip // Usar IP como identificador
};

/**
 * Rate limiter para criação de pré-atendimentos
 * 10 requisições por minuto por IP
 */
const preAtendimentoLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 requisições por minuto
  message: {
    success: false,
    error: 'Limite de requisições excedido',
    message: 'Você atingiu o limite de 10 requisições por minuto. Aguarde 1 minuto para tentar novamente.',
    retryAfter: 60
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu limite de pré-atendimentos`);
    res.status(429).json(options.message);
  }
});

/**
 * Rate limiter para upload de documentos
 * 10 uploads por minuto por IP
 */
const uploadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 uploads por minuto
  message: {
    success: false,
    error: 'Limite de uploads excedido',
    message: 'Você atingiu o limite de 10 uploads por minuto. Aguarde 1 minuto para tentar novamente.',
    retryAfter: 60
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu limite de uploads`);
    res.status(429).json(options.message);
  }
});

/**
 * Rate limiter geral para APIs públicas
 * 100 requisições por 15 minutos
 */
const generalApiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: {
    success: false,
    error: 'Limite de requisições excedido',
    message: 'Você atingiu o limite de requisições. Tente novamente em 15 minutos.',
    retryAfter: 900
  }
});

/**
 * Rate limiter mais restrito para auth
 * 5 tentativas de login por minuto
 */
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 tentativas
  skipSuccessfulRequests: true, // Não contar logins bem-sucedidos
  message: {
    success: false,
    error: 'Muitas tentativas de login',
    message: 'Você atingiu o limite de tentativas. Aguarde 1 minuto.',
    retryAfter: 60
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu tentativas de login`);
    res.status(429).json(options.message);
  }
});

module.exports = {
  preAtendimentoLimiter,
  uploadLimiter,
  generalApiLimiter,
  authLimiter
};

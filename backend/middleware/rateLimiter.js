/**
 * Sprint 3.4.3 - Fase 2: Rate Limiting
 * Proteção contra abuso de APIs públicas
 */

const rateLimit = require('express-rate-limit');

// Compatível com express-rate-limit v7+ (requer helper para IPv6)
const { ipKeyGenerator } = rateLimit;

// Configuração base
const baseConfig = {
  standardHeaders: true, // Retorna headers RateLimit-*
  legacyHeaders: false,  // Desabilita X-RateLimit-*
  skipSuccessfulRequests: false,
  keyGenerator: ipKeyGenerator // Helper oficial para IPv4 e IPv6
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
 * Sprint 3.12.2: skip em webhooks inbound e health (health fora de /api)
 */
const GENERAL_API_SKIP_PATHS = [
  "/asaas/webhook",
  "/chat/webhook",
  "/hermes/webhook",
];

const generalApiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => GENERAL_API_SKIP_PATHS.includes(req.path),
  message: {
    success: false,
    error: "Limite de requisições excedido",
    message: "Você atingiu o limite de requisições. Tente novamente em 15 minutos.",
    retryAfter: 900,
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu limite geral da API`);
    res.status(429).json(options.message);
  },
});

/**
 * Rate limiter para captura de leads (formulários públicos)
 * 20 requisições por minuto por IP
 */
const leadsLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Limite de requisições excedido",
    message:
      "Você enviou muitas solicitações. Aguarde 1 minuto e tente novamente.",
    retryAfter: 60,
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu limite de leads`);
    res.status(429).json(options.message);
  },
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

/**
 * Rate limiter para diagnóstico tributário premium
 * 5 pedidos por minuto por IP
 */
const diagnosticoPedidoLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Limite de requisições excedido',
    message: 'Você atingiu o limite de solicitações. Aguarde 1 minuto para tentar novamente.',
    retryAfter: 60
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu limite de diagnóstico premium`);
    res.status(429).json(options.message);
  }
});

/**
 * Rate limiter para diagnóstico tributário (lead gratuito)
 * 5 requisições por minuto por IP
 */
const diagnosticoLeadLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Limite de requisições excedido',
    message: 'Você atingiu o limite de solicitações. Aguarde 1 minuto para tentar novamente.',
    retryAfter: 60
  },
  handler: (req, res, next, options) => {
    console.warn(`[RateLimit] IP ${req.ip} excedeu limite de diagnóstico`);
    res.status(429).json(options.message);
  }
});

/**
 * Rate limiter para webhook ASAAS
 * 60 eventos por minuto
 */
const asaasWebhookLimiter = rateLimit({
  ...baseConfig,
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'Limite excedido',
    message: 'Too many requests'
  }
});

module.exports = {
  preAtendimentoLimiter,
  uploadLimiter,
  generalApiLimiter,
  GENERAL_API_SKIP_PATHS,
  authLimiter,
  leadsLimiter,
  diagnosticoPedidoLimiter,
  diagnosticoLeadLimiter,
  asaasWebhookLimiter,
};

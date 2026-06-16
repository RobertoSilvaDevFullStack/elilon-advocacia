/**
 * Sprint 3.4.3 - Fase 5: Logs Estruturados
 * Configuração do Winston para logging profissional
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Garantir que pasta de logs existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { 
    service: 'elilon-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  format: customFormat,
  transports: [
    // Arquivo para erros
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Arquivo combinado (todos os logs)
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Arquivo específico para pré-atendimentos
    new winston.transports.File({
      filename: path.join(logsDir, 'pre-atendimentos.log'),
      level: 'info'
    }),
    // Arquivo específico para documentos
    new winston.transports.File({
      filename: path.join(logsDir, 'documents.log'),
      level: 'info'
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Helpers para contextos específicos
const preAtendimentoLogger = {
  created: (data) => logger.info('Pre-atendimento criado', {
    event: 'PRE_ATENDIMENTO_CREATED',
    protocolo: data.protocolo,
    area: data.area,
    ip: data.ip
  }),
  updated: (data) => logger.info('Pre-atendimento atualizado', {
    event: 'PRE_ATENDIMENTO_UPDATED',
    protocolo: data.protocolo,
    changes: data.changes
  }),
  statusChanged: (data) => logger.info('Status alterado', {
    event: 'STATUS_CHANGED',
    protocolo: data.protocolo,
    oldStatus: data.oldStatus,
    newStatus: data.newStatus
  }),
  error: (error, context) => logger.error('Erro em pré-atendimento', {
    event: 'PRE_ATENDIMENTO_ERROR',
    context,
    error: error.message,
    stack: error.stack
  })
};

const documentLogger = {
  uploaded: (data) => logger.info('Documento enviado', {
    event: 'DOCUMENT_UPLOADED',
    protocolo: data.protocolo,
    filename: data.filename,
    size: data.size,
    type: data.type
  }),
  downloaded: (data) => logger.info('Documento baixado', {
    event: 'DOCUMENT_DOWNLOADED',
    documentId: data.documentId,
    filename: data.filename
  }),
  deleted: (data) => logger.info('Documento excluído', {
    event: 'DOCUMENT_DELETED',
    documentId: data.documentId,
    filename: data.filename
  }),
  error: (error, context) => logger.error('Erro em documento', {
    event: 'DOCUMENT_ERROR',
    context,
    error: error.message
  })
};

module.exports = {
  logger,
  preAtendimentoLogger,
  documentLogger
};

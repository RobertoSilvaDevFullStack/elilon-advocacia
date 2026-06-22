/**
 * Sprint 3.4.3 - Fase 5: Logs Estruturados
 * Sprint 3.12.2: Rotação automática (20MB, 30 arquivos, gzip)
 */

const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

function createRotateTransport(filename, level) {
  const transport = new DailyRotateFile({
    dirname: logsDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30",
    zippedArchive: true,
    level,
  });
  transport.on("rotate", (oldFilename, newFilename) => {
    console.log(`[Logger] Rotação: ${oldFilename} → ${newFilename}`);
  });
  return transport;
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: "elilon-backend",
    environment: process.env.NODE_ENV || "development",
  },
  format: customFormat,
  transports: [
    createRotateTransport("error", "error"),
    createRotateTransport("combined"),
    createRotateTransport("pre-atendimentos", "info"),
    createRotateTransport("documents", "info"),
  ],
  exceptionHandlers: [createRotateTransport("exceptions")],
  rejectionHandlers: [createRotateTransport("rejections")],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    })
  );
}

const preAtendimentoLogger = {
  created: (data) =>
    logger.info("Pre-atendimento criado", {
      event: "PRE_ATENDIMENTO_CREATED",
      protocolo: data.protocolo,
      area: data.area,
      ip: data.ip,
    }),
  updated: (data) =>
    logger.info("Pre-atendimento atualizado", {
      event: "PRE_ATENDIMENTO_UPDATED",
      protocolo: data.protocolo,
      changes: data.changes,
    }),
  statusChanged: (data) =>
    logger.info("Status alterado", {
      event: "STATUS_CHANGED",
      protocolo: data.protocolo,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
    }),
  error: (error, context) =>
    logger.error("Erro em pré-atendimento", {
      event: "PRE_ATENDIMENTO_ERROR",
      context,
      error: error.message,
      stack: error.stack,
    }),
};

const documentLogger = {
  uploaded: (data) =>
    logger.info("Documento enviado", {
      event: "DOCUMENT_UPLOADED",
      protocolo: data.protocolo,
      filename: data.filename,
      size: data.size,
      type: data.type,
    }),
  downloaded: (data) =>
    logger.info("Documento baixado", {
      event: "DOCUMENT_DOWNLOADED",
      documentId: data.documentId,
      filename: data.filename,
    }),
  deleted: (data) =>
    logger.info("Documento excluído", {
      event: "DOCUMENT_DELETED",
      documentId: data.documentId,
      filename: data.filename,
    }),
  error: (error, context) =>
    logger.error("Erro em documento", {
      event: "DOCUMENT_ERROR",
      context,
      error: error.message,
    }),
};

module.exports = {
  logger,
  preAtendimentoLogger,
  documentLogger,
};

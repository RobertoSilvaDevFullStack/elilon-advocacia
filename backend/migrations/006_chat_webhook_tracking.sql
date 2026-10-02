-- =============================================================================
-- Migration 006 — Chat Webhook Tracking
-- Sprint 3.9: Webhook Universal do Chat Jurídico
-- =============================================================================
-- Idempotente: seguro para re-executar em qualquer ambiente.
-- Não altera colunas existentes nem remove dados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Adicionar colunas de controle de webhook em chat_pre_atendimentos
-- -----------------------------------------------------------------------------

ALTER TABLE chat_pre_atendimentos
  ADD COLUMN IF NOT EXISTS webhook_status   VARCHAR(20)  DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS webhook_sent_at  TIMESTAMP    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS webhook_attempts INTEGER      DEFAULT 0;

COMMENT ON COLUMN chat_pre_atendimentos.webhook_status   IS 'Status do último disparo de webhook: pendente | enviado | falhou';
COMMENT ON COLUMN chat_pre_atendimentos.webhook_sent_at  IS 'Timestamp do último disparo bem-sucedido';
COMMENT ON COLUMN chat_pre_atendimentos.webhook_attempts IS 'Número total de tentativas realizadas';

-- Índice para consultar rapidamente por webhook_status (ex: falhou para retry manual)
CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_webhook_status
  ON chat_pre_atendimentos (webhook_status);

-- -----------------------------------------------------------------------------
-- 2. Criar tabela de logs de webhook
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS chat_webhook_logs (
  id                  SERIAL PRIMARY KEY,
  pre_atendimento_id  UUID         NOT NULL,
  evento              VARCHAR(100) NOT NULL DEFAULT 'chat_finalizado',
  url                 TEXT         NOT NULL,
  status_code         INTEGER      DEFAULT NULL,
  success             BOOLEAN      NOT NULL DEFAULT FALSE,
  response            TEXT         DEFAULT NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_chat_webhook_logs_pre_atendimento
    FOREIGN KEY (pre_atendimento_id)
    REFERENCES chat_pre_atendimentos (id)
    ON DELETE CASCADE
);

COMMENT ON TABLE  chat_webhook_logs                        IS 'Log auditável de todos os disparos de webhook do chat jurídico';
COMMENT ON COLUMN chat_webhook_logs.pre_atendimento_id     IS 'UUID do pré-atendimento que originou o disparo';
COMMENT ON COLUMN chat_webhook_logs.evento                 IS 'Nome do evento: chat_finalizado';
COMMENT ON COLUMN chat_webhook_logs.url                    IS 'URL de destino do webhook';
COMMENT ON COLUMN chat_webhook_logs.status_code            IS 'Código HTTP retornado pelo destino (null se sem resposta)';
COMMENT ON COLUMN chat_webhook_logs.success                IS 'true se status_code 2xx, false caso contrário';
COMMENT ON COLUMN chat_webhook_logs.response               IS 'Corpo da resposta ou mensagem de erro (truncado em 1000 chars)';

-- Índices de consulta frequente
CREATE INDEX IF NOT EXISTS idx_chat_webhook_logs_pre_atendimento_id
  ON chat_webhook_logs (pre_atendimento_id);

CREATE INDEX IF NOT EXISTS idx_chat_webhook_logs_success
  ON chat_webhook_logs (success);

CREATE INDEX IF NOT EXISTS idx_chat_webhook_logs_created_at
  ON chat_webhook_logs (created_at DESC);

-- =============================================================================
-- Migration 007 — Hermes Webhook Tracking
-- Sprint 3.10: Eventos Hermes
-- =============================================================================
-- Idempotente: seguro para re-executar em qualquer ambiente.
-- Não altera colunas existentes nem remove dados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Adicionar colunas de controle em chat_ai_analysis
-- -----------------------------------------------------------------------------

ALTER TABLE chat_ai_analysis
  ADD COLUMN IF NOT EXISTS hermes_webhook_status   VARCHAR(20)  DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS hermes_webhook_sent_at  TIMESTAMP    DEFAULT NULL;

COMMENT ON COLUMN chat_ai_analysis.hermes_webhook_status  IS 'Status do último disparo de webhook Hermes: pendente | enviado | falhou';
COMMENT ON COLUMN chat_ai_analysis.hermes_webhook_sent_at IS 'Timestamp do último disparo bem-sucedido';

CREATE INDEX IF NOT EXISTS idx_chat_ai_analysis_hermes_webhook_status
  ON chat_ai_analysis (hermes_webhook_status);

-- -----------------------------------------------------------------------------
-- 2. Chave de configuração (idempotente via ON CONFLICT DO NOTHING)
-- -----------------------------------------------------------------------------

INSERT INTO settings (key, value)
  VALUES ('hermes_webhook_url', '')
  ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN settings.value IS 'Para hermes_webhook_url: URL do endpoint que receberá hermes_analise_concluida';

-- -----------------------------------------------------------------------------
-- 3. Criar tabela de logs do webhook Hermes
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS hermes_webhook_logs (
  id                  SERIAL       PRIMARY KEY,
  pre_atendimento_id  TEXT         NOT NULL,
  evento              VARCHAR(100) NOT NULL DEFAULT 'hermes_analise_concluida',
  url                 TEXT         NOT NULL,
  status_code         INTEGER      DEFAULT NULL,
  success             BOOLEAN      NOT NULL DEFAULT FALSE,
  response            TEXT         DEFAULT NULL,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  hermes_webhook_logs                         IS 'Log auditável de todos os disparos do evento hermes_analise_concluida';
COMMENT ON COLUMN hermes_webhook_logs.pre_atendimento_id      IS 'ID do pré-atendimento (UUID ou INTEGER conforme banco)';
COMMENT ON COLUMN hermes_webhook_logs.evento                  IS 'Nome do evento: hermes_analise_concluida';
COMMENT ON COLUMN hermes_webhook_logs.status_code             IS 'Código HTTP retornado (null se sem resposta)';
COMMENT ON COLUMN hermes_webhook_logs.success                 IS 'true se status_code 2xx';
COMMENT ON COLUMN hermes_webhook_logs.response                IS 'Corpo da resposta ou mensagem de erro (truncado em 1000 chars)';

CREATE INDEX IF NOT EXISTS idx_hermes_webhook_logs_pre_atendimento_id
  ON hermes_webhook_logs (pre_atendimento_id);

CREATE INDEX IF NOT EXISTS idx_hermes_webhook_logs_success
  ON hermes_webhook_logs (success);

CREATE INDEX IF NOT EXISTS idx_hermes_webhook_logs_created_at
  ON hermes_webhook_logs (created_at DESC);

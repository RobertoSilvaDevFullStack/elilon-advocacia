-- Sprint 3.11: Diagnóstico Tributário Premium — Pedidos e ASAAS
-- Executar: psql $DATABASE_URL -f backend/migrations/008_diagnostico_tributario_pedidos.sql

-- Colunas premium na tabela de leads existente
ALTER TABLE diagnostico_tributario_leads
  ADD COLUMN IF NOT EXISTS regime_tributario VARCHAR(50);

ALTER TABLE diagnostico_tributario_leads
  ADD COLUMN IF NOT EXISTS valor DECIMAL(10,2);

-- Tabela de pedidos premium
CREATE TABLE IF NOT EXISTS diagnostico_tributario_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id INTEGER REFERENCES diagnostico_tributario_leads(id),
  nome VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50),
  regime_tributario VARCHAR(50) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status_pagamento VARCHAR(50) NOT NULL DEFAULT 'pendente'
    CHECK (status_pagamento IN ('pendente','aguardando_pagamento','pago','cancelado','expirado')),
  asaas_customer_id VARCHAR(100),
  asaas_payment_id VARCHAR(100),
  payment_method VARCHAR(50),
  payment_link TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diag_pedidos_lead_id ON diagnostico_tributario_pedidos (lead_id);
CREATE INDEX IF NOT EXISTS idx_diag_pedidos_status ON diagnostico_tributario_pedidos (status_pagamento);
CREATE INDEX IF NOT EXISTS idx_diag_pedidos_regime ON diagnostico_tributario_pedidos (regime_tributario);
CREATE INDEX IF NOT EXISTS idx_diag_pedidos_created_at ON diagnostico_tributario_pedidos (created_at);
CREATE INDEX IF NOT EXISTS idx_diag_pedidos_asaas_payment ON diagnostico_tributario_pedidos (asaas_payment_id);

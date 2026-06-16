-- Migration: Criação da tabela de pré-atendimentos do chat jurídico
-- Sprint 3.2: Persistência e Protocolo

CREATE TABLE IF NOT EXISTS chat_pre_atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(50) UNIQUE NOT NULL,
  area VARCHAR(100) NOT NULL,
  subarea VARCHAR(100) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(10) NOT NULL,
  descricao_caso TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'novo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca rápida por protocolo
CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_protocolo 
  ON chat_pre_atendimentos(protocolo);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_status 
  ON chat_pre_atendimentos(status);

-- Índice para busca por área
CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_area 
  ON chat_pre_atendimentos(area);

-- Índice para busca por data de criação
CREATE INDEX IF NOT EXISTS idx_chat_pre_atendimentos_created_at 
  ON chat_pre_atendimentos(created_at DESC);

-- Comentários sobre a tabela
COMMENT ON TABLE chat_pre_atendimentos IS 'Tabela de pré-atendimentos capturados pelo chat jurídico';
COMMENT ON COLUMN chat_pre_atendimentos.protocolo IS 'Protocolo único no formato JUR-YYYYMMDD-XXXX';
COMMENT ON COLUMN chat_pre_atendimentos.status IS 'Status do atendimento: novo, em_analise, aguardando, encaminhado, concluido';

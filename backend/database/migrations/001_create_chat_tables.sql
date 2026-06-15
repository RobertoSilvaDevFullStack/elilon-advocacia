-- Migration 001: Criação das tabelas do módulo Chat Jurídico
-- Sprint 1: Esqueleto funcional

-- Tabela de Clientes (triagem)
CREATE TABLE IF NOT EXISTS chat_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(2),
    area_juridica VARCHAR(100),
    subarea VARCHAR(100),
    case_description TEXT,
    has_existing_process BOOLEAN DEFAULT FALSE,
    process_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sessões de Chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES chat_clients(id) ON DELETE SET NULL,
    current_state VARCHAR(50) NOT NULL DEFAULT 'START',
    context JSONB DEFAULT '{}',
    source VARCHAR(100) DEFAULT 'widget',
    ip_address INET,
    user_agent TEXT,
    consent_lgpd BOOLEAN DEFAULT FALSE,
    consent_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    protocol_number VARCHAR(20) UNIQUE
);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('USER', 'SYSTEM', 'BOT')),
    content TEXT NOT NULL,
    content_html TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_state ON chat_sessions(current_state);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_expires ON chat_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Comentários
COMMENT ON TABLE chat_clients IS 'Clientes cadastrados via chat (triagem)';
COMMENT ON TABLE chat_sessions IS 'Sessões de chat ativas e histórico';
COMMENT ON TABLE chat_messages IS 'Mensagens trocadas nas sessões';

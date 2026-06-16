-- Migration: Criação da tabela de documentos do chat jurídico
-- Sprint 3.4: Upload de Documentos - Persistência Local

CREATE TABLE IF NOT EXISTS chat_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_atendimento_id UUID NOT NULL REFERENCES chat_pre_atendimentos(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL UNIQUE,
  extension VARCHAR(10) NOT NULL,
  size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca por pré-atendimento
CREATE INDEX IF NOT EXISTS idx_chat_documents_pre_atendimento_id 
  ON chat_documents(pre_atendimento_id);

-- Índice para busca por data de upload
CREATE INDEX IF NOT EXISTS idx_chat_documents_uploaded_at 
  ON chat_documents(uploaded_at DESC);

-- Índice para busca por extensão
CREATE INDEX IF NOT EXISTS idx_chat_documents_extension 
  ON chat_documents(extension);

-- Comentários sobre a tabela
COMMENT ON TABLE chat_documents IS 'Tabela de documentos anexados aos pré-atendimentos do chat';
COMMENT ON COLUMN chat_documents.pre_atendimento_id IS 'ID do pré-atendimento relacionado (FK)';
COMMENT ON COLUMN chat_documents.original_name IS 'Nome original do arquivo enviado pelo usuário';
COMMENT ON COLUMN chat_documents.file_name IS 'Nome único do arquivo no servidor (UUID_nome)';
COMMENT ON COLUMN chat_documents.storage_path IS 'Caminho completo do arquivo no filesystem da VPS';

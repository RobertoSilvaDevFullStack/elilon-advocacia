-- Sprint 3.5 - Hermes Analysis Engine
-- Criação da tabela para análises de IA

CREATE TABLE IF NOT EXISTS chat_ai_analysis (
    id SERIAL PRIMARY KEY,
    pre_atendimento_id INTEGER NOT NULL,
    
    -- Classificações
    urgencia VARCHAR(20) NOT NULL CHECK (urgencia IN ('baixa', 'media', 'alta')),
    complexidade VARCHAR(20) NOT NULL CHECK (complexidade IN ('baixa', 'media', 'alta')),
    
    -- Confirmações
    area_confirmada VARCHAR(100),
    subarea_confirmada VARCHAR(100),
    
    -- Análise textual
    resumo_executivo TEXT NOT NULL,
    entidades_detectadas JSONB,
    observacoes TEXT,
    
    -- Status
    status_analise VARCHAR(30) NOT NULL DEFAULT 'pendente' 
        CHECK (status_analise IN ('pendente', 'processando', 'concluida', 'falha')),
    
    -- Metadados de processamento
    tempo_processamento_ms INTEGER,
    modelo_ia VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices
    CONSTRAINT fk_pre_atendimento 
        FOREIGN KEY (pre_atendimento_id) 
        REFERENCES chat_pre_atendimentos(id) 
        ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_pre_atendimento_id 
    ON chat_ai_analysis(pre_atendimento_id);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_status 
    ON chat_ai_analysis(status_analise);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_urgencia 
    ON chat_ai_analysis(urgencia);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_complexidade 
    ON chat_ai_analysis(complexidade);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_chat_ai_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chat_ai_analysis_updated_at ON chat_ai_analysis;

CREATE TRIGGER trg_chat_ai_analysis_updated_at
    BEFORE UPDATE ON chat_ai_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_ai_analysis_updated_at();

-- Comentários para documentação
COMMENT ON TABLE chat_ai_analysis IS 'Análises de IA (Hermes) para pré-atendimentos jurídicos - Sprint 3.5';
COMMENT ON COLUMN chat_ai_analysis.urgencia IS 'Nível de urgência: baixa, media, alta';
COMMENT ON COLUMN chat_ai_analysis.complexidade IS 'Nível de complexidade: baixa, media, alta';
COMMENT ON COLUMN chat_ai_analysis.resumo_executivo IS 'Resumo executivo gerado pela IA';
COMMENT ON COLUMN chat_ai_analysis.entidades_detectadas IS 'Entidades jurídicas detectadas em formato JSONB';
COMMENT ON COLUMN chat_ai_analysis.status_analise IS 'Status: pendente, processando, concluida, falha';

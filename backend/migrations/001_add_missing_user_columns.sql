-- ============================================
-- MIGRAÇÃO: Adicionar colunas faltantes
-- ============================================

-- 1. Adicionar coluna 'email' na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Adicionar coluna 'approved' na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

-- 3. Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

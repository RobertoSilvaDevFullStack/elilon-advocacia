# Migrations

## Como Executar Migrations

### Via SSH no Cloudez:

```bash
# 1. Conectar ao servidor
ssh api@ip-50-116-31-218.cloudezapp.io

# 2. Navegar até a pasta do projeto
cd /srv/app/749.32741fda.configr.cloud/www/

# 3. Conectar ao PostgreSQL
psql -h localhost -U postgres -d nome_do_banco

# 4. Executar a migration
\i migrations/add_professional_fields.sql

# 5. Verificar se foi aplicada
\d professionals

# 6. Sair do psql
\q
```

### Via Ferramenta GUI (ex: pgAdmin, DBeaver):

1. Conecte-se ao banco de dados PostgreSQL
2. Abra o arquivo `add_professional_fields.sql`
3. Execute o script
4. Verifique se as colunas foram adicionadas

---

## Migrations Disponíveis

### `add_professional_fields.sql`

**Data:** 2025-12-18  
**Descrição:** Adiciona campos `location`, `education` e `specializations` à tabela `professionals`

**Colunas adicionadas:**

- `location` (VARCHAR) - Localização do profissional
- `education` (JSONB) - Array com formações acadêmicas
- `specializations` (JSONB) - Array com especializações

**Uso no Backend:**

```javascript
// Exemplo de dados
{
  "location": "Escritório de Belo Horizonte",
  "education": [
    "Graduação em Direito - UFMG",
    "Mestrado em Direito Tributário - USP"
  ],
  "specializations": [
    "Direito Trabalhista",
    "Negociações Sindicais"
  ]
}
```

---

## ⚠️ IMPORTANTE

Sempre faça **backup** do banco de dados antes de executar migrations em produção!

```bash
# Backup via SSH
pg_dump -h localhost -U postgres nome_do_banco > backup_$(date +%Y%m%d_%H%M%S).sql
```

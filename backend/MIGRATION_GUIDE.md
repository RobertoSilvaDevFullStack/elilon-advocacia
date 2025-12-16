# Migração para PostgreSQL

Este guia ajuda você a migrar de SQLite para PostgreSQL.

## 📋 Pré-requisitos

1. Já ter criado o database no Cloudez (PostgreSQL)
2. Anotar as credenciais: nome do DB, usuário e senha
3. Instalar a dependência do PostgreSQL

## 🔧 Passo 1: Instalar Dependência

No diretório `backend/`, execute:

```bash
npm install pg
```

## 📝 Passo 2: Configurar Variáveis de Ambiente

Edite o arquivo `backend/.env` (crie se não existir) e adicione:

```env
DATABASE_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elilon_advocacia_db
DB_USER=elilon_db_user
DB_PASSWORD=SUA_SENHA_AQUI
```

## 🔄 Passo 3: Executar Script de Migração

Execute o script para criar as tabelas no PostgreSQL:

```bash
cd backend
node database-postgres.js
```

Você deve ver:

```
✅ Conectado ao PostgreSQL com sucesso!
✅ Tabela 'users' criada
✅ Tabela 'posts' criada
...
👤 Usuário admin padrão criado
🎉 Database inicializado com sucesso!
```

## 🔀 Passo 4: Atualizar server.js

Modifique `backend/server.js` para usar o database correto:

**Antes:**

```javascript
const db = require("./database"); // SQLite
```

**Depois:**

```javascript
const db = require("./database-postgres"); // PostgreSQL
```

## 🧪 Passo 5: Testar Localmente

Inicie o servidor e teste:

```bash
npm start
```

## ⚠️ Importante

- O usuário admin padrão é: `admin` / `admin123`
- **Altere a senha** após o primeiro login!
- Os dados do SQLite (database.sqlite) NÃO serão migrados automaticamente
- Se você precisa migrar dados existentes, precisará de um script adicional

## 🔙 Voltar para SQLite

Se quiser voltar para SQLite:

1. Em `.env`, mude para `DATABASE_TYPE=sqlite`
2. Em `server.js`, use `require("./database")`

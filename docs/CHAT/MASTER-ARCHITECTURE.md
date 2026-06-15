# MASTER-ARCHITECTURE.md

# Assistente Jurídico Inteligente

Versão: 1.0

Status: Planejamento Arquitetural

---

# Visão Geral

O Assistente Jurídico Inteligente é uma plataforma de atendimento jurídico automatizado integrada ao site do escritório.

Seu objetivo é realizar a triagem inicial de potenciais clientes, coletar informações relevantes, armazenar os dados, gerar protocolos e encaminhar os atendimentos para a equipe jurídica.

---

# Objetivos

## Negócio

* Automatizar atendimentos iniciais.
* Melhorar conversão de leads.
* Reduzir tempo de resposta.
* Padronizar coleta de informações.
* Integrar atendimento humano e IA.

## Técnico

* Arquitetura escalável.
* Containers Docker.
* Integração com IA.
* Persistência estruturada.
* Segurança LGPD.
* Facilidade de expansão futura.

---

# Arquitetura Geral

Cliente

↓

Site do Escritório

↓

Chat Widget

↓

API Atendimento

↓

N8N

↓

Hermes

↓

N8N

↓

PostgreSQL

↓

Kinbox

↓

E-mail

↓

Equipe Jurídica

---

# Componentes

## Frontend

### Chat Widget

Responsabilidades:

* Interface de conversa.
* Botões interativos.
* Upload de documentos.
* Exibição de protocolo.
* Persistência de sessão.

Tecnologias:

* Next.js
* React
* TypeScript
* TailwindCSS

---

## Backend

### API Atendimento

Responsável por:

* Gerenciamento de sessões.
* Comunicação com N8N.
* Upload de arquivos.
* Recuperação de histórico.

Tecnologias:

* Node.js
* Express
* TypeScript

---

## Orquestração

### N8N

Responsável por:

* Máquina de estados.
* Fluxo conversacional.
* Integração Hermes.
* Integração PostgreSQL.
* Integração Kinbox.
* Integração E-mail.

Importante:

Toda regra de negócio deve ficar no N8N.

---

## Inteligência Artificial

### Hermes

Responsável por:

* Interpretação textual.
* Classificação jurídica.
* Extração de entidades.
* Resumos automáticos.

Importante:

O Hermes não controla estados.

O Hermes apenas interpreta e responde.

---

# Banco de Dados

PostgreSQL

Tabelas:

* clientes
* atendimentos
* mensagens
* documentos
* sessoes

---

# Armazenamento

MinIO

Responsável por:

* PDFs
* Imagens
* Documentos jurídicos

Estrutura:

/documentos/{ano}/{mes}/{atendimento_id}/

---

# Controle de Fluxo

Máquina de Estados

START

↓

BOAS_VINDAS

↓

COLETAR_NOME

↓

COLETAR_TELEFONE

↓

COLETAR_EMAIL

↓

COLETAR_CIDADE

↓

COLETAR_ESTADO

↓

ESCOLHER_AREA

↓

ESCOLHER_SUBAREA

↓

DESCREVER_CASO

↓

PROCESSO_EXISTENTE

↓

POSSUI_DOCUMENTOS

↓

UPLOAD_DOCUMENTOS

↓

GERAR_RESUMO

↓

GERAR_PROTOCOLO

↓

ENVIAR_KINBOX

↓

ENVIAR_EMAIL

↓

FINALIZAR

↓

ENCERRADO

---

# Fluxo de Sessão

Usuário acessa o site.

↓

Widget cria session_id.

↓

Cookie é salvo.

↓

API registra sessão.

↓

N8N inicia fluxo.

↓

Estado é persistido.

↓

Usuário continua atendimento.

↓

Em caso de retorno:

Sessão é recuperada.

---

# Fluxo de Upload

Usuário envia documento.

↓

API recebe arquivo.

↓

Validação.

↓

Upload MinIO.

↓

Registro PostgreSQL.

↓

Confirmação para usuário.

---

# Integração Kinbox

Ao finalizar atendimento:

Enviar:

* Nome
* Telefone
* E-mail
* Área
* Subárea
* Resumo
* Protocolo

Criar ticket automaticamente.

---

# Integração E-mail

Destinatário:

Equipe Jurídica

Conteúdo:

* Dados do cliente
* Resumo
* Área
* Subárea
* Protocolo

---

# Infraestrutura

Servidor:

Hostinger VPS

Sistema:

Ubuntu Server

Containers:

* traefik
* frontend-widget
* api-atendimento
* n8n
* hermes
* postgres
* minio

Rede:

juridico-network

---

# Domínios

chat.dominio.com.br

api.dominio.com.br

n8n.dominio.com.br

storage.dominio.com.br

---

# Segurança

HTTPS obrigatório.

TLS obrigatório.

Validação de uploads.

Controle de acesso.

Logs de auditoria.

Backups diários.

LGPD.

---

# Roadmap

## V1

* Chat Widget
* API
* PostgreSQL
* Hermes
* N8N
* MinIO
* Kinbox
* E-mail

## V2

* Dashboard Administrativo
* OCR
* Métricas

## V3

* CRM Jurídico
* WhatsApp
* Follow-up automático

## V4

* Base Jurídica Vetorizada
* RAG Jurídico
* Multiagentes

---

# Critérios de Sucesso

* Atendimento iniciado em menos de 2 segundos.
* Recuperação de sessão funcional.
* Upload de documentos funcional.
* Integração Kinbox funcional.
* Geração automática de protocolo.
* Armazenamento seguro.
* Conformidade LGPD.

---

# Próxima Etapa de Desenvolvimento

1. Criar repositório Git.
2. Criar Docker Compose.
3. Criar banco PostgreSQL.
4. Criar API Node.js.
5. Criar Widget React.
6. Criar fluxos N8N.
7. Criar agente Hermes.
8. Integrar Kinbox.
9. Realizar homologação.
10. Publicar em produção.

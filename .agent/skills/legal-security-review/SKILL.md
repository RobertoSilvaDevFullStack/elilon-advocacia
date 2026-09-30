---
name: legal-security-review
description: Security review and data privacy guidelines for legal applications. Covers input sanitization, form validation, CSRF, XSS, rate limiting, document/PDF upload security, MIME validation, LGPD compliance, and attorney-client privilege data protection. Use when implementing or auditing forms, uploads, APIs, or sensitive legal data flows.
---

# Legal Application Security & Data Privacy Review

## Overview
Esta Skill estabelece os requisitos e o checklist de segurança defensiva e privacidade de dados voltados especificamente para a aplicação jurídica de **Elilon Lopes Advogados**. Ela complementa a skill genérica de security review com as salvaguardas necessárias para proteção de sigilo profissional (sigilo advogado-cliente), conformidade com a LGPD e defesa contra ataques cibernéticos em formulários e canais de triagem.

---

## 1. Proteção ao Sigilo Profissional e LGPD

Dados coletados pelo escritório (descrição de demissão, relatos de assédio moral no trabalho, dados de saúde para BPC, comprovantes de renda e extratos bancários) constituem **dados pessoais altamente sensíveis** sob a ótica da LGPD e do sigilo profissional da advocacia:

1. **Isolamento de Dados no Log de Auditoria:**
   - **NUNCA** registre em texto puro nos logs do console (`console.log`, `console.info`) conteúdos de mensagens de clientes, números de CPF, telefones completos ou descrições de casos.
   - Em chamadas de serviços e webhooks (ex.: N8N), registre apenas metadados de auditoria:
     ```typescript
     console.info("[Audit] Disparo de triagem", {
       sessionId: payload.sessionId,
       area: payload.area,
       subarea: payload.subarea,
       messageLength: payload.message?.length,
       timestamp: new Date().toISOString()
     });
     ```
2. **Prevenção contra Exposição Não Autenticada (Anti-IDOR):**
   - Endpoints de consulta de dados de pré-atendimento (ex.: `/api/chat/pre-atendimento/:protocolo`) ou download de documentos não devem utilizar IDs sequenciais simples sem validação de token ou HMAC.

---

## 2. Higienização de Formulários e Prevenção de Injeção (XSS / SQLi)

1. **Validação Rígida de Entradas (Client e Server-side):**
   - Todo campo de texto em formulários de contato, diagnóstico ou chat deve passar por higienização estrita antes da renderização em tela e do armazenamento em banco.
   - Proibição de renderização direta com `dangerouslySetInnerHTML` para strings fornecidas por usuários.
   - Uso de bibliotecas de sanitização consolidadas (ex.: DOMPurify / sanitize-html) caso conteúdo formatado precise ser apresentado.
2. **Defesa contra Injeção de SQL e Comandos:**
   - No backend, toda query ao PostgreSQL deve utilizar consultas parametrizadas (`$1`, `$2`) ou ORM com escapes nativos. Nenhuma concatenação manual de strings em queries SQL é permitida.
3. **Proteção contra Cross-Site Request Forgery (CSRF) e Abuso:**
   - Headers de requisição validados; cookies sensíveis marcados com `HttpOnly`, `Secure` e `SameSite=Strict` ou `Lax`.

---

## 3. Segurança no Envio de Documentos e Uploads (PDF / Imagens)

Para clientes que enviam comprovantes de residência, carteira de trabalho (CTPS) e laudos médicos:

1. **Validação de Assinatura MIME (Magic Bytes):**
   - **NÃO** confie exclusivamente na extensão do arquivo (`.pdf`, `.jpg`, `.png`) ou no cabeçalho `Content-Type` enviado pelo navegador.
   - Valide os primeiros bytes do buffer no backend:
     - PDF: `%PDF-` (`0x25 0x50 0x44 0x46`)
     - PNG: `0x89 0x50 0x4E 0x47`
     - JPEG: `0xFF 0xD8 0xFF`
2. **Prevenção de Path Traversal:**
   - Arquivos salvos em disco devem receber nomes aleatórios gerados no servidor via UUID (`crypto.randomUUID()`) com extensão normalizada. Nunca utilize o nome de arquivo original fornecido pelo usuário diretamente no caminho do sistema de arquivos (`fs.writeFile`).
3. **Limitação de Tamanho e Quotas:**
   - Impor limite rígido por anexo (ex.: máximo 10MB por arquivo) para evitar negação de serviço por esgotamento de memória/disco.

---

## 4. Rate Limiting e Proteção de Endpoints Públicos

1. **Rate Limiting nas Rotas de Triagem e Lead Capture:**
   - Endpoints públicos como `/api/leads`, `/api/chat/message` e `/api/forgot-password` devem contar com limitador de taxa (ex.: `express-rate-limit`) por IP para evitar flooding, spam automatizado ou tentativas de brute-force.
2. **Validação de URLs Externas e Webhooks (Prevenção de SSRF):**
   - Antes de efetuar requisições externas para webhooks de terceiros (como N8N ou Asaas), o backend deve validar rigorosamente que a URL aponta para protocolos e hosts legítimos esperados, rejeitando esquemas como `file://`, `ftp://` ou endereços de loopback local (`127.0.0.1`, `localhost`, `169.254.169.254`).

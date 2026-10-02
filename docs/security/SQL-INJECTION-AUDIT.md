# Auditoria SQL Injection

**Data:** 22/06/2026

## Metodologia

Busca por concatenação dinâmica em queries (`db.query` + template strings com input do usuário).

## Resultado geral

**Nota: 8.5/10** — Queries usam placeholders parametrizados (`$1`, `$2`).

## Exemplo positivo (Diagnóstico Premium)

**Arquivo:** `backend/controllers/DiagnosticoPedidoController.js`

```js
const result = await db.query(
  `SELECT id, nome, empresa, email, whatsapp, regime_tributario, valor,
          status_pagamento, payment_method, payment_link, paid_at, created_at,
          asaas_payment_id
   FROM diagnostico_tributario_pedidos WHERE id = $1`,
  [id]
);
```

## Achado menor — Filtro de busca

**Classificação:** BAIXO

**Localização:** `DiagnosticoPedidoController.listPedidos` linha ~393

**Evidência:**

```js
values.push(`%${search}%`);
```

O valor é passado como parâmetro (seguro). Porém `%` e `_` no input do usuário funcionam como wildcards SQL LIKE.

**Risco:** Resultados inesperados em buscas admin, não execução de SQL arbitrário.

**Recomendação:** Escapar `%` e `_` no termo de busca: `search.replace(/[%_]/g, '\\$&')`.

## Achado — Sintaxe PostgreSQL em filtros de data

**Classificação:** MÉDIO (compatibilidade/erro, não injection)

**Evidência:**

```js
conditions.push(`created_at < ($${paramIdx++}::date + interval '1 day')`);
```

Falha no SQLite local. Não é injection, mas pode causar erro 500 expondo stack em dev.

**Recomendação:** Abstrair filtro de data por dialect ou usar comparação portable.

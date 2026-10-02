# Auditoria — Redirect ASAAS pós-pagamento (Diagnóstico Premium)

**Data:** 22/06/2026  
**Escopo:** Investigação apenas — sem correções implementadas  
**Objetivo:** Identificar por que, após pagamento no ASAAS, o usuário não retorna para  
`https://elilonlopesadvogados.com.br/diagnostico/sucesso`

---

## Resumo executivo

| Pergunta | Resposta |
|----------|----------|
| 1. O backend envia o `successUrl`? | **SIM** |
| 2. O ASAAS recebe o `successUrl`? | **PROVÁVEL SIM** (cobrança é criada sem erro; campo não é ecoado na resposta) |
| 3. O ASAAS devolve confirmação do `callback` na API? | **NÃO** (nem no POST nem no GET de pagamento) |
| 4. O Sandbox suporta redirecionamento? | **SIM** (documentação oficial) |
| 5. Onde está o problema? | **Configuração + fluxo de teste** (principal), com gaps menores no código |

**Conclusão:** O código backend monta e envia `callback.successUrl` corretamente para `POST /v3/payments`. A falha observada no teste local é **compatível com (a)** confirmação manual no painel sandbox (sem sessão na fatura), **(b)** possível divergência de domínio cadastrado na conta sandbox vs `FRONTEND_URL`, e **(c)** cobranças antigas criadas antes do `callback`. Não há evidência de formato incorreto do payload.

---

## ETAPA 1 — Auditoria `AsaasService.js`

**Arquivo:** `backend/services/AsaasService.js`  
**Método:** `createPayment()`

### Endpoint

```
POST {ASAAS_API_URL}/payments
```

Ambiente atual (`.env`):

```
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
→ POST https://sandbox.asaas.com/api/v3/payments
```

### Headers

```javascript
{
  access_token: process.env.ASAAS_API_KEY,
  "Content-Type": "application/json"
}
```

### Payload montado (quando `callback.successUrl` é informado)

```json
{
  "customer": "cus_xxxxxxxx",
  "billingType": "PIX | CREDIT_CARD",
  "value": 97,
  "dueDate": "YYYY-MM-DD",
  "description": "Diagnóstico Tributário Premium — {empresa}",
  "externalReference": "{uuid-do-pedido}",
  "callback": {
    "successUrl": "https://elilonlopesadvogados.com.br/diagnostico/sucesso?email={email}",
    "autoRedirect": true
  }
}
```

### Origem do `successUrl`

**Arquivo:** `backend/utils/frontendUrl.js`

```javascript
FRONTEND_URL + "/diagnostico/sucesso?email=" + encodeURIComponent(email)
```

Com `FRONTEND_URL=https://elilonlopesadvogados.com.br`, exemplo real:

```
https://elilonlopesadvogados.com.br/diagnostico/sucesso?email=cliente%40email.com
```

**Arquivo:** `backend/controllers/DiagnosticoPedidoController.js` (linhas ~172–197)

```javascript
const successUrl = buildDiagnosticoSuccessUrl(cleanEmail);
// ...
callback: { successUrl, autoRedirect: true }
```

✅ Formato **idêntico** ao documentado pelo ASAAS (`callback.successUrl` + `callback.autoRedirect`).

---

## ETAPA 2 — Logs temporários adicionados

**Arquivo alterado:** `backend/services/AsaasService.js`  
**Marcador:** `[AUDIT TEMP] ETAPA 2`

Logs inseridos **antes** e **depois** do `axios.post`:

```javascript
console.log("ASAAS REQUEST ENDPOINT", endpoint);
console.log("ASAAS REQUEST HEADERS", { access_token: "[REDACTED]", "Content-Type": "application/json" });
console.log("ASAAS REQUEST", JSON.stringify(payload, null, 2));
// ... post ...
console.log("ASAAS RESPONSE STATUS", response.status);
console.log("ASAAS RESPONSE", JSON.stringify(response.data, null, 2));
```

### Como capturar evidência

1. Reiniciar o backend (`npm run dev` em `backend/`)
2. Criar **novo** pedido pelo fluxo do Diagnóstico Premium
3. Copiar do terminal os blocos `ASAAS REQUEST` / `ASAAS RESPONSE`
4. Salvar em `docs/asaas/audit-create-payment-log.txt` (opcional)

**Script auxiliar (não executado automaticamente):** `backend/scripts/audit-asaas-redirect.js`  
Cria 1 cobrança de teste no sandbox e grava `docs/asaas/audit-api-response-sample.json`.

> ⚠️ Remover logs `[AUDIT TEMP]` após encerrar a investigação.

---

## ETAPA 3 — Validação documentação ASAAS

### Endpoint utilizado pelo projeto

| Item | Valor |
|------|-------|
| Método | `POST` |
| Path | `/v3/payments` |
| Referência | [Create new payment](https://docs.asaas.com/reference/create-new-payment) |
| Guia redirect | [Redirection after payment](https://docs.asaas.com/docs/redirection-after-payment) |

### Campos suportados oficialmente (request)

Schema `PaymentCallbackRequestDTO`:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `successUrl` | **Sim** | URL de retorno após pagamento (máx. 255 chars) |
| `autoRedirect` | Não | Default `true` — redirect automático vs botão "Ir para o site" |

O objeto deve ser enviado como **`callback`** no body de `POST /v3/payments`.

✅ O projeto usa exatamente esses nomes — **não** é `redirectUrl`, `returnUrl` ou campo solto na raiz.

### Resposta oficial (`PaymentGetResponseDTO`)

A resposta de criação/consulta **não documenta** o campo `callback`. Campos relevantes retornados:

- `invoiceUrl` — URL da fatura (usada como `payment_link` no banco)
- `bankSlipUrl` — boleto (se aplicável)
- **Não há** `successUrl`, `redirectUrl` ou `checkoutUrl` na resposta

---

## ETAPA 4 — Inspeção da resposta da API (evidência coletada)

### Pedidos locais recentes (SQLite)

| Pedido | ASAAS ID | Status | Criado em |
|--------|----------|--------|-----------|
| `21a8c18c-...` | `pay_6exdywtsjnx91jsw` | pago | 2026-06-22 23:55 |
| `17f7e286-...` | `pay_csx7bs8gs52wfjjx` | pago | 2026-06-22 23:42 |
| `49e42afe-...` | `pay_3zoqc93upunwpirk` | aguardando | 2026-06-22 21:32 |

`payment_link` armazenado:

```
https://sandbox.asaas.com/i/{invoiceId}
```

(Sem query `?autoRedirect=true`.)

### GET `/v3/payments/pay_6exdywtsjnx91jsw` (executado em 22/06/2026)

Campos relevantes retornados:

```json
{
  "id": "pay_6exdywtsjnx91jsw",
  "status": "RECEIVED",
  "invoiceUrl": "https://sandbox.asaas.com/i/6exdywtsjnx91jsw",
  "billingType": "PIX"
}
```

**Chaves presentes na resposta completa:** `invoiceUrl`, `bankSlipUrl`, `transactionReceiptUrl`, …  
**Chaves ausentes:** `callback`, `successUrl`, `redirectUrl`, `checkoutUrl`

| Campo | Presente na resposta GET? |
|-------|---------------------------|
| `callback` | ❌ NÃO |
| `successUrl` | ❌ NÃO |
| `redirectUrl` | ❌ NÃO |
| `checkoutUrl` | ❌ NÃO |
| `invoiceUrl` | ✅ SIM |

**Interpretação:** A API ASAAS **aceita** `callback` na criação, mas **não confirma** na resposta se foi aplicado. A validação exige teste funcional na UI da fatura ou logs do `ASAAS REQUEST` no momento da criação.

---

## ETAPA 5 — Sandbox vs Produção

### Sandbox suporta `autoRedirect` e `successUrl`?

**SIM.** Documentação não restringe redirect ao ambiente de produção. O mesmo `POST /v3/payments` com `callback` vale para sandbox e produção.

Referência: [Redirection after payment](https://docs.asaas.com/docs/redirection-after-payment)

### Sandbox executa `successUrl`?

**SIM, mas somente no fluxo de pagamento pela interface da fatura (`invoiceUrl`).**

O redirect ocorre quando o **cliente conclui o pagamento na tela do ASAAS** (PIX ou cartão com confirmação instantânea).

**NÃO ocorre** quando o operador confirma o pagamento **manualmente** no painel sandbox ou via API administrativa ([Confirmar pagamento sandbox](https://docs.asaas.com/reference/confirmar-pagamento)) — nesse caso:

- Webhook/backend pode marcar como pago ✅
- Admin reflete confirmação ✅
- **Nenhum browser está na fatura ASAAS** → redirect **não dispara** ❌

> Este ponto é crítico para o fluxo de teste descrito pelo time.

### Limitação de `localhost`

Documentação ASAAS exige que o domínio do `successUrl` seja **o mesmo cadastrado** em:

**Configurações da conta → Informações → site/domínio**

- `localhost` **não funciona** em produção de redirect real
- Em dev local, é necessário túnel (ngrok) + cadastro do domínio no ASAAS, **ou** alinhar `FRONTEND_URL` ao domínio já cadastrado na conta sandbox

### Necessidade de cadastrar domínio autorizado

**SIM — obrigatório.**

> *"A URL informada deve ser obrigatoriamente do mesmo domínio cadastrado em seus dados comerciais."*  
> — [Redirecionamento após o pagamento](https://docs.asaas.com/docs/redirecionamento-apos-o-pagamento)

### Divergência detectada no ambiente atual

| Variável | Valor atual |
|----------|-------------|
| `ASAAS_API_URL` | `https://sandbox.asaas.com/api/v3` (**sandbox**) |
| `FRONTEND_URL` | `https://elilonlopesadvogados.com.br` (**produção**) |

**Risco:** Se a conta **sandbox** tiver domínio diferente (ou vazio) em "Informações", o ASAAS pode:

- Rejeitar silenciosamente o callback, ou
- Criar a cobrança mas **não executar** redirect na fatura

**Ação manual necessária:** Abrir sandbox.asaas.com → Minha Conta → Informações → confirmar se o site cadastrado é exatamente `elilonlopesadvogados.com.br`.

---

## ETAPA 6 — Hipóteses ranqueadas (sem correção)

| # | Hipótese | Probabilidade | Evidência |
|---|----------|---------------|-----------|
| 1 | Confirmação manual no sandbox (não via `invoiceUrl`) | **Alta** | Redirect só ocorre na UI da fatura; teste atual usa painel sandbox |
| 2 | Domínio do `successUrl` ≠ domínio cadastrado na conta sandbox | **Alta** | Regra oficial ASAAS; env usa domínio produção + API sandbox |
| 3 | Cobrança criada antes do `callback` no código | **Média** | Pedidos de 21:32 podem não ter callback; pedidos 23:42+ provavelmente têm |
| 4 | Reabrir fatura já paga | **Média** | Docs: após pago, `invoiceUrl` mostra fatura paga **sem** redirect |
| 5 | Bug no formato do payload backend | **Baixa** | Código alinhado à documentação oficial |
| 6 | Sandbox não suporta redirect | **Descartada** | Documentação confirma suporte |

### Gap menor no código (não bloqueante, mas relevante)

A documentação ASAAS permite acrescentar na URL da fatura:

```
{invoiceUrl}?autoRedirect=true
```

O projeto persiste apenas `payment.invoiceUrl` bruto em `payment_link`, **sem** esse parâmetro.  
Impacto: se `autoRedirect` no payload não for honrado por algum motivo, a URL da fatura não força redirect ao reabrir.

---

## Checklist de validação manual (próximo passo)

1. [ ] Verificar domínio cadastrado na conta **sandbox** ASAAS
2. [ ] Criar **novo** pedido (pós-logs) e capturar `ASAAS REQUEST` no terminal
3. [ ] Abrir `payment_link` e pagar **dentro da fatura ASAAS** (PIX sandbox ou cartão teste)
4. [ ] **Não** confirmar pelo painel admin do sandbox
5. [ ] Observar se aparece botão "Ir para o site" ou redirect automático
6. [ ] Se falhar, testar `invoiceUrl?autoRedirect=true` manualmente no browser

---

## Respostas finais (formato solicitado)

1. **O backend envia o successUrl?** → **SIM**
2. **O ASAAS recebe o successUrl?** → **PROVÁVEL SIM** (criação OK; sem eco na resposta — confirmar via log ETAPA 2)
3. **O ASAAS devolve confirmação do callback?** → **NÃO** (API não retorna `callback` em GET/POST response)
4. **O Sandbox suporta redirecionamento?** → **SIM** (via fluxo da fatura, não via confirmação manual)
5. **O problema está em:**
   - **Configuração** — domínio sandbox vs `FRONTEND_URL`; método de confirmação de teste
   - **Fluxo de teste (Sandbox)** — confirmação manual não dispara redirect
   - **Código** — envio correto; gap menor: `invoiceUrl` sem `?autoRedirect=true`
   - **Documentação** — **não incorreta**; implementação segue o contrato oficial

---

## Arquivos relacionados

| Arquivo | Papel |
|---------|-------|
| `backend/services/AsaasService.js` | POST pagamento + logs temporários |
| `backend/controllers/DiagnosticoPedidoController.js` | Monta `successUrl` |
| `backend/utils/frontendUrl.js` | `FRONTEND_URL` → URL de sucesso |
| `pages/DiagnosticoPagamento.tsx` | Redireciona para `invoiceUrl` |
| `backend/scripts/audit-asaas-redirect.js` | Script opcional de captura |

---

## Referências

- [Create new payment — POST /v3/payments](https://docs.asaas.com/reference/create-new-payment)
- [Redirection after payment](https://docs.asaas.com/docs/redirection-after-payment)
- [Confirmar pagamento (sandbox only)](https://docs.asaas.com/reference/confirmar-pagamento)

# Frontend Dependencies Report — Sprint 3.12.2

**Data:** 22/06/2026  
**Comandos executados:**

```bash
npm audit
npm audit fix --legacy-peer-deps
npm run build
```

---

## Resumo

| Métrica | Antes (V2) | Depois (V3) |
|---------|------------|-------------|
| Total vulnerabilidades | 9 | **2** |
| HIGH | 4 | **0** |
| MODERATE | 4 | **2** |
| LOW | 1 | **0** |
| Build produção | OK | **OK** |

---

## Pacotes atualizados

| Pacote | Ação | Notas |
|--------|------|-------|
| `react-router` / `react-router-dom` | `npm audit fix` | CVEs HIGH corrigidos (RCE, open redirect, DoS) |
| `vite` | `npm audit fix` | 6.2.0 → **6.4.3** — path traversal dev server corrigido |
| `undici` | `npm audit fix` | CVEs HIGH corrigidos (transitivo) |
| `dompurify` | `npm audit fix` | Atualizado via lock (transitivo de isomorphic-dompurify) |
| `postcss` | `npm audit fix` | ≥8.5.10 |
| `@babel/core` | `npm audit fix` | Arbitrary file read corrigido |

---

## Vulnerabilidades remanescentes (2 MODERATE)

### quill ≤1.3.7 (via react-quill)

| Campo | Valor |
|-------|-------|
| Severidade | MODERATE |
| GHSA | GHSA-4943-9vgg-gr5r |
| Uso | Editor rich-text no **painel admin** (`react-quill`) |
| Risco residual | Baixo — não exposto a visitantes públicos |
| Fix disponível | `npm audit fix --force` → downgrade react-quill (breaking) |

**Decisão:** Manter versão atual. Substituir `react-quill` em sprint futura (TipTap/Lexical) se necessário.

---

## Build validado

```bash
npm run build  # ✓ built in ~28s
```

Chunks gerados corretamente:

- Home, Blog, Diagnóstico Tributário, Diagnóstico Pagamento
- BPCLandingPage, IRLandingPage
- Admin (dashboard)
- Router vendor (177 KB gzip 58 KB)

---

## Recomendações CI/CD

```yaml
- run: npm audit --audit-level=high --legacy-peer-deps
- run: npm run build
```

Bloquear deploy se `HIGH` ou `CRITICAL` > 0.

---

## Peer dependency note

`react-simple-maps@1.0.0` declara peer `react@^16.8.0`. Projeto usa React 18.  
Comando `npm update` requer `--legacy-peer-deps` — funcionalidade validada no build.

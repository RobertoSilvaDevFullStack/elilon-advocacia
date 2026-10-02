# Log Rotation — Winston

**Sprint:** 3.12.2  
**Arquivo:** `backend/config/logger.js`

---

## Implementação

Pacote: `winston-daily-rotate-file`

### Política

| Parâmetro | Valor |
|-----------|-------|
| Rotação | Diária (`YYYY-MM-DD`) |
| Tamanho máximo | 20 MB por arquivo |
| Arquivos mantidos | 30 |
| Compressão | gzip automático (`zippedArchive: true`) |

### Arquivos rotacionados

| Arquivo base | Conteúdo |
|--------------|----------|
| `error-*.log` | Apenas erros |
| `combined-*.log` | Todos os níveis |
| `pre-atendimentos-*.log` | Eventos de pré-atendimento |
| `documents-*.log` | Upload/download de documentos |
| `exceptions-*.log` | Exceções não capturadas |
| `rejections-*.log` | Promise rejections |

**Diretório:** `backend/logs/`

---

## Exemplo de arquivos gerados

```
backend/logs/
  combined-2026-06-22.log
  combined-2026-06-21.log.gz
  error-2026-06-22.log
  pre-atendimentos-2026-06-22.log
  documents-2026-06-22.log
```

---

## Configuração

```env
LOG_LEVEL=info          # debug | info | warn | error
NODE_ENV=production     # console desabilitado em produção
```

---

## Monitoramento

- Alertar se `error-*.log` crescer rapidamente
- Integrar com Uptime Kuma / log shipper (Datadog, Loki) em sprint futura
- Não commitar arquivos `.log` — já no `.gitignore`

---

## Migração

Logs antigos (`error.log`, `combined.log` fixos) serão substituídos pelo padrão rotacionado na próxima escrita.

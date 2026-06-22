# Auditoria Upload de Arquivos

**Data:** 22/06/2026

## Positivo — Validação por magic numbers

**Arquivo:** `backend/utils/fileValidator.js`

Validação real por assinatura binária (PDF, JPEG, PNG, DOCX), não apenas extensão/MIME.

## Vulnerabilidade 1 — Download público sem autenticação

**Classificação:** ALTO

**Localização:**
- Arquivo: `backend/routes/apiRoutes.js` linha 91
- Arquivo: `backend/controllers/ChatDocumentController.js` linhas 279-317
- Função: `download`

**Evidência (rota pública):**

```js
router.get("/chat/documents/download/:id", chatDocumentController.download);
```

**Evidência (sem auth):**

```js
async download(req, res) {
  const { id } = req.params;
  const document = await ChatDocumentRepository.findById(id);
  // ... stream direto para resposta
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}
```

**Risco:** Documentos jurídicos sensíveis (PDFs de clientes) acessíveis por UUID. Se ID vazar (logs, referrer, enumeração), download irrestrito.

**Cenário de Exploração:** Obter UUID de documento via resposta de upload ou log → `GET /api/chat/documents/download/{uuid}`.

**Recomendação:** Exigir token assinado de curta duração ou autenticação admin. Nunca expor download URL permanente.

---

## Vulnerabilidade 2 — Content-Disposition não sanitizado

**Classificação:** BAIXO

**Evidência:**

```js
res.setHeader("Content-Disposition", `attachment; filename="${document.original_name}"`);
```

Nome de arquivo controlado pelo uploader pode conter `"` ou `\r\n`.

**Recomendação:** Sanitizar filename ou usar `filename*=UTF-8''` com encodeURIComponent.

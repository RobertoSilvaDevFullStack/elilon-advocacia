# Relatório Técnico - Sprint 3.4: Upload de Documentos

**Data:** 16/06/2026  
**Versão:** 1.0  
**Status:** ✅ Concluído

---

## Resumo Executivo

Implementação completa da funcionalidade de upload de documentos durante o pré-atendimento jurídico no Chat. O usuário pode enviar até 10 documentos (PDF, JPG, PNG, DOCX) com limite de 10MB cada, ou optar por enviar posteriormente.

---

## Alterações Realizadas

### 1. Tipagens (chat.types.ts)

**Novos Estados FSM:**
```typescript
| "AWAITING_DOCUMENT_UPLOAD_OPTION"  // Aguardando escolha sobre upload
| "DOCUMENT_UPLOAD_OPTION_SELECTED"  // Opção de upload selecionada
| "UPLOADING_DOCUMENTS"              // Processando upload
| "DOCUMENTS_UPLOADED"               // Documentos enviados
```

**Novos Eventos FSM:**
```typescript
| { type: "SELECT_DOCUMENT_UPLOAD_OPTION"; option: "UPLOAD_NOW" | "UPLOAD_LATER" }
| { type: "UPLOAD_DOCUMENTS"; files: UploadedDocument[] }
| { type: "DOCUMENTS_UPLOAD_COMPLETE"; documents: UploadedDocument[] }
```

**Novas Interfaces:**
- `UploadedDocument` - Representa um documento enviado
- `DocumentUploadData` - Dados de upload (lista, tamanho total, contagem, flag skipped)
- `DocumentMetadata` - Metadados do documento (nome, extensão, tamanho, mimeType)

**Atualizações de Interfaces Existentes:**
- `QualificationSummary` - Adicionado campo `documents?: DocumentUploadData`
- `ClientDataDTO` - Adicionado campo `documents?: DocumentUploadData`
- `FSMContext` - Adicionado campo `documentos?: DocumentUploadData`
- `ChatWindowProps` - Adicionadas 6 novas props para controle de upload
- `MessageListProps` - Adicionadas 6 novas props para controle de upload

---

### 2. Validações (validation.ts)

**Novas Constantes:**
```typescript
export const DOCUMENT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,  // 10 MB
  maxFiles: 10,
  allowedExtensions: ["PDF", "JPG", "JPEG", "PNG", "DOCX"],
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};
```

**Novas Funções:**
- `validateDocument(file)` - Valida extensão, tamanho e arquivo vazio
- `validateDocuments(files)` - Valida lista de documentos e quantidade máxima
- `formatFileSize(bytes)` - Formata tamanho para exibição (B, KB, MB, GB)
- `getDocumentUploadGuidance()` - Retorna mensagem de orientação com exemplos
- `getDocumentUploadConfirmation(count, totalSize)` - Retorna mensagem de confirmação

---

### 3. ChatWidget (ChatWidget.tsx)

**Novos Estados:**
```typescript
const [showDocumentUploadOption, setShowDocumentUploadOption] = useState(false);
const [showDocumentUploader, setShowDocumentUploader] = useState(false);
const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
const [documentErrors, setDocumentErrors] = useState<string[]>([]);
```

**Novas Constantes:**
- `MENSAGEM_PERGUNTA_DOCUMENTOS` - Pergunta inicial sobre upload
- `MENSAGEM_ORIENTACAO_DOCUMENTOS` - Orientação sobre tipos aceitos

**Novos Handlers:**
- `handleDocumentUploadOption(option)` - Lida com escolha Sim/Não
- `handleDocumentUpload(files)` - Processa upload de arquivos
- `handleSkipDocumentUpload()` - Permite pular upload

**Modificações de Fluxo:**
- `processCollectedData` - Agora pergunta sobre documentos após `caseDescription`
- `showQualificationSummary` - Inclui lista de documentos no resumo
- `addBotMessage` - Aceita nova opção `showDocumentOption`

---

### 4. ChatWindow (ChatWindow.tsx)

**Novas Props Recebidas:**
- `showDocumentOption`, `showDocumentUploader`, `documentErrors`
- `onSelectDocumentOption`, `onDocumentUpload`, `onSkipDocumentUpload`

**Passagem de Props:**
- Todas as props de documentos são repassadas para `MessageList`

---

### 5. MessageList (MessageList.tsx)

**Novas Props:**
- Recebe todas as props de upload de documentos

**Novos Handlers:**
- `handleDocumentOption(option)` - Chama callback de seleção
- `handleFileChange(e)` - Chama callback de upload com FileList

**Novas Seções JSX:**

1. **Botões de Opção de Upload:**
```tsx
{showDocumentOption && !isTyping && onSelectDocumentOption && (
  <div className="flex items-start gap-2 mb-4">
    {/* Botão "Sim, quero enviar documentos" */}
    {/* Botão "Não, enviar depois" */}
  </div>
)}
```

2. **Interface de Upload:**
```tsx
{showDocumentUploader && !isTyping && onDocumentUpload && (
  <div className="flex items-start gap-2 mb-4">
    {/* Input de arquivo oculto */}
    {/* Botão "Selecionar arquivos" */}
    {/* Botão "Pular esta etapa" */}
    {/* Exibição de erros de validação */}
  </div>
)}
```

---

## Fluxo de Estados FSM

```
CASE_DESCRIPTION_COLLECTED
         ↓
AWAITING_DOCUMENT_UPLOAD_OPTION
         ↓
    [Usuário escolhe]
    ┌─────────┴─────────┐
    ↓                   ↓
UPLOAD_NOW       UPLOAD_LATER
    ↓                   ↓
DOCUMENT_UPLOAD_   DOCUMENTS_UPLOADED
OPTION_SELECTED       (skipped=true)
    ↓
UPLOADING_DOCUMENTS
    ↓
DOCUMENTS_UPLOADED
    ↓
QUALIFICATION_COMPLETE
```

---

## Requisitos Implementados

### ✅ Upload de Documentos
- [x] Seleção múltipla de arquivos
- [x] Formatos aceitos: PDF, JPG, JPEG, PNG, DOCX
- [x] Limite: 10 MB por arquivo
- [x] Máximo: 10 arquivos
- [x] Validação de extensão
- [x] Validação de tamanho
- [x] Validação de arquivo vazio
- [x] Mensagens de erro amigáveis

### ✅ Fluxo de Escolha
- [x] Pergunta: "Você possui documentos relacionados ao seu caso?"
- [x] Opção "Sim, quero enviar documentos" (com ícone Paperclip)
- [x] Opção "Não, enviar depois"
- [x] Orientação com exemplos de documentos (RG, CPF, CNIS, etc.)

### ✅ Integração no Fluxo
- [x] Após descrição do caso, pergunta sobre documentos
- [x] Resumo de qualificação inclui documentos enviados
- [x] Protocolo continua sendo gerado normalmente
- [x] Documentos salvos no contexto da FSM

### ✅ Preparação Futura
- [x] Estrutura preparada para MinIO (campos storagePath, bucket, url)
- [x] Estrutura preparada para persistência PostgreSQL
- [x] Documentação de integração N8N e Hermes

---

## Arquivos Modificados

| Arquivo | Linhas Alteradas | Descrição |
|---------|------------------|------------|
| chat.types.ts | ~60 linhas | Novos tipos, estados, interfaces |
| validation.ts | ~120 linhas | Validações e funções de documentos |
| ChatWidget.tsx | ~180 linhas | Lógica de upload e handlers |
| ChatWindow.tsx | ~20 linhas | Passagem de props |
| MessageList.tsx | ~180 linhas | UI de upload de documentos |

---

## Estrutura de Dados de Documentos

```typescript
// Exemplo de documento enviado
{
  id: "doc_123456",
  file: File,
  metadata: {
    originalName: "holerite_janeiro.pdf",
    fileName: "abc123_holerite_janeiro.pdf",
    extension: "PDF",
    size: 2457600,  // ~2.4 MB
    mimeType: "application/pdf",
    uploadedAt: "2026-06-16T13:30:00Z",
    // Preparação MinIO:
    storagePath: "chat/documents/abc123_holerite_janeiro.pdf",
    bucket: "elilon-documents",
    url: "https://minio.elilon.com/..."
  },
  status: "success"
}

// Exemplo de DocumentUploadData
{
  documents: [doc1, doc2, ...],
  totalSize: 5242880,  // ~5 MB total
  count: 2,
  skipped: false
}
```

---

## Próximos Passos (Futuras Sprints)

1. **Sprint 3.5/4.0 - Integração MinIO:**
   - Implementar upload real para storage MinIO
   - Gerar URLs assinadas
   - Configurar buckets e políticas de acesso

2. **Sprint 4.x - Integração Hermes:**
   - Análise automática de documentos
   - OCR para extração de texto
   - Classificação de documentos

3. **Sprint 5.x - Integração N8N:**
   - Envio automático de documentos para advogados
   - Notificações de novos uploads
   - Automação de fluxo de trabalho

---

## Checklist de Testes

- [x] Compilação sem erros
- [x] FSM transiciona corretamente entre estados
- [x] Botões de opção aparecem após descrição do caso
- [x] Interface de upload aparece ao escolher "Sim"
- [x] Validação de extensão funciona
- [x] Validação de tamanho funciona
- [x] Validação de quantidade máxima funciona
- [x] Erros são exibidos amigavelmente
- [x] Resumo inclui documentos enviados
- [x] Opção "Não, enviar depois" funciona
- [x] Protocolo é gerado corretamente

---

## Notas Técnicas

1. **Armazenamento Local:** Nesta sprint, os documentos são armazenados apenas no estado do React para validação do fluxo. O objeto File do browser é mantido na memória.

2. **Preparação MinIO:** Todos os documentos já incluem campos preparatórios (`storagePath`, `bucket`, `url`) que serão preenchidos na integração com MinIO.

3. **LGPD:** Todos os documentos são tratados com sigilo conforme a LGPD, conforme informado na mensagem de orientação.

4. **UX:** Botões possuem transições suaves (hover:scale, active:scale) para feedback visual.

---

## Conclusão

A Sprint 3.4 foi implementada com sucesso, adicionando a funcionalidade completa de upload de documentos ao fluxo de pré-atendimento do Chat Jurídico. A implementação segue os padrões do projeto, reutiliza componentes existentes e está preparada para futuras integrações com MinIO, Hermes e N8N.

**Status:** ✅ Pronto para deploy

---

*Documento gerado automaticamente em 16/06/2026*

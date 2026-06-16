/**
 * Utilitários de validação para coleta de dados do chat
 * Sprint 3: Validação de email e telefone brasileiro
 */

import type { ValidationResult, DataField, UploadedDocument, AllowedDocumentType } from "../types/chat.types";

// Sprint 3.4: Configurações de upload de documentos
export const DOCUMENT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  maxFiles: 10,
  allowedExtensions: ["PDF", "JPG", "JPEG", "PNG", "DOCX"] as AllowedDocumentType[],
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// Regex para validação de email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex para validação de telefone brasileiro
// Aceita formatos: (11) 99999-9999, 11999999999, +55 11 99999-9999, etc.
const PHONE_REGEX = /^(\+?55\s?)?\(?([1-9][0-9])\)?\s?(9?[0-9]{4})[-\s]?([0-9]{4})$/;

// Regex para validação de estado (2 letras)
const STATE_REGEX = /^[A-Za-z]{2}$/;

// Lista de estados brasileiros válidos
const VALID_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

/**
 * Valida um endereço de email
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, error: "Por favor, digite seu e-mail." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "E-mail inválido. Use o formato: exemplo@email.com" };
  }

  return { valid: true, normalizedValue: trimmed };
}

/**
 * Valida um número de telefone brasileiro
 * Remove caracteres não numéricos e normaliza
 */
export function validatePhone(phone: string): ValidationResult {
  // Remove tudo exceto números
  const numbersOnly = phone.replace(/\D/g, "");

  if (!numbersOnly) {
    return { valid: false, error: "Por favor, digite seu telefone." };
  }

  // Verifica se tem dígitos suficientes (mínimo 10 para fixo, 11 para celular)
  if (numbersOnly.length < 10) {
    return { valid: false, error: "Número de telefone muito curto. Digite DDD + número." };
  }

  if (numbersOnly.length > 11) {
    return { valid: false, error: "Número de telefone muito longo." };
  }

  // Se começa com +55, remove
  let cleanNumber = numbersOnly;
  if (cleanNumber.startsWith("55") && cleanNumber.length >= 12) {
    cleanNumber = cleanNumber.substring(2);
  }

  // Verifica DDD (primeiros 2 dígitos)
  const ddd = cleanNumber.substring(0, 2);
  const dddNum = parseInt(ddd, 10);
  if (dddNum < 11 || dddNum > 99) {
    return { valid: false, error: "DDD inválido. Use um DDD válido (ex: 11, 21, 31)." };
  }

  // Normaliza para formato: (XX) XXXXX-XXXX
  const isCelular = cleanNumber.length === 11;
  const formatted = isCelular
    ? `(${ddd}) ${cleanNumber.substring(2, 7)}-${cleanNumber.substring(7)}`
    : `(${ddd}) ${cleanNumber.substring(2, 6)}-${cleanNumber.substring(6)}`;

  return { valid: true, normalizedValue: formatted };
}

/**
 * Valida um nome
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { valid: false, error: "Por favor, digite seu nome completo." };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: "Nome muito curto. Digite pelo menos 3 caracteres." };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Nome muito longo. Use no máximo 100 caracteres." };
  }

  // Verifica se contém pelo menos um espaço (nome e sobrenome)
  if (!trimmed.includes(" ")) {
    return { valid: false, error: "Digite seu nome completo (nome e sobrenome)." };
  }

  // Remove múltiplos espaços
  const normalized = trimmed.replace(/\s+/g, " ");

  return { valid: true, normalizedValue: normalized };
}

/**
 * Valida uma cidade
 */
export function validateCity(city: string): ValidationResult {
  const trimmed = city.trim();

  if (!trimmed) {
    return { valid: false, error: "Por favor, digite o nome da cidade." };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: "Nome da cidade muito curto." };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "Nome da cidade muito longo." };
  }

  return { valid: true, normalizedValue: trimmed };
}

/**
 * Valida uma sigla de estado brasileiro
 */
export function validateState(state: string): ValidationResult {
  const trimmed = state.trim().toUpperCase();

  if (!trimmed) {
    return { valid: false, error: "Por favor, digite a sigla do estado (ex: SP, RJ, MG)." };
  }

  if (!STATE_REGEX.test(trimmed)) {
    return { valid: false, error: "Estado inválido. Use 2 letras (ex: SP, RJ, MG)." };
  }

  if (!VALID_STATES.includes(trimmed)) {
    return { valid: false, error: `Estado "${trimmed}" não existe. Use uma sigla válida (ex: SP, RJ, MG, BA, etc.).` };
  }

  return { valid: true, normalizedValue: trimmed };
}

/**
 * Valida um campo genérico baseado no tipo
 */
export function validateField(field: DataField, value: string): ValidationResult {
  switch (field) {
    case "name":
      return validateName(value);
    case "phone":
      return validatePhone(value);
    case "email":
      return validateEmail(value);
    case "city":
      return validateCity(value);
    case "state":
      return validateState(value);
    default:
      return { valid: true };
  }
}

/**
 * Gera mensagem de erro amigável para campo inválido
 */
export function getValidationErrorMessage(field: DataField): string {
  const messages: Record<DataField, string> = {
    name: "Nome inválido. Digite seu nome completo (nome e sobrenome).",
    phone: "Telefone inválido. Use o formato: (11) 99999-9999",
    email: "E-mail inválido. Use o formato: exemplo@email.com",
    city: "Cidade inválida. Digite o nome completo da cidade.",
    state: "Estado inválido. Use a sigla com 2 letras (ex: SP, RJ, MG).",
    caseDescription: "Descrição inválida. Use entre 20 e 3000 caracteres para descrever seu caso.",
  };

  return messages[field];
}

/**
 * Valida a descrição do caso jurídico
 * Sprint 3.1: Coleta de descrição do caso
 */
export function validateCaseDescription(description: string): ValidationResult {
  const trimmed = description.trim();

  if (!trimmed) {
    return { valid: false, error: "Por favor, descreva brevemente sua situação jurídica." };
  }

  if (trimmed.length < 20) {
    return { valid: false, error: "Por favor, descreva um pouco mais sobre sua situação para que possamos compreender seu caso." };
  }

  if (trimmed.length > 3000) {
    return { valid: false, error: "A descrição é muito longa. Use no máximo 3000 caracteres." };
  }

  // Normaliza: remove espaços múltiplos, mantém quebras de linha
  const normalized = trimmed.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

  return { valid: true, normalizedValue: normalized };
}

/**
 * Gera mensagem de solicitação para cada campo
 */
export function getFieldPromptMessage(field: DataField, isRetry: boolean = false): string {
  const messages: Record<DataField, { initial: string; retry: string }> = {
    name: {
      initial: "Qual é o seu nome completo?",
      retry: "Vamos tentar novamente. Qual é o seu nome completo?",
    },
    phone: {
      initial: "Obrigado. Qual é o seu telefone com WhatsApp?",
      retry: "Vamos corrigir. Qual é o seu telefone com WhatsApp?",
    },
    email: {
      initial: "Qual é o seu melhor e-mail?",
      retry: "Vamos corrigir. Qual é o seu e-mail?",
    },
    city: {
      initial: "Em qual cidade você mora?",
      retry: "Vamos corrigir. Em qual cidade você mora?",
    },
    state: {
      initial: "Qual é o seu estado? (sigla de 2 letras, ex: SP)",
      retry: "Vamos corrigir. Qual é o seu estado? (ex: SP, RJ, MG)",
    },
    caseDescription: {
      initial: `Perfeito! Agora conte brevemente o que aconteceu no seu caso.

Quanto mais detalhes você fornecer, melhor poderemos direcionar seu atendimento.`,
      retry: "Vamos tentar novamente. Por favor, descreva sua situação com mais detalhes.",
    },
  };

  return isRetry ? messages[field].retry : messages[field].initial;
}

// Sprint 3.4: Validação de documentos

/**
 * Extrai a extensão de um arquivo e converte para maiúsculas
 */
function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop();
  return ext ? ext.toUpperCase() : "";
}

/**
 * Valida um arquivo individual
 * Retorna resultado da validação e mensagem de erro se houver
 */
export function validateDocument(file: File): { valid: boolean; error?: string } {
  const extension = getFileExtension(file.name) as AllowedDocumentType;

  // Verifica se extensão é permitida
  if (!DOCUMENT_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Formato não suportado: .${extension}. Use: PDF, JPG, JPEG, PNG ou DOCX.`,
    };
  }

  // Verifica tamanho máximo
  if (file.size > DOCUMENT_CONFIG.maxFileSize) {
    const maxSizeMB = DOCUMENT_CONFIG.maxFileSize / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Arquivo muito grande (${fileSizeMB} MB). Limite: ${maxSizeMB} MB.`,
    };
  }

  // Verifica se arquivo está vazio
  if (file.size === 0) {
    return {
      valid: false,
      error: "O arquivo está vazio. Selecione um arquivo válido.",
    };
  }

  return { valid: true };
}

/**
 * Valida uma lista de documentos
 * Verifica quantidade máxima e valida cada arquivo
 */
export function validateDocuments(
  files: File[]
): { valid: boolean; errors: string[]; validFiles: File[] } {
  const errors: string[] = [];
  const validFiles: File[] = [];

  // Verifica quantidade máxima
  if (files.length > DOCUMENT_CONFIG.maxFiles) {
    errors.push(`Limite de ${DOCUMENT_CONFIG.maxFiles} arquivos excedido. Você selecionou ${files.length}.`);
    return { valid: false, errors, validFiles: [] };
  }

  // Valida cada arquivo
  for (const file of files) {
    const result = validateDocument(file);
    if (result.valid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Gera mensagem de orientação sobre documentos aceitos
 */
export function getDocumentUploadGuidance(): string {
  return `Você pode anexar documentos que ajudem nossa equipe a compreender melhor sua situação.

**Exemplos:**
• RG
• CPF
• CNIS
• Laudos
• Contratos
• Holerites
• Comprovantes

**Formatos aceitos:** PDF, JPG, JPEG, PNG, DOCX
**Tamanho máximo:** 10 MB por arquivo
**Limite:** até 10 arquivos

Todos os documentos serão tratados com sigilo conforme a LGPD.`;
}

/**
 * Gera mensagem de confirmação de upload
 */
export function getDocumentUploadConfirmation(count: number, totalSize: number): string {
  if (count === 0) {
    return "Nenhum documento foi enviado. Você poderá enviá-los posteriormente.";
  }
  const sizeFormatted = formatFileSize(totalSize);
  return `✅ **${count} documento${count > 1 ? "s" : ""} recebido${count > 1 ? "s" : ""}** (${sizeFormatted})\n\nSeus documentos foram registrados e serão analisados pela equipe jurídica.`;
}

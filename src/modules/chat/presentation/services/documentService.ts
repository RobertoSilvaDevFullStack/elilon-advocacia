/**
 * DocumentService
 * Sprint 3.4: Upload de Documentos - Persistência Local
 * 
 * Responsabilidades:
 * - Enviar documentos para o backend via FormData
 * - Listar documentos de um pré-atendimento
 * - Download de documentos
 */

import type { UploadedDocument } from "../types/chat.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface UploadDocumentsResponse {
  success: boolean;
  message: string;
  data: {
    pre_atendimento_id: string;
    pre_atendimento_protocolo: string;
    documents: Array<{
      id: string;
      original_name: string;
      file_name: string;
      extension: string;
      size_bytes: number;
      mime_type: string;
      uploaded_at: string;
    }>;
    total_uploaded: number;
    errors?: string[];
  };
}

export interface ListDocumentsResponse {
  success: boolean;
  data: {
    pre_atendimento_id: string;
    pre_atendimento_protocolo: string;
    documents: Array<{
      id: string;
      pre_atendimento_id: string;
      original_name: string;
      file_name: string;
      extension: string;
      size_bytes: number;
      mime_type: string;
      storage_path: string;
      uploaded_at: string;
      file_exists: boolean;
    }>;
    stats: {
      total_count: number;
      total_size_bytes: number;
      total_size_formatted: string;
    };
  };
}

/**
 * Faz upload de múltiplos documentos para um pré-atendimento
 * @param files - Lista de arquivos File do browser
 * @param preAtendimentoId - ID do pré-atendimento
 * @param preAtendimentoProtocolo - Protocolo do pré-atendimento (opcional)
 * @returns Promise com resposta do upload
 */
export async function uploadDocuments(
  files: File[],
  preAtendimentoId: string,
  preAtendimentoProtocolo?: string
): Promise<UploadDocumentsResponse> {
  const formData = new FormData();

  // Adicionar arquivos
  files.forEach((file) => {
    formData.append("documents", file);
  });

  // Adicionar metadados
  formData.append("pre_atendimento_id", preAtendimentoId);
  if (preAtendimentoProtocolo) {
    formData.append("pre_atendimento_protocolo", preAtendimentoProtocolo);
  }

  const response = await fetch(`${API_BASE_URL}/chat/upload-documents`, {
    method: "POST",
    body: formData,
    // Não definir Content-Type - o browser define automaticamente com boundary
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Erro ao enviar documentos");
  }

  return data;
}

/**
 * Lista todos os documentos de um pré-atendimento
 * @param preAtendimentoId - ID do pré-atendimento
 * @returns Promise com lista de documentos
 */
export async function listDocuments(preAtendimentoId: string): Promise<ListDocumentsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/chat/documents/${preAtendimentoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao listar documentos");
  }

  return data;
}

/**
 * Faz download de um documento específico
 * @param documentId - ID do documento
 * @param fileName - Nome do arquivo para download
 */
export async function downloadDocument(documentId: string, fileName: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/chat/documents/download/${documentId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Erro ao fazer download");
  }

  // Criar blob e link de download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Converte objetos UploadedDocument do frontend para File[] para upload
 * @param documents - Lista de UploadedDocument do contexto
 * @returns Array de objetos File (se disponíveis)
 */
export function extractFilesFromDocuments(documents: UploadedDocument[]): File[] {
  return documents
    .filter((doc) => doc.file instanceof File)
    .map((doc) => doc.file as File);
}

/**
 * Formata tamanho de arquivo para exibição
 * @param bytes - Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

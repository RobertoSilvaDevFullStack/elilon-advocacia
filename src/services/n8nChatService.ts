/**
 * N8N Chat Service — Sprint 4.0.2
 *
 * Responsabilidades:
 *  - Enviar mensagem ao webhook conversacional do N8N
 *  - Retornar resposta estruturada para o ChatWidget exibir
 *  - Gerenciar timeout de 10s
 *  - Nunca lançar exceção para o chamador (fallback silencioso)
 *  - Registrar logs de auditoria (sessionId, area, tempo de resposta)
 */

import { N8N_CHAT_WEBHOOK_URL, N8N_TIMEOUT_MS, isN8NConfigured } from "../config/n8n";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface N8NMessagePayload {
  sessionId: string;
  currentState: string;
  area: string;
  subarea: string;
  message: string;
  dadosColetados: Record<string, any>;
  documentos: any[];
  protocolo?: string | null;
}

export interface N8NConversationalResponse {
  sucesso: boolean;
  resposta: string;
  proximaAcao: "CONTINUAR_COLETA" | "ENCERRAR" | string;
  perguntasAdicionais: string[];
  documentosSolicitados: string[];
  informacoesColetadas: Record<string, any>;
  qualificacaoSuficiente: boolean;
  turno?: number;
  resumo_final?: Record<string, any> | null;
  protocolo?: string | null;
}

// ─── Métricas de sessão (preparação para dashboard futuro) ────────────────────

interface N8NMetrics {
  n8n_response_time: number;
  n8n_success: boolean;
  n8n_failure: boolean;
  sessionId: string;
  area: string;
  subarea: string;
  timestamp: string;
}

const metricsBuffer: N8NMetrics[] = [];

function recordMetric(metric: N8NMetrics): void {
  metricsBuffer.push(metric);
  if (metricsBuffer.length > 100) metricsBuffer.shift();
}

/** Expõe métricas acumuladas para futura integração com dashboard */
export function getN8NMetrics(): readonly N8NMetrics[] {
  return metricsBuffer;
}

// ─── Resposta de fallback ─────────────────────────────────────────────────────

const FALLBACK_RESPONSE: N8NConversationalResponse = {
  sucesso: false,
  resposta:
    "Recebi suas informações. Nossa equipe jurídica irá analisar seu caso e retornará em breve.",
  proximaAcao: "CONTINUAR_COLETA",
  perguntasAdicionais: [],
  documentosSolicitados: [],
  informacoesColetadas: {},
  qualificacaoSuficiente: false,
};

const TIMEOUT_RESPONSE: N8NConversationalResponse = {
  sucesso: false,
  resposta:
    "Estamos processando suas informações. Por favor, tente novamente em alguns instantes.",
  proximaAcao: "CONTINUAR_COLETA",
  perguntasAdicionais: [],
  documentosSolicitados: [],
  informacoesColetadas: {},
  qualificacaoSuficiente: false,
};

// ─── Serviço principal ────────────────────────────────────────────────────────

class N8NChatService {
  /**
   * Envia uma mensagem ao N8N e retorna a resposta do agente jurídico.
   * Nunca lança exceção — retorna fallback em caso de erro.
   */
  async sendMessage(payload: N8NMessagePayload): Promise<N8NConversationalResponse> {
    const inicio = Date.now();

    if (!isN8NConfigured()) {
      console.error("[N8N] Webhook não configurado — nenhuma chamada realizada", {
        sessionId: payload.sessionId,
      });
      return FALLBACK_RESPONSE;
    }

    console.info("[N8N] Payload enviado", {
      sessionId: payload.sessionId,
      currentState: payload.currentState,
      area: payload.area,
      subarea: payload.subarea,
      protocolo: payload.protocolo ?? null,
      messageLength: payload.message.length,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(N8N_CHAT_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const elapsed = Date.now() - inicio;

      if (!response.ok) {
        console.error("[N8N] Resposta HTTP com erro", {
          status: response.status,
          sessionId: payload.sessionId,
          elapsed,
        });

        recordMetric({
          n8n_response_time: elapsed,
          n8n_success: false,
          n8n_failure: true,
          sessionId: payload.sessionId,
          area: payload.area,
          subarea: payload.subarea,
          timestamp: new Date().toISOString(),
        });

        return FALLBACK_RESPONSE;
      }

      const data: N8NConversationalResponse = await response.json();

      console.info("[N8N] Resposta recebida", {
        sessionId: payload.sessionId,
        protocolo: payload.protocolo ?? null,
        area: payload.area,
        subarea: payload.subarea,
        proximaAcao: data.proximaAcao,
        qualificacaoSuficiente: data.qualificacaoSuficiente,
        elapsed,
      });

      recordMetric({
        n8n_response_time: elapsed,
        n8n_success: true,
        n8n_failure: false,
        sessionId: payload.sessionId,
        area: payload.area,
        subarea: payload.subarea,
        timestamp: new Date().toISOString(),
      });

      return {
        sucesso: data.sucesso ?? true,
        resposta: data.resposta || FALLBACK_RESPONSE.resposta,
        proximaAcao: data.proximaAcao || "CONTINUAR_COLETA",
        perguntasAdicionais: Array.isArray(data.perguntasAdicionais)
          ? data.perguntasAdicionais
          : [],
        documentosSolicitados: Array.isArray(data.documentosSolicitados)
          ? data.documentosSolicitados
          : [],
        informacoesColetadas: data.informacoesColetadas || {},
        qualificacaoSuficiente: data.qualificacaoSuficiente || false,
        turno: data.turno,
        resumo_final: data.resumo_final ?? null,
        protocolo: data.protocolo ?? payload.protocolo ?? null,
      };
    } catch (error) {
      const elapsed = Date.now() - inicio;
      const isTimeout =
        error instanceof Error && error.name === "AbortError";

      if (isTimeout) {
        console.error("[N8N] Timeout", {
          sessionId: payload.sessionId,
          elapsed,
          limit: N8N_TIMEOUT_MS,
        });
      } else {
        console.error("[N8N] Erro", {
          sessionId: payload.sessionId,
          area: payload.area,
          subarea: payload.subarea,
          error: error instanceof Error ? error.message : String(error),
          elapsed,
        });
      }

      recordMetric({
        n8n_response_time: elapsed,
        n8n_success: false,
        n8n_failure: true,
        sessionId: payload.sessionId,
        area: payload.area,
        subarea: payload.subarea,
        timestamp: new Date().toISOString(),
      });

      return isTimeout ? TIMEOUT_RESPONSE : FALLBACK_RESPONSE;
    }
  }
}

export const n8nChatService = new N8NChatService();

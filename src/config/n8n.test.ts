import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * A configuração do N8N é lida de import.meta.env no import do módulo.
 * Para exercitar cenários diferentes, recarregamos o módulo a cada caso.
 */
async function carregarGate(webhookUrl: string) {
  vi.resetModules();
  vi.stubEnv("VITE_N8N_CHAT_WEBHOOK_URL", webhookUrl);
  return import("./n8n");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("isN8NConfigured", () => {
  it("não considera configurado um webhook que não é uma URL http(s)", async () => {
    const { isN8NConfigured } = await carregarGate("webhook-chat");

    expect(isN8NConfigured()).toBe(false);
  });
});

describe("shouldUseN8N", () => {
  it("não aciona o N8N em estado conversacional quando o webhook é inválido", async () => {
    const { shouldUseN8N } = await carregarGate("webhook-chat");

    expect(shouldUseN8N("QUALIFICATION_COMPLETE")).toBe(false);
  });
});

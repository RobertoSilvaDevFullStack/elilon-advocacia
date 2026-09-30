import { afterEach, describe, expect, it, vi } from "vitest";
import type { N8NMessagePayload } from "./n8nChatService";

async function carregarServico(webhookUrl: string) {
  vi.resetModules();
  vi.stubEnv("VITE_N8N_CHAT_WEBHOOK_URL", webhookUrl);
  return import("./n8nChatService");
}

function payloadDeTeste(): N8NMessagePayload {
  return {
    sessionId: "sessao-1",
    currentState: "QUALIFICATION_COMPLETE",
    area: "trabalhista",
    subarea: "bancarios",
    message: "Fui demitido sem justa causa.",
    dadosColetados: {},
    documentos: [],
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("n8nChatService.sendMessage", () => {
  it("não chama a rede quando o webhook não está configurado", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { n8nChatService } = await carregarServico("webhook-chat");

    const resposta = await n8nChatService.sendMessage(payloadDeTeste());

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(resposta.sucesso).toBe(false);
  });
});

/**
 * LandingCapture
 * Sprint 3.7 — Fechamento dos Vazamentos de Leads
 *
 * Componente reutilizável para LPs (BPC, IR, futuras).
 * Fluxo: preenche Nome + WhatsApp → persiste lead → abre WhatsApp.
 */
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { openWhatsApp } from "../../../utils/whatsapp";
import { getApiBaseUrl } from "../../../utils/api";
import { trackLandingLead } from "../../../utils/tracking";

const API_URL = getApiBaseUrl();

interface LandingCaptureProps {
  source: "landing_bpc" | "landing_ir";
  ctaName: string;
  buttonLabel?: string;
  buttonClass?: string;
}

const LandingCapture: React.FC<LandingCaptureProps> = ({
  source,
  ctaName,
  buttonLabel = "Solicitar Análise Gratuita pelo WhatsApp",
  buttonClass = "",
}) => {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (!nome.trim() || cleanPhone.length < 10) {
      setError("Preencha nome e WhatsApp válidos.");
      return;
    }

    setLoading(true);
    let persisted = false;

    try {
      // Capturar UTMs da URL atual
      const params = new URLSearchParams(window.location.search);

      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome.trim(),
          phone: whatsapp.trim(),
          email: "",
          city: "",
          interest: source,
          message: "",
          source,
          utm_source: params.get("utm_source") || "",
          utm_medium: params.get("utm_medium") || "",
          utm_campaign: params.get("utm_campaign") || "",
        }),
      });
      persisted = res.ok;
    } catch (_) {
      // Falha silenciosa — não bloqueia o usuário
    } finally {
      setLoading(false);
      // Sprint 3.8: dispara Lead apenas se persistência confirmada
      if (persisted) trackLandingLead(source);
      // Sempre abre o WhatsApp
      openWhatsApp(ctaName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md mx-auto">
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      <input
        type="text"
        placeholder="Seu nome completo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-vinho-400 shadow-sm"
      />
      <input
        type="tel"
        placeholder="WhatsApp com DDD (ex: 38 99999-9999)"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        required
        className="w-full px-4 py-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-vinho-400 shadow-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-3 font-bold text-lg py-4 px-8 rounded-xl transition-all shadow-xl disabled:opacity-70 ${buttonClass}`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="w-6 h-6 flex-shrink-0">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        )}
        <span>{buttonLabel}</span>
      </button>
      <p className="text-center text-xs text-gray-400 mt-1">
        🔒 Seus dados são protegidos. Não enviamos spam.
      </p>
    </form>
  );
};

export default LandingCapture;

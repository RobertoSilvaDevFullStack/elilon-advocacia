import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SEO } from "../components/SEO";
import { getApiBaseUrl } from "../utils/api";
import { formatPriceBRL, REGIME_LABELS, type RegimeTributario } from "../utils/diagnosticoPricing";
import {
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCw,
  Shield,
  Building2,
  User,
  Wallet,
} from "lucide-react";

const API_URL = getApiBaseUrl();
const POLL_INTERVAL_MS = 5000;
const MAX_RETRIES = 3;

interface Pedido {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
  regime_tributario: RegimeTributario;
  valor: number;
  status_pagamento: string;
  payment_method: string;
  payment_link: string | null;
  paid_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-neutral-100 text-neutral-600" },
  aguardando_pagamento: { label: "Aguardando pagamento", color: "bg-amber-100 text-amber-700" },
  pago: { label: "Pago", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  expirado: { label: "Expirado", color: "bg-red-100 text-red-700" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de Crédito",
};

function PedidoSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-neutral-200 rounded-lg w-2/3" />
      <div className="h-4 bg-neutral-100 rounded w-full" />
      <div className="h-4 bg-neutral-100 rounded w-5/6" />
      <div className="h-24 bg-neutral-100 rounded-xl" />
      <div className="h-12 bg-neutral-200 rounded-xl" />
    </div>
  );
}

export const DiagnosticoPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get("token");
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);

  const fetchPedido = useCallback(async () => {
    if (!id || !accessToken) {
      setError("Link de pagamento inválido ou incompleto.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `${API_URL}/diagnostico/pedido/${id}?token=${encodeURIComponent(accessToken)}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Pedido não encontrado");
      }
      setPedido(data.data);
      setError(null);
      retryCount.current = 0;

      if (data.data.status_pagamento === "pago") {
        navigate(`/diagnostico/sucesso?email=${encodeURIComponent(data.data.email)}`, { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar pedido";
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current += 1;
        setTimeout(fetchPedido, 1500 * retryCount.current);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id, accessToken, navigate]);

  useEffect(() => {
    fetchPedido();
  }, [fetchPedido]);

  useEffect(() => {
    if (!pedido || pedido.status_pagamento === "pago") return;
    const interval = setInterval(fetchPedido, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pedido, fetchPedido]);

  const statusInfo = pedido ? STATUS_LABELS[pedido.status_pagamento] || STATUS_LABELS.pendente : null;

  return (
    <Layout>
      <SEO
        title="Pagamento — Diagnóstico Tributário Premium"
        description="Finalize o pagamento da sua análise tributária personalizada."
      />

      <section className="pt-32 pb-16 bg-neutral-50 min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-vinho-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-vinho-600" />
              </div>
              <div>
                <h1 className="text-xl font-headline font-bold text-neutral-900">
                  Pagamento do Diagnóstico
                </h1>
                <p className="text-sm text-neutral-500">Resumo do seu pedido</p>
              </div>
            </div>

            {loading && !pedido && <PedidoSkeleton />}

            {error && !pedido && (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-neutral-600 mb-4">{error}</p>
                <button
                  onClick={() => { setLoading(true); setError(null); retryCount.current = 0; fetchPedido(); }}
                  className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 bg-vinho-600 text-white rounded-xl text-sm font-semibold hover:bg-vinho-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
              </div>
            )}

            {pedido && (
              <div className="space-y-5">
                <div className="rounded-xl border border-neutral-100 divide-y divide-neutral-100">
                  <div className="flex items-center gap-3 p-4">
                    <User className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide">Cliente</p>
                      <p className="font-medium text-neutral-800">{pedido.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide">Empresa</p>
                      <p className="font-medium text-neutral-800">{pedido.empresa}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide">Regime</p>
                      <p className="font-medium text-neutral-800">
                        {REGIME_LABELS[pedido.regime_tributario] || pedido.regime_tributario}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <CreditCard className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide">Método</p>
                      <p className="font-medium text-neutral-800">
                        {PAYMENT_METHOD_LABELS[pedido.payment_method] || pedido.payment_method}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-vinho-50 rounded-xl p-5 border border-vinho-100 text-center">
                  <p className="text-sm text-vinho-700 mb-1">Valor total</p>
                  <p className="text-3xl font-headline font-bold text-vinho-800">
                    {formatPriceBRL(Number(pedido.valor))}
                  </p>
                </div>

                {statusInfo && (
                  <div className="flex justify-center">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                )}

                {pedido.payment_link && pedido.status_pagamento !== "pago" && (
                  <a
                    href={pedido.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full min-h-[44px] py-4 bg-gradient-to-r from-vinho-600 to-vermelho-600 text-white font-semibold text-sm uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-vinho-500/30 transition-all"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pagar Agora
                  </a>
                )}

                {pedido.status_pagamento === "pago" && (
                  <Link
                    to={`/diagnostico/sucesso?email=${encodeURIComponent(pedido.email)}`}
                    className="flex items-center justify-center gap-2 w-full min-h-[44px] py-4 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-all"
                  >
                    Ver confirmação
                  </Link>
                )}

                <p className="text-xs text-neutral-400 text-center flex items-center justify-center gap-1">
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Pagamento processado com segurança via ASAAS
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DiagnosticoPagamento;

/**
 * DiagnosticoPremiumAdminView
 * Sprint 3.11: Dashboard de pedidos premium do Diagnóstico Tributário
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { getApiBaseUrl } from "../utils/api";
import { REGIME_LABELS, formatPriceBRL, type RegimeTributario } from "../utils/diagnosticoPricing";

const API_URL = getApiBaseUrl();

interface Pedido {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  regime_tributario: RegimeTributario;
  valor: number;
  status_pagamento: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
}

interface Stats {
  total_pedidos: number;
  receita_total: number;
  pagamentos_pendentes: number;
  pagamentos_confirmados: number;
  taxa_conversao: string;
}

interface Filters {
  search: string;
  status_pagamento: string;
  regime_tributario: string;
  dataInicio: string;
  dataFim: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-neutral-100 text-neutral-600" },
  aguardando_pagamento: { label: "Aguardando", color: "bg-amber-100 text-amber-700" },
  pago: { label: "Pago", color: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  expirado: { label: "Expirado", color: "bg-red-100 text-red-700" },
};

const DiagnosticoPremiumAdminView: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "", status_pagamento: "", regime_tributario: "", dataInicio: "", dataFim: "",
  });
  const [activeFilters, setActiveFilters] = useState<Filters>({ ...filters });

  const token = localStorage.getItem("token");

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/diagnostico/pedidos/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Erro ao buscar stats premium", err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const fetchPedidos = useCallback(async (page = 1, f: Filters = activeFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (f.search) params.set("search", f.search);
      if (f.status_pagamento) params.set("status_pagamento", f.status_pagamento);
      if (f.regime_tributario) params.set("regime_tributario", f.regime_tributario);
      if (f.dataInicio) params.set("dataInicio", f.dataInicio);
      if (f.dataFim) params.set("dataFim", f.dataFim);

      const res = await fetch(`${API_URL}/admin/diagnostico/pedidos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPedidos(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos", err);
    } finally {
      setLoading(false);
    }
  }, [token, activeFilters]);

  useEffect(() => {
    fetchStats();
    fetchPedidos(1);
  }, [fetchStats, fetchPedidos]);

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    fetchPedidos(1, filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const empty = { search: "", status_pagamento: "", regime_tributario: "", dataInicio: "", dataFim: "" };
    setFilters(empty);
    setActiveFilters(empty);
    fetchPedidos(1, empty);
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (activeFilters.search) params.set("search", activeFilters.search);
    if (activeFilters.status_pagamento) params.set("status_pagamento", activeFilters.status_pagamento);
    if (activeFilters.regime_tributario) params.set("regime_tributario", activeFilters.regime_tributario);
    if (activeFilters.dataInicio) params.set("dataInicio", activeFilters.dataInicio);
    if (activeFilters.dataFim) params.set("dataFim", activeFilters.dataFim);

    try {
      const res = await fetch(`${API_URL}/admin/diagnostico/pedidos/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Falha ao exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diagnostico-premium-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar CSV", err);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Diagnóstico Tributário Premium</h2>
          <p className="text-sm text-neutral-500">Pedidos pagos via ASAAS</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchStats(); fetchPedidos(pagination.page); }}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-vinho-600 text-white rounded-lg hover:bg-vinho-700"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total de Pedidos", value: stats?.total_pedidos ?? "—", icon: ShoppingBag, color: "text-blue-600" },
          { label: "Receita Total", value: stats ? formatPriceBRL(stats.receita_total) : "—", icon: DollarSign, color: "text-green-600" },
          { label: "Pendentes", value: stats?.pagamentos_pendentes ?? "—", icon: Clock, color: "text-amber-600" },
          { label: "Confirmados", value: stats?.pagamentos_confirmados ?? "—", icon: CheckCircle, color: "text-green-600" },
          { label: "Taxa Conversão", value: stats ? `${stats.taxa_conversao}%` : "—", icon: TrendingUp, color: "text-vinho-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-neutral-500 uppercase tracking-wide">{card.label}</span>
            </div>
            {statsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
            ) : (
              <p className="text-xl font-bold text-neutral-800">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar cliente, empresa ou e-mail..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-vinho-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2.5 bg-vinho-600 text-white rounded-lg text-sm hover:bg-vinho-700"
          >
            Buscar
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filters.status_pagamento}
              onChange={(e) => setFilters((p) => ({ ...p, status_pagamento: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filters.regime_tributario}
              onChange={(e) => setFilters((p) => ({ ...p, regime_tributario: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            >
              <option value="">Todos os regimes</option>
              {Object.entries(REGIME_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => setFilters((p) => ({ ...p, dataInicio: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            />
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => setFilters((p) => ({ ...p, dataFim: e.target.value }))}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
            />
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
              <X className="w-4 h-4" /> Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-vinho-500" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-16 text-neutral-400 text-sm">Nenhum pedido encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Empresa</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Regime</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {pedidos.map((p) => {
                  const st = STATUS_LABELS[p.status_pagamento] || STATUS_LABELS.pendente;
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-800">{p.nome}</p>
                        <p className="text-xs text-neutral-400">{p.email}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{p.empresa || "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {REGIME_LABELS[p.regime_tributario] || p.regime_tributario}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-800">
                        {formatPriceBRL(Number(p.valor))}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">{formatDate(p.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-neutral-100">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => fetchPedidos(pg)}
                className={`w-8 h-8 rounded-lg text-sm ${
                  pg === pagination.page ? "bg-vinho-600 text-white" : "border border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {pg}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticoPremiumAdminView;

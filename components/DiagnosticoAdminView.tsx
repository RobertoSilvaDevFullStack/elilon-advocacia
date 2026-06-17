/**
 * DiagnosticoAdminView
 * Sprint 3.6: Dashboard e gestão de leads do Diagnóstico Tributário
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCheck,
  Search,
  Filter,
  Eye,
  ChevronDown,
  X,
  RefreshCw,
  Download,
  Calendar,
  Building2,
  Phone,
  Mail,
  BarChart2,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { getApiBaseUrl } from "../utils/api";

const API_URL = getApiBaseUrl();

// ─── Types ───────────────────────────────────────────────────────────────────

interface DiagnosticoLead {
  id: number;
  nome: string;
  empresa: string | null;
  email: string | null;
  whatsapp: string | null;
  respostas: Record<string, string>;
  score: number;
  nivel_risco: "alto" | "medio" | "baixo";
  origem: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
  responsavel: string | null;
  notas: string | null;
  webhook_enviado: boolean;
  created_at: string;
}

interface Stats {
  total: number;
  hoje: number;
  alto_risco: number;
  medio_risco: number;
  baixo_risco: number;
  conversoes: number;
  taxa_conversao: string;
  por_dia: { dia: string; total: number }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  search: string;
  nivel_risco: string;
  status: string;
  empresa: string;
  responsavel: string;
  dataInicio: string;
  dataFim: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  novo:        { label: "Novo",        color: "bg-blue-100 text-blue-700" },
  em_contato:  { label: "Em contato",  color: "bg-amber-100 text-amber-700" },
  convertido:  { label: "Convertido",  color: "bg-green-100 text-green-700" },
  descartado:  { label: "Descartado",  color: "bg-neutral-100 text-neutral-500" },
};

const RISCO_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  alto:  { label: "Alto",  color: "bg-red-100 text-red-700",    icon: <AlertTriangle className="w-3 h-3" /> },
  medio: { label: "Médio", color: "bg-amber-100 text-amber-700", icon: <AlertCircle className="w-3 h-3" /> },
  baixo: { label: "Baixo", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

const DiagnosticoAdminView: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<DiagnosticoLead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DiagnosticoLead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editResponsavel, setEditResponsavel] = useState("");
  const [editNotas, setEditNotas] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "", nivel_risco: "", status: "", empresa: "", responsavel: "", dataInicio: "", dataFim: "",
  });
  const [activeFilters, setActiveFilters] = useState<Filters>({ ...filters });

  const token = localStorage.getItem("token");

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/diagnostico/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Erro ao buscar stats diagnóstico", err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  // ── Fetch leads ────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = 1, f: Filters = activeFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (f.search)       params.set("search", f.search);
      if (f.nivel_risco)  params.set("nivel_risco", f.nivel_risco);
      if (f.status)       params.set("status", f.status);
      if (f.empresa)      params.set("empresa", f.empresa);
      if (f.responsavel)  params.set("responsavel", f.responsavel);
      if (f.dataInicio)   params.set("dataInicio", f.dataInicio);
      if (f.dataFim)      params.set("dataFim", f.dataFim);

      const res = await fetch(`${API_URL}/admin/diagnostico?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Erro ao buscar leads diagnóstico", err);
    } finally {
      setLoading(false);
    }
  }, [token, activeFilters]);

  useEffect(() => {
    fetchStats();
    fetchLeads(1);
  }, []);

  // ── Apply filters ──────────────────────────────────────────────────────────
  const applyFilters = () => {
    setActiveFilters({ ...filters });
    fetchLeads(1, filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const empty: Filters = { search: "", nivel_risco: "", status: "", empresa: "", responsavel: "", dataInicio: "", dataFim: "" };
    setFilters(empty);
    setActiveFilters(empty);
    fetchLeads(1, empty);
    setShowFilters(false);
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  // ── Open lead modal ────────────────────────────────────────────────────────
  const openLead = async (lead: DiagnosticoLead) => {
    const res = await fetch(`${API_URL}/admin/diagnostico/${lead.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const full: DiagnosticoLead = data.success ? data.data : lead;
    setSelectedLead(full);
    setEditStatus(full.status);
    setEditResponsavel(full.responsavel || "");
    setEditNotas(full.notas || "");
    setShowModal(true);
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_URL}/admin/diagnostico/${selectedLead.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: editStatus, responsavel: editResponsavel, notas: editNotas }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedLead(data.data);
        setLeads((prev) => prev.map((l) => (l.id === data.data.id ? data.data : l)));
        fetchStats();
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["ID","Nome","Empresa","Email","WhatsApp","Risco","Score","Status","Responsável","Origem","Criado em"];
    const rows = leads.map((l) => [
      l.id, l.nome, l.empresa || "", l.email || "", l.whatsapp || "",
      l.nivel_risco, l.score, l.status, l.responsavel || "", l.origem,
      new Date(l.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostico-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Diagnóstico Tributário</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Leads captados pelo quiz da Reforma Tributária</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchStats(); fetchLeads(pagination.page); }}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-neutral-200 rounded hover:bg-neutral-50 transition-colors text-neutral-600"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex items-center gap-2 text-neutral-400 text-sm mb-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando estatísticas...
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total",        value: stats.total,       color: "border-vinho-500",  icon: <BarChart2 className="w-4 h-4 text-vinho-500" /> },
            { label: "Hoje",         value: stats.hoje,        color: "border-blue-500",   icon: <Calendar className="w-4 h-4 text-blue-500" /> },
            { label: "Alto Risco",   value: stats.alto_risco,  color: "border-red-500",    icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
            { label: "Médio Risco",  value: stats.medio_risco, color: "border-amber-500",  icon: <AlertCircle className="w-4 h-4 text-amber-500" /> },
            { label: "Baixo Risco",  value: stats.baixo_risco, color: "border-green-500",  icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
            { label: "Conversões",   value: `${stats.conversoes} (${stats.taxa_conversao}%)`, color: "border-teal-500", icon: <TrendingUp className="w-4 h-4 text-teal-500" /> },
          ].map((card) => (
            <div key={card.label} className={`bg-white rounded shadow p-4 border-l-4 ${card.color}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {card.icon}
                <span className="text-xs text-neutral-500 uppercase font-bold tracking-wide">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-neutral-800">{card.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Search + Filters bar */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email, empresa, WhatsApp..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded text-sm focus:outline-none focus:border-vinho-400"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded transition-colors ${
              activeFilterCount > 0
                ? "border-vinho-400 text-vinho-600 bg-vinho-50"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-vinho-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-vinho-600 text-white text-sm rounded hover:bg-vinho-700 transition-colors"
          >
            Buscar
          </button>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Nível de Risco</label>
              <select
                value={filters.nivel_risco}
                onChange={(e) => setFilters((f) => ({ ...f, nivel_risco: e.target.value }))}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
              >
                <option value="">Todos</option>
                <option value="alto">Alto</option>
                <option value="medio">Médio</option>
                <option value="baixo">Baixo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
              >
                <option value="">Todos</option>
                <option value="novo">Novo</option>
                <option value="em_contato">Em contato</option>
                <option value="convertido">Convertido</option>
                <option value="descartado">Descartado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Empresa</label>
              <input
                type="text"
                placeholder="Filtrar por empresa"
                value={filters.empresa}
                onChange={(e) => setFilters((f) => ({ ...f, empresa: e.target.value }))}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Responsável</label>
              <input
                type="text"
                placeholder="Filtrar por responsável"
                value={filters.responsavel}
                onChange={(e) => setFilters((f) => ({ ...f, responsavel: e.target.value }))}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Início</label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters((f) => ({ ...f, dataInicio: e.target.value }))}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Data Fim</label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters((f) => ({ ...f, dataFim: e.target.value }))}
                className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
              />
            </div>
            <div className="col-span-full flex gap-2 pt-1">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-vinho-600 text-white text-sm rounded hover:bg-vinho-700 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-neutral-200 text-neutral-600 text-sm rounded hover:bg-neutral-50 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum lead encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Risco</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Responsável</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {leads.map((lead) => {
                  const risco = RISCO_LABELS[lead.nivel_risco];
                  const status = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "bg-neutral-100 text-neutral-600" };
                  return (
                    <tr key={lead.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-800">{lead.nome}</p>
                        {lead.email && <p className="text-xs text-neutral-400">{lead.email}</p>}
                        {lead.whatsapp && <p className="text-xs text-neutral-400">{lead.whatsapp}</p>}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{lead.empresa || <span className="text-neutral-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${risco.color}`}>
                          {risco.icon} {risco.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-700">{lead.score}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs">{lead.responsavel || <span className="text-neutral-300">—</span>}</td>
                      <td className="px-4 py-3 text-neutral-400 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        <br />
                        {new Date(lead.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openLead(lead)}
                          className="p-1.5 text-neutral-400 hover:text-vinho-600 hover:bg-vinho-50 rounded transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              {pagination.total} leads · página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLeads(pagination.page - 1)}
                className="px-3 py-1 text-xs border border-neutral-200 rounded disabled:opacity-40 hover:bg-neutral-50 transition-colors"
              >
                ← Anterior
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLeads(pagination.page + 1)}
                className="px-3 py-1 text-xs border border-neutral-200 rounded disabled:opacity-40 hover:bg-neutral-50 transition-colors"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-800">{selectedLead.nome}</h3>
                <p className="text-sm text-neutral-400">Lead #{selectedLead.id} · {new Date(selectedLead.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Risk badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${RISCO_LABELS[selectedLead.nivel_risco].color}`}>
                  {RISCO_LABELS[selectedLead.nivel_risco].icon}
                  Risco {RISCO_LABELS[selectedLead.nivel_risco].label}
                </span>
                <span className="text-sm text-neutral-500">Score: <strong>{selectedLead.score}</strong></span>
                {selectedLead.webhook_enviado && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">✓ Webhook enviado</span>
                )}
              </div>

              {/* Contact info */}
              <div>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Dados de Contato</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: <Building2 className="w-4 h-4" />, label: "Empresa", value: selectedLead.empresa },
                    { icon: <Mail className="w-4 h-4" />,      label: "E-mail",  value: selectedLead.email },
                    { icon: <Phone className="w-4 h-4" />,     label: "WhatsApp", value: selectedLead.whatsapp
                        ? <a href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">{selectedLead.whatsapp}</a>
                        : null
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2 text-sm">
                      <span className="text-neutral-400 mt-0.5">{item.icon}</span>
                      <div>
                        <span className="text-neutral-400 text-xs">{item.label}</span>
                        <p className="text-neutral-700 font-medium">{item.value || <span className="text-neutral-300">—</span>}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-neutral-400 mt-0.5"><CheckCheck className="w-4 h-4" /></span>
                    <div>
                      <span className="text-neutral-400 text-xs">Origem</span>
                      <p className="text-neutral-700 font-medium">{selectedLead.origem}</p>
                      {(selectedLead.utm_source || selectedLead.utm_campaign) && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {[selectedLead.utm_source, selectedLead.utm_medium, selectedLead.utm_campaign].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz answers */}
              {selectedLead.respostas && Object.keys(selectedLead.respostas).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Respostas do Diagnóstico</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedLead.respostas).map(([key, value]) => (
                      <div key={key} className="bg-neutral-50 rounded-lg px-4 py-3 text-sm">
                        <span className="text-neutral-400 text-xs font-medium uppercase tracking-wide">{key.replace(/_/g, " ")}</span>
                        <p className="text-neutral-700 mt-0.5">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status management */}
              <div className="border-t border-neutral-100 pt-5">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Gestão do Lead</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
                    >
                      <option value="novo">Novo</option>
                      <option value="em_contato">Em contato</option>
                      <option value="convertido">Convertido</option>
                      <option value="descartado">Descartado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">Responsável</label>
                    <input
                      type="text"
                      value={editResponsavel}
                      onChange={(e) => setEditResponsavel(e.target.value)}
                      placeholder="Nome do responsável"
                      className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Notas internas</label>
                  <textarea
                    value={editNotas}
                    onChange={(e) => setEditNotas(e.target.value)}
                    rows={3}
                    placeholder="Observações, próximos passos..."
                    className="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-vinho-400 resize-none"
                  />
                </div>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="flex items-center gap-2 px-5 py-2.5 bg-vinho-600 text-white text-sm font-semibold rounded hover:bg-vinho-700 transition-colors disabled:opacity-60"
                >
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticoAdminView;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lead, BlogPost, Professional } from "../types";
import { BLOG_POSTS, PROFESSIONALS } from "../constants";
import {
  FileText,
  Users,
  MessageSquare,
  LogOut,
  Search,
  Plus,
  Edit,
  Trash2,
  BarChart2,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "../components/Components";

// TEMPORARY: Hardcoded API URL for production
// Cache buster: 2025-12-17-10:40 UTC-3
const PRODUCTION_API_URL = "https://api.elilonlopesadvogados.com.br/api";
const API_URL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

type ViewState =
  | "dashboard"
  | "leads"
  | "blog"
  | "professionals"
  | "users"
  | "settings";

export const Admin: React.FC = () => {
  // DEBUG: Log API URL to verify correct endpoint
  console.log("🔧 API URL configured:", API_URL);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]); // Should fetch from API
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS); // Fallback to const for now if API fails
  const [professionals, setProfessionals] =
    useState<Professional[]>(PROFESSIONALS); // Fallback
  const [users, setUsers] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");

  // Loading States
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // AUTH LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem("token", data.token); // Store token
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        alert(data.message || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Login failed", error);
      alert(
        "Erro de conexão com o servidor. Verifique se o backend está rodando."
      );
    }
  };

  // FETCH DATA
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Dashboard Stats
      const resStats = await fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataStats = await resStats.json();
      if (dataStats.success) setStats(dataStats.stats);

      // Webhook Settings
      const resSettings = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataSettings = await resSettings.json();
      setWebhookUrl(dataSettings.webhook_url || "");

      // Users
      const resUsers = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataUsers = await resUsers.json();
      setUsers(Array.isArray(dataUsers) ? dataUsers : []);

      // Leads
      const resLeads = await fetch(`${API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataLeads = await resLeads.json();
      if (dataLeads.success) {
        setLeads(dataLeads.leads || []);
      }
    } catch (e) {
      console.error("Error fetching admin data", e);
    }
  };

  const saveWebhook = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });
      alert("Webhook salvo com sucesso!");
    } catch (e) {
      alert("Erro ao salvar webhook");
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchDashboardData();
  }, [isLoggedIn, currentView]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-headline font-bold text-neutral-900">
              Elilon Lopes Advogados
            </h1>
            <p className="text-neutral-500 uppercase tracking-widest text-xs mt-2">
              Área Administrativa
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded focus:border-accent-500 outline-none"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded focus:border-accent-500 outline-none"
            />
            <Button className="w-full justify-center">Entrar</Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-neutral-500 hover:text-accent-600"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const NavButton = ({ view, icon: Icon, label }: any) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
        currentView === view
          ? "bg-accent-600 text-white"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <span className="text-lg font-headline font-bold tracking-widest text-accent-500">
            ADMIN
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton view="dashboard" icon={BarChart2} label="Dashboard" />
          <NavButton view="leads" icon={MessageSquare} label="Leads" />
          <NavButton view="blog" icon={FileText} label="Blog" />
          <NavButton view="professionals" icon={Users} label="Profissionais" />

          <div className="my-4 border-t border-neutral-800"></div>

          <NavButton view="users" icon={Shield} label="Usuários" />
          <NavButton view="settings" icon={Settings} label="Configurações" />
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-neutral-800 rounded transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-neutral-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-headline font-bold text-accent-500">ADMIN</span>
          <button onClick={() => setIsLoggedIn(false)}>
            <LogOut size={20} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {/* DASHBOARD VIEW */}
          {currentView === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                Visão Geral
              </h2>
              {!stats ? (
                <div className="text-neutral-500">
                  Carregando estatísticas... (Verifique se o servidor backend
                  está rodando)
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded shadow border-l-4 border-accent-500">
                    <h3 className="text-neutral-500 text-sm uppercase font-bold">
                      Leads Totais
                    </h3>
                    <p className="text-4xl font-bold text-neutral-800 mt-2">
                      {stats.leads}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-neutral-500 text-sm uppercase font-bold">
                      Artigos Publicados
                    </h3>
                    <p className="text-4xl font-bold text-neutral-800 mt-2">
                      {stats.posts}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-neutral-500 text-sm uppercase font-bold">
                      Profissionais
                    </h3>
                    <p className="text-4xl font-bold text-neutral-800 mt-2">
                      {stats.professionals}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentView === "settings" && (
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                Configurações & Integrações
              </h2>

              <div className="bg-white p-8 rounded shadow mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Settings size={24} className="text-accent-600" />
                  Conexão de Dados (Leads)
                </h3>
                <p className="text-neutral-600 mb-6 text-sm">
                  Configure o <strong>Webhook</strong> para onde os leads devem
                  ser enviados automaticamente após o cadastro no site. Isso
                  permite integração com CRMs como RD Station, HubSpot ou
                  Salesforce.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2 text-neutral-700">
                    URL do Webhook
                  </label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.crm.com/webhook/..."
                    className="w-full border border-neutral-300 p-3 rounded focus:border-accent-500 outline-none"
                  />
                </div>
                <Button onClick={saveWebhook}>Salvar Configuração</Button>
              </div>
            </div>
          )}

          {/* USERS VIEW */}
          {currentView === "users" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Gerenciar Usuários
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    Controle de acesso e hierarquia do painel.
                  </p>
                </div>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setShowUserModal(true);
                  }}
                >
                  <Plus size={16} /> Novo Usuário
                </Button>
              </div>

              <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-100 text-neutral-600 text-sm uppercase">
                    <tr>
                      <th className="p-4 border-b">Usuário</th>
                      <th className="p-4 border-b">Cargo (Hierarquia)</th>
                      <th className="p-4 border-b">Data Criação</th>
                      <th className="p-4 border-b">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user: any) => (
                        <tr
                          key={user.id}
                          className="border-b last:border-0 hover:bg-neutral-50"
                        >
                          <td className="p-4 font-bold">{user.username}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                user.role === "admin" ||
                                user.role === "superadmin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-neutral-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 flex gap-2">
                            <button className="text-blue-600 hover:underline text-xs">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-neutral-500"
                        >
                          Nenhum usuário encontrado (ou erro ao carregar).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LEADS VIEW */}
          {currentView === "leads" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Leads Recebidos
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    Gerencie os contatos recebidos pelo site.
                  </p>
                </div>
                <Button variant="outline" className="text-xs">
                  Exportar CSV
                </Button>
              </div>

              <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-600 text-sm uppercase tracking-wider">
                      <th className="p-4 border-b">Nome</th>
                      <th className="p-4 border-b">Contato</th>
                      <th className="p-4 border-b hidden md:table-cell">
                        Interesse
                      </th>
                      <th className="p-4 border-b">Status</th>
                      <th className="p-4 border-b hidden md:table-cell">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-neutral-700">
                    {leads.length > 0 ? (
                      leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b last:border-0 hover:bg-neutral-50"
                        >
                          <td className="p-4 font-bold">{lead.name}</td>
                          <td className="p-4">
                            <div className="text-xs">
                              <div>{lead.email}</div>
                              <div className="text-neutral-500">
                                {lead.phone}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {lead.area || "Não especificado"}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-bold">
                              {lead.status || "Novo"}
                            </span>
                          </td>
                          <td className="p-4 hidden md:table-cell text-xs text-neutral-500">
                            {new Date(lead.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-neutral-500"
                        >
                          Nenhum lead cadastrado ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BLOG VIEW */}
          {currentView === "blog" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Gerenciar Blog
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    {posts.length} postagens publicadas.
                  </p>
                </div>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setShowPostModal(true);
                  }}
                >
                  <Plus size={16} /> Novo Artigo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded shadow-md overflow-hidden flex flex-col"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {post.date}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <span className="text-xs font-bold text-accent-600 uppercase mb-2">
                        {post.category}
                      </span>
                      <h3 className="font-bold text-lg mb-2 leading-tight">
                        {post.title}
                      </h3>
                      <div className="mt-auto pt-4 flex justify-end gap-2 border-t border-neutral-100">
                        <button
                          className="p-2 text-neutral-500 hover:text-blue-600 transition-colors"
                          title="Editar"
                          onClick={() => {
                            setEditingItem(post);
                            setShowPostModal(true);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-neutral-500 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFESSIONALS VIEW */}
          {currentView === "professionals" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">
                    Equipe
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    {professionals.length} profissionais cadastrados.
                  </p>
                </div>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingItem(null);
                    setShowProfessionalModal(true);
                  }}
                >
                  <Plus size={16} /> Novo Profissional
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {professionals.map((prof) => (
                  <div
                    key={prof.id}
                    className="bg-white rounded shadow-md overflow-hidden flex flex-col text-center"
                  >
                    <div className="h-48 overflow-hidden mx-auto w-full">
                      <img
                        src={prof.image}
                        alt={prof.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{prof.name}</h3>
                      <p className="text-accent-600 text-xs uppercase font-bold mb-1">
                        {prof.role}
                      </p>
                      <p className="text-neutral-500 text-xs mb-4">
                        {prof.area}
                      </p>

                      <div className="flex justify-center gap-3">
                        <button className="text-xs border border-neutral-200 px-3 py-1 rounded hover:bg-neutral-50 transition">
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL PLACEHOLDERS */}
        {showPostModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPostModal(false)}
          >
            <div
              className="bg-white p-8 rounded-lg max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? "Editar Artigo" : "Novo Artigo"}
              </h2>
              <p className="text-neutral-600 mb-4">
                Formulário de {editingItem ? "edição" : "criação"} será
                implementado aqui.
              </p>
              <button
                className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700"
                onClick={() => setShowPostModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {showProfessionalModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowProfessionalModal(false)}
          >
            <div
              className="bg-white p-8 rounded-lg max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? "Editar Profissional" : "Novo Profissional"}
              </h2>
              <p className="text-neutral-600 mb-4">
                Formulário de {editingItem ? "edição" : "criação"} será
                implementado aqui.
              </p>
              <button
                className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700"
                onClick={() => setShowProfessionalModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {showUserModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowUserModal(false)}
          >
            <div
              className="bg-white p-8 rounded-lg max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <p className="text-neutral-600 mb-4">
                Formulário de {editingItem ? "edição" : "criação"} será
                implementado aqui.
              </p>
              <button
                className="bg-accent-600 text-white px-4 py-2 rounded hover:bg-accent-700"
                onClick={() => setShowUserModal(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

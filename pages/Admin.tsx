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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]); // Load from API
  const [professionals, setProfessionals] = useState<Professional[]>([]); // Load from API
  const [users, setUsers] = useState<any[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");

  // Loading States
  const [loading, setLoading] = useState(false);

  // Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [postForm, setPostForm] = useState({
    title: "",
    category: "",
    slug: "",
    image: "",
    excerpt: "",
    content: "",
  });
  const [professionalForm, setProfessionalForm] = useState({
    name: "",
    role: "",
    oab: "",
    area: "",
    bio: "",
    image: "",
    email: "",
    linkedin: "",
    phone: "",
  });
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "editor",
  });

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

  // FORM HANDLERS
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Não autenticado");

    setLoading(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem
        ? `${API_URL}/posts/${editingItem.id}`
        : `${API_URL}/posts`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(editingItem ? "Post atualizado!" : "Post criado!");
        setShowPostModal(false);
        setPostForm({
          title: "",
          category: "",
          slug: "",
          image: "",
          excerpt: "",
          content: "",
        });
        fetchDashboardData();
      } else {
        alert(data.message || "Erro ao salvar post");
      }
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Não autenticado");

    setLoading(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem
        ? `${API_URL}/professionals/${editingItem.id}`
        : `${API_URL}/professionals`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(professionalForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(
          editingItem ? "Profissional atualizado!" : "Profissional criado!"
        );
        setShowProfessionalModal(false);
        setProfessionalForm({
          name: "",
          role: "",
          oab: "",
          area: "",
          bio: "",
          image: "",
          email: "",
          linkedin: "",
          phone: "",
        });
        fetchDashboardData();
      } else {
        alert(data.message || "Erro ao salvar profissional");
      }
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Não autenticado");

    setLoading(true);
    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem
        ? `${API_URL}/users/${editingItem.id}`
        : `${API_URL}/users`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userForm),
      });

      const data = await response.json();
      if (data.success) {
        alert(editingItem ? "Usuário atualizado!" : "Usuário criado!");
        setShowUserModal(false);
        setUserForm({ username: "", password: "", role: "editor" });
        fetchDashboardData();
      } else {
        alert(data.message || "Erro ao salvar usuário");
      }
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
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

      // Professionals
      const resProfessionals = await fetch(`${API_URL}/professionals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataProfessionals = await resProfessionals.json();
      console.log("📋 Professionals API Response:", dataProfessionals);
      if (Array.isArray(dataProfessionals)) {
        setProfessionals(dataProfessionals);
        console.log("✅ Professionals loaded:", dataProfessionals);
      }

      // Posts
      const resPosts = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataPosts = await resPosts.json();
      console.log("📋 Posts API Response:", dataPosts);
      if (Array.isArray(dataPosts)) {
        setPosts(dataPosts);
        console.log("✅ Posts loaded:", dataPosts);
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
                        src={
                          prof.image ||
                          "https://via.placeholder.com/300x400?text=Sem+Foto"
                        }
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
                        <button
                          className="text-xs border border-neutral-200 px-3 py-1 rounded hover:bg-neutral-50 transition"
                          onClick={() => {
                            setEditingItem(prof);
                            setProfessionalForm({
                              name: prof.name,
                              role: prof.role,
                              oab: prof.oab || "",
                              area: prof.area,
                              bio: prof.bio || "",
                              image: prof.image || "",
                              email: prof.email || "",
                              phone: prof.phone || "",
                              linkedin: prof.linkedin || "",
                            });
                            setShowProfessionalModal(true);
                          }}
                        >
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

        {/* POST FORM MODAL */}
        {showPostModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPostModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingItem ? "Editar Artigo" : "Novo Artigo"}
                </h2>
                <form onSubmit={handlePostSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={postForm.title}
                      onChange={(e) =>
                        setPostForm({ ...postForm, title: e.target.value })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Categoria *
                    </label>
                    <select
                      required
                      value={postForm.category}
                      onChange={(e) =>
                        setPostForm({ ...postForm, category: e.target.value })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    >
                      <option value="">Selecione...</option>
                      <option value="TRABALHISTA">Trabalhista</option>
                      <option value="TRIBUTÁRIO">Tributário</option>
                      <option value="AGRONEGÓCIO">Agronegócio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={(e) =>
                        setPostForm({ ...postForm, slug: e.target.value })
                      }
                      placeholder="auto-gerado do título"
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL da Imagem
                    </label>
                    <input
                      type="url"
                      value={postForm.image}
                      onChange={(e) =>
                        setPostForm({ ...postForm, image: e.target.value })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Resumo
                    </label>
                    <textarea
                      value={postForm.excerpt}
                      onChange={(e) =>
                        setPostForm({ ...postForm, excerpt: e.target.value })
                      }
                      rows={2}
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Conteúdo *
                    </label>
                    <textarea
                      required
                      value={postForm.content}
                      onChange={(e) =>
                        setPostForm({ ...postForm, content: e.target.value })
                      }
                      rows={6}
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    ></textarea>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-accent-600 text-white py-2 rounded hover:bg-accent-700 disabled:opacity-50"
                    >
                      {loading ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-6 border border-neutral-300 rounded hover:bg-neutral-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showProfessionalModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProfessionalModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingItem ? "Editar Profissional" : "Novo Profissional"}
                </h2>
                <form onSubmit={handleProfessionalSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={professionalForm.name}
                        onChange={(e) =>
                          setProfessionalForm({
                            ...professionalForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full border border-neutral-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cargo *
                      </label>
                      <input
                        type="text"
                        required
                        value={professionalForm.role}
                        onChange={(e) =>
                          setProfessionalForm({
                            ...professionalForm,
                            role: e.target.value,
                          })
                        }
                        className="w-full border border-neutral-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        OAB
                      </label>
                      <input
                        type="text"
                        value={professionalForm.oab}
                        onChange={(e) =>
                          setProfessionalForm({
                            ...professionalForm,
                            oab: e.target.value,
                          })
                        }
                        className="w-full border border-neutral-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Área
                      </label>
                      <input
                        type="text"
                        value={professionalForm.area}
                        onChange={(e) =>
                          setProfessionalForm({
                            ...professionalForm,
                            area: e.target.value,
                          })
                        }
                        className="w-full border border-neutral-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <textarea
                      value={professionalForm.bio}
                      onChange={(e) =>
                        setProfessionalForm({
                          ...professionalForm,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Foto do Profissional
                    </label>

                    {/* Preview da imagem */}
                    {professionalForm.image && (
                      <div className="mb-3 flex justify-center">
                        <img
                          src={professionalForm.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded border-2 border-neutral-300"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {/* Botão para upload local */}
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full bg-primary-600 text-white text-center px-4 py-2 rounded hover:bg-primary-700 transition text-sm font-medium">
                          📤 Upload Local
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Criar preview e redimensionar
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                // Redimensionar para 400x400
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d");

                                const size = 400;
                                canvas.width = size;
                                canvas.height = size;

                                // Calcular crop para manter proporção
                                const scale = Math.max(
                                  size / img.width,
                                  size / img.height
                                );
                                const x = size / 2 - (img.width / 2) * scale;
                                const y = size / 2 - (img.height / 2) * scale;

                                ctx?.drawImage(
                                  img,
                                  x,
                                  y,
                                  img.width * scale,
                                  img.height * scale
                                );

                                // Converter para base64
                                const resizedBase64 = canvas.toDataURL(
                                  "image/jpeg",
                                  0.85
                                );

                                setProfessionalForm({
                                  ...professionalForm,
                                  image: resizedBase64,
                                });
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      {/* Botão para URL externa */}
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt("Cole a URL da imagem:");
                          if (url) {
                            setProfessionalForm({
                              ...professionalForm,
                              image: url,
                            });
                          }
                        }}
                        className="flex-1 bg-neutral-200 text-neutral-700 px-4 py-2 rounded hover:bg-neutral-300 transition text-sm font-medium"
                      >
                        🔗 URL Externa
                      </button>
                    </div>

                    {/* Input manual (opcional) */}
                    <input
                      type="text"
                      value={professionalForm.image}
                      onChange={(e) =>
                        setProfessionalForm({
                          ...professionalForm,
                          image: e.target.value,
                        })
                      }
                      placeholder="Ou cole a URL/Base64 manualmente"
                      className="w-full border border-neutral-300 rounded px-3 py-2 mt-2 text-xs text-neutral-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={professionalForm.email}
                        onChange={(e) =>
                          setProfessionalForm({
                            ...professionalForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full border border-neutral-300 rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={professionalForm.phone}
                        onChange={(e) =>
                          setProfessionalForm({
                            ...professionalForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border border-neutral-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={professionalForm.linkedin}
                      onChange={(e) =>
                        setProfessionalForm({
                          ...professionalForm,
                          linkedin: e.target.value,
                        })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-accent-600 text-white py-2 rounded hover:bg-accent-700 disabled:opacity-50"
                    >
                      {loading ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProfessionalModal(false)}
                      className="px-6 border border-neutral-300 rounded hover:bg-neutral-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showUserModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingItem ? "Editar Usuário" : "Novo Usuário"}
                </h2>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) =>
                        setUserForm({ ...userForm, username: e.target.value })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Role *
                    </label>
                    <select
                      required
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({ ...userForm, role: e.target.value })
                      }
                      className="w-full border border-neutral-300 rounded px-3 py-2"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-accent-600 text-white py-2 rounded hover:bg-accent-700 disabled:opacity-50"
                    >
                      {loading ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserModal(false)}
                      className="px-6 border border-neutral-300 rounded hover:bg-neutral-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

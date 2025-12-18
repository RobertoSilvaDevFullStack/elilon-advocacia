import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.elilonlopesadvogados.com.br/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return alert("As senhas não coincidem");
    }

    if (newPassword.length < 6) {
      return alert("A senha deve ter pelo menos 6 caracteres");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Senha alterada com sucesso! Faça login com sua nova senha.");
        navigate("/admin");
      } else {
        alert(data.message || "Erro ao resetar senha");
      }
    } catch (err) {
      alert("Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Token Inválido
          </h1>
          <p className="text-neutral-600 mb-6">
            O link de recuperação de senha é inválido ou expirou.
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="bg-accent-600 text-white px-6 py-2 rounded hover:bg-accent-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-neutral-900">
            Elilon Lopes Advogados
          </h1>
          <p className="text-neutral-500 uppercase tracking-widest text-xs mt-2">
            Redefinir Senha
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-neutral-300 p-3 rounded focus:border-accent-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-neutral-300 p-3 rounded focus:border-accent-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-600 text-white py-3 rounded hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Processando..." : "Redefinir Senha"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-neutral-500 hover:text-accent-600"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}

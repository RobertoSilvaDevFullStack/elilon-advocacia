import React, { useState } from 'react';
import { Lead } from '../types';
import { Button } from '../components/Components';
import { Link } from 'react-router-dom';

// Mock Leads
const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', phone: '(38) 9999-9999', city: 'Montes Claros', interest: 'Empresarial', message: 'Gostaria de agendar uma reunião.', timestamp: '2023-10-25 10:00', status: 'Novo' },
  { id: '2', name: 'Maria Souza', email: 'maria@gmail.com', phone: '(31) 8888-8888', city: 'Belo Horizonte', interest: 'Trabalhista', message: 'Dúvida sobre processo.', timestamp: '2023-10-24 15:30', status: 'Em contato' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@tech.com', phone: '(11) 7777-7777', city: 'São Paulo', interest: 'Digital', message: 'Adequação LGPD.', timestamp: '2023-10-23 09:15', status: 'Arquivado' },
];

export const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
    } else {
      alert('Credenciais inválidas (use admin/admin)');
    }
  };

  const exportCSV = () => {
    const headers = "ID,Nome,Email,Telefone,Cidade,Interesse,Status,Data\n";
    const rows = leads.map(l => `${l.id},"${l.name}",${l.email},${l.phone},${l.city},${l.interest},${l.status},${l.timestamp}`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_eladv.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-neutral-900">ELADV</h1>
            <p className="text-neutral-500 uppercase tracking-widest text-xs mt-2">Área Administrativa</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Usuário" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded focus:border-gold-500 outline-none" 
            />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-neutral-300 p-3 rounded focus:border-gold-500 outline-none" 
            />
            <Button className="w-full justify-center">Entrar</Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-neutral-500 hover:text-gold-600">Voltar ao site</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <header className="bg-neutral-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-serif font-bold">ELADV Dashboard</h1>
        <div className="flex gap-4">
            <span className="text-sm self-center">Bem-vindo, Admin</span>
            <button onClick={() => setIsLoggedIn(false)} className="text-xs uppercase font-bold text-gold-500 border border-gold-500 px-3 py-1 hover:bg-gold-500 hover:text-white transition">Sair</button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800">Leads Recebidos</h2>
          <div className="space-x-4">
             <Button variant="outline" onClick={exportCSV} className="text-xs">Exportar CSV</Button>
          </div>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-100 text-neutral-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b">Nome</th>
                <th className="p-4 border-b">Contato</th>
                <th className="p-4 border-b">Interesse</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Data</th>
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-700">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-neutral-50 border-b last:border-0">
                  <td className="p-4 font-bold">{lead.name}<br/><span className="font-normal text-xs text-neutral-400">{lead.city}</span></td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span>{lead.email}</span>
                      <span className="text-xs text-neutral-500">{lead.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">{lead.interest}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      lead.status === 'Novo' ? 'bg-green-100 text-green-800' : 
                      lead.status === 'Em contato' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">{lead.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-white rounded shadow border-l-4 border-blue-500">
           <h3 className="font-bold mb-2">Configuração de Integração (API/Webhook)</h3>
           <p className="text-sm text-neutral-600 mb-4">
             Para integrar com CRMs externos (Salesforce, RD Station), configure o endpoint do webhook abaixo.
           </p>
           <div className="flex gap-2">
             <input type="text" placeholder="https://api.seucrm.com/webhook" className="flex-1 border p-2 rounded text-sm" />
             <Button variant="primary" className="py-2 text-xs">Salvar Webhook</Button>
           </div>
        </div>
      </main>
    </div>
  );
};
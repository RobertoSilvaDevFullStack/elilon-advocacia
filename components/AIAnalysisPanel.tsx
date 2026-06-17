/**
 * Sprint 3.5 - Hermes Analysis Engine
 * Componente de exibição da Análise Inteligente no Dashboard
 * 
 * Exibe:
 * - Urgência
 * - Complexidade
 * - Área Confirmada
 * - Subárea Confirmada
 * - Resumo Executivo
 * - Entidades Detectadas
 * - Observações
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  FileText,
  Users,
  Calendar,
  DollarSign,
  Sparkles,
  Loader2,
  BarChart3,
  Activity
} from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_URL = getApiBaseUrl();

interface AIAnalysis {
  id: number;
  pre_atendimento_id: number;
  urgencia: 'baixa' | 'media' | 'alta';
  complexidade: 'baixa' | 'media' | 'alta';
  area_confirmada: string;
  subarea_confirmada: string;
  resumo_executivo: string;
  entidades_detectadas: {
    partes?: string[];
    documentos_relevantes?: string[];
    prazos_potenciais?: string[];
    valores_mencionados?: string[];
  };
  observacoes: string;
  status_analise: 'pendente' | 'processando' | 'concluida' | 'falha';
  tempo_processamento_ms: number;
  modelo_ia: string;
  created_at: string;
  updated_at: string;
}

interface AIAnalysisPanelProps {
  preAtendimentoId: number;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ preAtendimentoId }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);

  // Buscar análise ao montar componente
  useEffect(() => {
    fetchAnalysis();
  }, [preAtendimentoId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/admin/chat/analysis/${preAtendimentoId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 404) {
        // Análise ainda não existe - pode estar pendente
        setAnalysis(null);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar análise');
      }

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async () => {
    try {
      setReprocessing(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/admin/chat/analysis/${preAtendimentoId}/reprocess`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao reprocessar análise');
      }

      // Aguardar um pouco e recarregar
      await new Promise(r => setTimeout(r, 2000));
      await fetchAnalysis();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reprocessar');
    } finally {
      setReprocessing(false);
    }
  };

  // Cores para badges de urgência
  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Cores para badges de complexidade
  const getComplexidadeColor = (complexidade: string) => {
    switch (complexidade) {
      case 'alta': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'media': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'baixa': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Ícones para status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processando': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'falha': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Badge de status
  const getStatusBadge = (status: string) => {
    const labels = {
      pendente: 'Pendente',
      processando: 'Processando',
      concluida: 'Concluída',
      falha: 'Falha'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">🤖 Análise Inteligente</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Carregando análise...</span>
        </div>
      </div>
    );
  }

  // Se não existe análise ou está pendente
  if (!analysis || analysis.status_analise === 'pendente') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">🤖 Análise Inteligente</h3>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Análise ainda não processada</p>
          <p className="text-sm text-gray-500">
            A análise será gerada automaticamente em alguns instantes.
          </p>
        </div>
      </div>
    );
  }

  // Se falhou
  if (analysis.status_analise === 'falha') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">🤖 Análise Inteligente</h3>
          </div>
          <button
            onClick={handleReprocess}
            disabled={reprocessing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {reprocessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Reprocessando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </>
            )}
          </button>
        </div>
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 mb-2">Falha ao processar análise</p>
          <p className="text-sm text-red-600">
            {analysis.resumo_executivo || 'Não foi possível gerar a análise automática.'}
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Se está processando
  if (analysis.status_analise === 'processando') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">🤖 Análise Inteligente</h3>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="text-blue-700 mb-2">Análise em andamento...</p>
          <p className="text-sm text-blue-600">
            O Hermes está processando este pré-atendimento.
          </p>
        </div>
      </div>
    );
  }

  // Análise concluída - exibir dados
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">🤖 Análise Inteligente</h3>
            <p className="text-sm text-gray-500">
              Processado em {Math.round(analysis.tempo_processamento_ms / 1000)}s • {analysis.modelo_ia || 'Hermes AI'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIcon(analysis.status_analise)}
          <span className="text-sm font-medium text-gray-600">
            {getStatusBadge(analysis.status_analise)}
          </span>
          <button
            onClick={handleReprocess}
            disabled={reprocessing}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Reprocessar análise"
          >
            <RefreshCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid de classificações */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Urgência */}
        <div className={`p-4 rounded-lg border ${getUrgenciaColor(analysis.urgencia)}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Urgência</span>
          </div>
          <p className="text-lg font-bold capitalize">{analysis.urgencia}</p>
        </div>

        {/* Complexidade */}
        <div className={`p-4 rounded-lg border ${getComplexidadeColor(analysis.complexidade)}`}>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Complexidade</span>
          </div>
          <p className="text-lg font-bold capitalize">{analysis.complexidade}</p>
        </div>

        {/* Área */}
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Área Confirmada</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{analysis.area_confirmada}</p>
        </div>

        {/* Subárea */}
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Subárea</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{analysis.subarea_confirmada}</p>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Resumo Executivo</h4>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{analysis.resumo_executivo}</p>
        </div>
      </div>

      {/* Entidades Detectadas */}
      {analysis.entidades_detectadas && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Entidades Detectadas</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Partes */}
            {analysis.entidades_detectadas.partes && analysis.entidades_detectadas.partes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Partes</p>
                <ul className="space-y-1">
                  {analysis.entidades_detectadas.partes.map((parte, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                      {parte}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documentos Relevantes */}
            {analysis.entidades_detectadas.documentos_relevantes && analysis.entidades_detectadas.documentos_relevantes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Documentos Relevantes</p>
                <ul className="space-y-1">
                  {analysis.entidades_detectadas.documentos_relevantes.map((doc, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prazos Potenciais */}
            {analysis.entidades_detectadas.prazos_potenciais && analysis.entidades_detectadas.prazos_potenciais.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Prazos Potenciais</p>
                <ul className="space-y-1">
                  {analysis.entidades_detectadas.prazos_potenciais.map((prazo, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-red-400" />
                      {prazo}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Valores Mencionados */}
            {analysis.entidades_detectadas.valores_mencionados && analysis.entidades_detectadas.valores_mencionados.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Valores Mencionados</p>
                <ul className="space-y-1">
                  {analysis.entidades_detectadas.valores_mencionados.map((valor, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-green-400" />
                      {valor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observações */}
      {analysis.observacoes && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Observações</h4>
          </div>
          <p className="text-sm text-gray-600 bg-amber-50 rounded-lg p-3">
            {analysis.observacoes}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;

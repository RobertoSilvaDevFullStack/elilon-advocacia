import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getApiBaseUrl } from "../utils/api";
import { trackDiagnostico } from "../utils/tracking";
import { Layout } from "../components/Layout";
import { SEO } from "../components/SEO";
import {
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Shield,
  Clock,
  Award,
  Phone,
  Mail,
  Building2,
  User,
  TrendingUp,
  AlertCircle,
  CheckCheck,
  XCircle,
  Loader2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  text: string;
  subtext?: string;
  options: { value: string; label: string; score: number }[];
}

interface LeadForm {
  nome: string;
  empresa: string;
  email: string;
  whatsapp: string;
}

type DiagnosisLevel = "alto" | "medio" | "baixo" | null;

// ─── Quiz Questions ───────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: "regime",
    text: "Sua empresa está enquadrada no Simples Nacional?",
    subtext: "O Simples Nacional é o regime tributário simplificado para MEI, ME e EPP.",
    options: [
      { value: "sim", label: "Sim, estou no Simples Nacional", score: 3 },
      { value: "nao", label: "Não, estou no Lucro Presumido ou Real", score: 1 },
      { value: "nao_sei", label: "Não sei ao certo", score: 2 },
    ],
  },
  {
    id: "faturamento",
    text: "Qual é o faturamento anual aproximado da sua empresa?",
    subtext: "Considere o faturamento bruto dos últimos 12 meses.",
    options: [
      { value: "ate_360k", label: "Até R$ 360 mil (MEI ou ME)", score: 2 },
      { value: "360k_1_8m", label: "Entre R$ 360 mil e R$ 1,8 milhão", score: 3 },
      { value: "1_8m_4_8m", label: "Entre R$ 1,8 milhão e R$ 4,8 milhões", score: 3 },
      { value: "acima_4_8m", label: "Acima de R$ 4,8 milhões", score: 1 },
    ],
  },
  {
    id: "setor",
    text: "Em qual setor sua empresa atua?",
    subtext: "Alguns setores serão mais impactados pelas mudanças na carga tributária.",
    options: [
      { value: "servicos", label: "Prestação de serviços (consultoria, tecnologia, saúde, etc.)", score: 3 },
      { value: "comercio", label: "Comércio (varejo ou atacado)", score: 2 },
      { value: "industria", label: "Indústria ou manufatura", score: 2 },
      { value: "misto", label: "Misto (serviços + comércio/indústria)", score: 3 },
    ],
  },
  {
    id: "tributacao_servicos",
    text: "Sua empresa cobra ISSQN (ISS) sobre seus serviços?",
    subtext: "O ISS será substituído pelo IBS e CBS com a Reforma Tributária.",
    options: [
      { value: "sim_muito", label: "Sim, é minha principal fonte de receita", score: 3 },
      { value: "sim_pouco", label: "Sim, mas é uma parte menor da receita", score: 2 },
      { value: "nao", label: "Não, minha empresa não presta serviços sujeitos a ISS", score: 1 },
    ],
  },
  {
    id: "conhecimento_reforma",
    text: "Você já fez alguma análise sobre os impactos da Reforma Tributária no seu negócio?",
    subtext: "A Reforma Tributária foi promulgada em 2023 e começa a vigorar gradualmente a partir de 2026.",
    options: [
      { value: "nenhuma", label: "Não, ainda não fiz nenhuma análise", score: 3 },
      { value: "superficial", label: "Sim, mas foi superficial ou informal", score: 2 },
      { value: "completa", label: "Sim, já tenho uma análise detalhada", score: 0 },
    ],
  },
];

// ─── Score → Diagnosis ────────────────────────────────────────────────────────

function calculateDiagnosis(answers: Record<string, number>): DiagnosisLevel {
  const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
  if (total >= 11) return "alto";
  if (total >= 7) return "medio";
  return "baixo";
}

// ─── Result Content ───────────────────────────────────────────────────────────

const RESULTS = {
  alto: {
    icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
    color: "red",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    badgeBg: "bg-red-100 text-red-700",
    title: "Alto Risco de Impacto",
    subtitle: "Sua empresa apresenta características que a expõem significativamente às mudanças da Reforma Tributária.",
    points: [
      "Provável aumento na carga tributária com a migração para o IBS/CBS",
      "Atenção especial ao período de transição (2026–2032)",
      "Avaliação urgente do Regime Híbrido pode ser estratégica",
      "Revisão do planejamento tributário recomendada com urgência",
    ],
    cta: "Seu perfil indica que uma análise jurídica especializada é essencial para proteger sua empresa.",
  },
  medio: {
    icon: <AlertCircle className="w-10 h-10 text-amber-500" />,
    color: "amber",
    borderColor: "border-amber-200",
    bgColor: "bg-amber-50",
    badgeBg: "bg-amber-100 text-amber-700",
    title: "Impacto Moderado Identificado",
    subtitle: "Sua empresa pode ser afetada pela Reforma Tributária, mas existem oportunidades de planejamento.",
    points: [
      "Impactos pontuais identificados em sua atividade principal",
      "O Regime Híbrido pode representar uma vantagem competitiva",
      "Período de transição permite planejamento antecipado",
      "Análise detalhada pode revelar oportunidades fiscais",
    ],
    cta: "Recomendamos uma avaliação préventiva para garantir que você esteja preparado para as mudanças.",
  },
  baixo: {
    icon: <CheckCheck className="w-10 h-10 text-green-500" />,
    color: "green",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    badgeBg: "bg-green-100 text-green-700",
    title: "Baixo Risco Imediato",
    subtitle: "Seu perfil indica menor exposição imediata, mas o acompanhamento ainda é recomendado.",
    points: [
      "Impacto direto aparentemente limitado no curto prazo",
      "Monitoramento das mudanças graduais ainda é importante",
      "Pode haver oportunidades tributárias a explorar",
      "Revisão anual do planejamento tributário é sempre prudente",
    ],
    cta: "Mesmo com baixo risco imediato, uma consulta preventiva garante que você não perca oportunidades.",
  },
};

const API_URL = getApiBaseUrl();

// ─── Component ────────────────────────────────────────────────────────────────

export const DiagnosticoTributario: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisLevel>(null);
  const [lead, setLead] = useState<LeadForm>({ nome: "", empresa: "", email: "", whatsapp: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { search: queryString } = useLocation();
  // Capture UTMs on mount (store in ref so they don't trigger re-renders)
  const utmRef = useRef<Record<string, string>>({});

  const totalSteps = QUESTIONS.length;
  const progress = Math.round((currentStep / totalSteps) * 100);
  const isQuizDone = diagnosis !== null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(queryString);
    utmRef.current = {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
    };
  }, []);

  const handleOptionSelect = (value: string, score: number) => {
    setSelectedOption(value);
    const q = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [q.id]: score };

    setTimeout(() => {
      if (currentStep + 1 < totalSteps) {
        setAnimating(true);
        setTimeout(() => {
          setAnswers(newAnswers);
          setCurrentStep((s) => s + 1);
          setSelectedOption(null);
          setAnimating(false);
        }, 300);
      } else {
        setAnswers(newAnswers);
        setDiagnosis(calculateDiagnosis(newAnswers));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 400);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Build human-readable answers map for storage
    const respostasLegivel: Record<string, string> = {};
    QUESTIONS.forEach((q) => {
      const score = answers[q.id];
      if (score !== undefined) {
        const opt = q.options.find((o) => o.score === score);
        respostasLegivel[q.id] = opt?.label ?? String(score);
      }
    });

    const totalScore = (Object.values(answers) as number[]).reduce((s, v) => s + v, 0);

    try {
      const res = await fetch(`${API_URL}/diagnostico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: lead.nome,
          empresa: lead.empresa,
          email: lead.email,
          whatsapp: lead.whatsapp,
          respostas: respostasLegivel,
          score: totalScore,
          nivel_risco: diagnosis,
          origem: "diagnostico-reforma-tributaria",
          ...utmRef.current,
        }),
      });
      // Sprint 3.8: dispara Lead apenas após persistência confirmada
      if (res.ok) {
        trackDiagnostico({
          source: "diagnostico_tributario",
          risk_level: diagnosis ?? "",
          score: totalScore,
        });
      }
    } catch (_) {
      // Falha silenciosa — UX não é bloqueada por erro de persistência
      console.error("Falha ao persistir lead do diagnóstico");
    }

    setIsSubmitting(false);
    setLeadSubmitted(true);
  };

  const restartQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setSelectedOption(null);
    setDiagnosis(null);
    setLeadSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const result = diagnosis ? RESULTS[diagnosis] : null;

  return (
    <Layout>
      <SEO
        title="Diagnóstico da Reforma Tributária para Empresas do Simples Nacional"
        description="Descubra gratuitamente como a Reforma Tributária pode impactar sua empresa e se vale a pena avaliar o Regime Híbrido."
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Diagnóstico da Reforma Tributária",
          description:
            "Diagnóstico gratuito para empresas do Simples Nacional sobre os impactos da Reforma Tributária.",
          url: "https://elilonlopesadvogados.com.br/diagnostico-reforma-tributaria",
        }}
      />

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-[#200A0C] via-[#1A1A1A] to-[#101010] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-vinho-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-vinho-700/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-vinho-500/20 text-vinho-200 text-xs font-bold uppercase tracking-widest rounded-full border border-vinho-500/30 mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            Reforma Tributária 2026
          </span>
          <h1 className="text-3xl md:text-5xl font-headline font-bold text-white mb-4 leading-tight">
            Descubra se sua empresa será impactada
            <br className="hidden md:block" />
            <span className="text-vinho-300"> pela Reforma Tributária</span>
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8">
            Responda algumas perguntas e receba uma análise preliminar instantânea.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-neutral-400">
            {[
              { icon: <Shield className="w-4 h-4 text-vinho-400" />, label: "Atendimento especializado" },
              { icon: <Award className="w-4 h-4 text-vinho-400" />, label: "Escritório com atuação tributária" },
              { icon: <CheckCircle className="w-4 h-4 text-vinho-400" />, label: "Diagnóstico sem compromisso" },
              { icon: <Clock className="w-4 h-4 text-vinho-400" />, label: "Resultado imediato" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1.5">
                {b.icon}
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-neutral-50 min-h-[60vh]">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* ── Quiz ─────────────────────────────────────────────────────── */}
          {!isQuizDone && (
            <div
              className={`transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-neutral-500 mb-2">
                  <span>Pergunta {currentStep + 1} de {totalSteps}</span>
                  <span>{progress}% concluído</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-vinho-500 to-vermelho-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-vinho-50 flex items-center justify-center text-vinho-600 font-bold text-lg shrink-0">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-headline font-bold text-neutral-900">
                      {QUESTIONS[currentStep].text}
                    </h2>
                    {QUESTIONS[currentStep].subtext && (
                      <p className="text-sm text-neutral-500 mt-1">
                        {QUESTIONS[currentStep].subtext}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {QUESTIONS[currentStep].options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleOptionSelect(opt.value, opt.score)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                        ${selectedOption === opt.value
                          ? "border-vinho-500 bg-vinho-50 text-vinho-800"
                          : selectedOption !== null
                            ? "border-neutral-100 bg-neutral-50 text-neutral-400 cursor-not-allowed"
                            : "border-neutral-200 bg-white hover:border-vinho-400 hover:bg-vinho-50 hover:shadow-sm text-neutral-700"
                        }`}
                    >
                      <span className="font-medium text-sm md:text-base">{opt.label}</span>
                      {selectedOption === opt.value ? (
                        <CheckCircle className="w-5 h-5 text-vinho-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-vinho-400 transition-colors shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-2 mt-6">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i < currentStep
                        ? "w-4 h-2 bg-vinho-500"
                        : i === currentStep
                          ? "w-6 h-2 bg-vinho-400"
                          : "w-2 h-2 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Result ───────────────────────────────────────────────────── */}
          {isQuizDone && result && !leadSubmitted && (
            <div className="animate-fade-in">
              {/* Result card */}
              <div className={`bg-white rounded-2xl shadow-sm border-2 ${result.borderColor} p-6 md:p-8 mb-8`}>
                <div className={`${result.bgColor} rounded-xl p-5 mb-6 flex items-start gap-4`}>
                  <div className="shrink-0 mt-0.5">{result.icon}</div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${result.badgeBg} mb-2 inline-block`}>
                      Diagnóstico Preliminar
                    </span>
                    <h2 className="text-2xl font-headline font-bold text-neutral-900 mb-1">
                      {result.title}
                    </h2>
                    <p className="text-neutral-600">{result.subtitle}</p>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">
                  Pontos de Atenção Identificados
                </h3>
                <ul className="flex flex-col gap-3 mb-6">
                  {result.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-vinho-500 shrink-0 mt-0.5" />
                      <span className="text-neutral-700 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <p className="text-sm text-neutral-600 italic">
                    <strong className="text-neutral-800">⚠️ Importante:</strong> {result.cta}
                  </p>
                </div>
              </div>

              {/* Lead capture */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 md:p-8">
                <div className="text-center mb-6">
                  <TrendingUp className="w-10 h-10 text-vinho-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-headline font-bold text-neutral-900 mb-2">
                    Receba uma análise mais detalhada
                  </h2>
                  <p className="text-neutral-500 text-sm">
                    Nossos especialistas em Direito Tributário vão analisar especificamente o seu caso e entrar em contato.
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Seu nome completo *"
                      required
                      value={lead.nome}
                      onChange={(e) => setLead((p) => ({ ...p, nome: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-vinho-400 focus:ring-2 focus:ring-vinho-100 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Nome da empresa *"
                      required
                      value={lead.empresa}
                      onChange={(e) => setLead((p) => ({ ...p, empresa: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-vinho-400 focus:ring-2 focus:ring-vinho-100 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="Seu e-mail *"
                      required
                      value={lead.email}
                      onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-vinho-400 focus:ring-2 focus:ring-vinho-100 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      placeholder="WhatsApp (com DDD) *"
                      required
                      value={lead.whatsapp}
                      onChange={(e) => setLead((p) => ({ ...p, whatsapp: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-vinho-400 focus:ring-2 focus:ring-vinho-100 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-vinho-600 to-vermelho-600 text-white font-semibold text-sm uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-vinho-500/30 transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Solicitar Análise Completa
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-neutral-400 text-center">
                    Ao enviar, você concorda com nossa{" "}
                    <Link to="/privacidade" className="text-vinho-500 hover:underline">
                      Política de Privacidade
                    </Link>
                    . Sem spam, prometemos.
                  </p>
                </form>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={restartQuiz}
                  className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
                >
                  Refazer o diagnóstico
                </button>
              </div>
            </div>
          )}

          {/* ── Lead Submitted Thank You ─────────────────────────────────── */}
          {leadSubmitted && (
            <div className="animate-fade-in text-center bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-12">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCheck className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-neutral-900 mb-3">
                Solicitação enviada com sucesso!
              </h2>
              <p className="text-neutral-500 mb-2 max-w-sm mx-auto">
                Recebemos seus dados. Nossa equipe tributária entrará em contato em breve para uma análise personalizada.
              </p>
              <p className="text-sm text-neutral-400 mb-8">
                Enquanto isso, você pode nos chamar diretamente pelo WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/5538991376138?text=Olá!%20Fiz%20o%20diagnóstico%20tributário%20e%20gostaria%20de%20uma%20análise%20completa."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#20bd5a] transition-all hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                  Falar no WhatsApp
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 text-neutral-600 font-semibold text-sm rounded-xl hover:bg-neutral-50 transition-all"
                >
                  Voltar ao início
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Info Section ─────────────────────────────────────────────────── */}
      {!isQuizDone && (
        <section className="py-16 bg-white border-t border-neutral-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-neutral-900 mb-3">
                O que você precisa saber sobre a Reforma Tributária
              </h2>
              <p className="text-neutral-500 max-w-xl mx-auto text-sm">
                A Reforma Tributária aprovada em 2023 traz mudanças profundas especialmente para empresas do Simples Nacional.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <AlertTriangle className="w-6 h-6 text-vinho-500" />,
                  title: "IBS e CBS Substituem ISS e PIS/COFINS",
                  desc: "Os novos tributos têm alíquotas diferentes e regras de aproveitamento de crédito que podem aumentar a carga tributária de muitas empresas.",
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-vinho-500" />,
                  title: "Regime Híbrido: Oportunidade ou Risco?",
                  desc: "A legislação permite escolha entre o novo sistema e o atual durante a transição. Essa decisão pode ser estratégica — ou um erro custoso.",
                },
                {
                  icon: <Clock className="w-6 h-6 text-vinho-500" />,
                  title: "Transição até 2032",
                  desc: "O período de transição é gradual, mas o planejamento deve começar agora. Empresas despreparadas podem perder competitividade.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl border border-neutral-100 hover:border-vinho-200 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-vinho-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-vinho-100 transition-colors">
                    {card.icon}
                  </div>
                  <h3 className="font-headline font-bold text-neutral-800 mb-2">{card.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      {!isQuizDone && (
        <section className="py-12 bg-gradient-to-br from-[#200A0C] to-[#1A1A1A] text-center">
          <div className="container mx-auto px-4">
            <p className="text-neutral-400 text-sm mb-3">Precisa de atendimento imediato?</p>
            <a
              href="https://wa.me/5538991376138?text=Olá!%20Quero%20saber%20mais%20sobre%20os%20impactos%20da%20Reforma%20Tributária."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#20bd5a] transition-all hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
              </svg>
              Falar com Especialista no WhatsApp
            </a>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default DiagnosticoTributario;

import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SEO } from "../components/SEO";
import { CheckCheck, Home, MessageCircle } from "lucide-react";

export const DiagnosticoSucesso: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "seu e-mail cadastrado";

  return (
    <Layout>
      <SEO
        title="Pagamento Confirmado — Diagnóstico Tributário Premium"
        description="Seu pagamento foi confirmado. Nossa equipe irá elaborar sua análise tributária personalizada."
      />

      <section className="pt-32 pb-16 bg-neutral-50 min-h-[70vh]">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCheck className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-2xl md:text-3xl font-headline font-bold text-neutral-900 mb-3">
              Pagamento confirmado
            </h1>

            <p className="text-neutral-600 mb-6 leading-relaxed">
              Recebemos sua solicitação.
              <br />
              Nossa equipe irá elaborar sua análise tributária personalizada.
            </p>

            <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100 mb-6 text-left space-y-3">
              <p className="text-sm text-neutral-600">
                O material será enviado para:
              </p>
              <p className="font-semibold text-neutral-900 break-all">{email}</p>
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-sm text-neutral-500">Prazo de entrega:</p>
                <p className="font-semibold text-vinho-700">Até 24 horas úteis.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-vinho-600 text-white font-semibold text-sm rounded-xl hover:bg-vinho-700 transition-all"
              >
                <Home className="w-4 h-4" />
                Voltar para Home
              </Link>
              <a
                href="https://wa.me/5538991376138?text=Olá!%20Acabei%20de%20contratar%20o%20Diagnóstico%20Tributário%20Premium%20e%20gostaria%20de%20falar%20com%20um%20especialista."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 border border-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl hover:bg-neutral-50 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com Especialista
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DiagnosticoSucesso;

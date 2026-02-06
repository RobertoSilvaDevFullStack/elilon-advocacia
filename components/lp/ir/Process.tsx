import React from "react";
import { ShieldCheck, Calculator, Gavel } from "lucide-react";

const Process: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-headline font-bold text-[#161213] mb-4">
            Como funciona o processo?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans">
            Nossa equipe especializada cuida de toda a burocracia para que você
            foque no que mais importa: sua saúde.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:border-vinho-500/20 transition-all duration-300 group">
            <div className="w-14 h-14 bg-vinho-500/10 rounded-xl flex items-center justify-center text-vinho-500 mb-6 group-hover:bg-vinho-500 group-hover:text-white transition-colors duration-300">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#161213]">
              1. Análise de Elegibilidade
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Verificamos se sua condição clínica se enquadra na Lei 7.713/88.
              Doenças como câncer, cardiopatia grave e Parkinson dão direito ao
              benefício.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:border-vinho-500/20 transition-all duration-300 group">
            <div className="w-14 h-14 bg-vinho-500/10 rounded-xl flex items-center justify-center text-vinho-500 mb-6 group-hover:bg-vinho-500 group-hover:text-white transition-colors duration-300">
              <Calculator size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#161213]">
              2. Cálculo de Restituição
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Calculamos quanto você pagou indevidamente nos últimos 5 anos. Os
              valores podem chegar a dezenas de milhares de reais.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:border-vinho-500/20 transition-all duration-300 group">
            <div className="w-14 h-14 bg-vinho-500/10 rounded-xl flex items-center justify-center text-vinho-500 mb-6 group-hover:bg-vinho-500 group-hover:text-white transition-colors duration-300">
              <Gavel size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#161213]">
              3. Atuação Jurídica
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Entramos com o pedido administrativo ou judicial. Você não paga
              nada antecipadamente, apenas uma porcentagem no êxito.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;

import React from "react";
import { MessageSquare, FolderOpen, Banknote } from "lucide-react";

const Process: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16 relative z-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-headline font-bold text-3xl text-[#161213] mb-4">
            Como funciona o processo?
          </h2>
          <p className="font-sans text-gray-600 max-w-2xl mx-auto">
            Nossa equipe de especialistas cuida de tudo para você, desde a
            análise inicial até a concessão do benefício.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-vinho-500/10 rounded-full flex items-center justify-center text-vinho-500 mb-6">
              <MessageSquare size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">1. Análise Gratuita</h3>
            <p className="text-sm text-gray-600">
              Converse com nossos especialistas pelo WhatsApp para verificarmos
              se você tem direito ao benefício.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-vinho-500/10 rounded-full flex items-center justify-center text-vinho-500 mb-6">
              <FolderOpen size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">2. Documentação</h3>
            <p className="text-sm text-gray-600">
              Orientamos sobre todos os documentos necessários e preparamos o
              processo administrativo.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-vinho-500/10 rounded-full flex items-center justify-center text-vinho-500 mb-6">
              <Banknote size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3">3. Recebimento</h3>
            <p className="text-sm text-gray-600">
              Acompanhamos o processo até a aprovação e o primeiro pagamento do
              seu benefício.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;

import React from "react";
import {
  CheckCircle,
  AlertCircle,
  PersonStanding,
  Accessibility,
} from "lucide-react";

const Requirements: React.FC = () => {
  return (
    <section className="bg-white py-16 lg:py-24 relative z-10 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headline font-bold text-3xl md:text-4xl text-[#161213] mb-6">
            Quem tem direito ao benefício?
          </h2>
          <p className="font-sans text-lg text-gray-600 leading-relaxed">
            O BPC/LOAS é destinado a garantir o sustento de quem não possui
            meios de prover a própria manutenção. Confira abaixo os dois grupos
            principais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Idosos */}
          <div className="flex flex-col items-start p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:border-vinho-500/20 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-vinho-500/10 flex items-center justify-center text-vinho-500 mb-6 group-hover:bg-vinho-500 group-hover:text-white transition-colors duration-300">
              <PersonStanding size={40} />
            </div>
            <h3 className="font-headline font-bold text-2xl text-[#161213] mb-4">
              Idosos acima de 65 anos
            </h3>
            <p className="font-sans text-gray-600 leading-relaxed mb-6">
              Direito garantido para idosos que não possuem aposentadoria e cuja
              renda familiar por pessoa seja inferior a 1/4 do salário mínimo.
            </p>
            <div className="mt-auto pt-6 w-full border-t border-gray-50">
              <div className="flex items-center gap-2 text-vinho-500 font-bold text-sm">
                <CheckCircle size={20} />
                <span>Sem necessidade de contribuição</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pessoas com Deficiência */}
          <div className="flex flex-col items-start p-8 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 hover:shadow-xl hover:border-vinho-500/20 transition-all duration-300 group">
            <div className="w-16 h-16 rounded-xl bg-vinho-500/10 flex items-center justify-center text-vinho-500 mb-6 group-hover:bg-vinho-500 group-hover:text-white transition-colors duration-300">
              <Accessibility size={40} />
            </div>
            <h3 className="font-headline font-bold text-2xl text-[#161213] mb-4">
              Pessoas com Deficiência
            </h3>
            <p className="font-sans text-gray-600 leading-relaxed mb-6">
              Para pessoas com impedimentos de longo prazo (física, mental,
              intelectual ou sensorial) que impossibilitem a participação plena
              na sociedade.
            </p>
            <div className="mt-auto pt-6 w-full border-t border-gray-50">
              <div className="flex items-center gap-2 text-vinho-500 font-bold text-sm">
                <CheckCircle size={20} />
                <span>Qualquer idade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Income Alert */}
        <div className="mt-12 bg-[#FFF5F6] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-vinho-500/10">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-vinho-500 flex items-center justify-center text-white shadow-md shadow-vinho-500/30">
            <AlertCircle size={24} />
          </div>
          <div className="flex-grow">
            <h4 className="font-headline font-bold text-lg text-[#161213] mb-2">
              Requisito de Baixa Renda
            </h4>
            <p className="font-sans text-gray-700">
              Para ambos os casos, é fundamental comprovar que a renda por
              pessoa da família é baixa (geralmente até 1/4 do salário mínimo,
              mas há exceções judiciais).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Requirements;

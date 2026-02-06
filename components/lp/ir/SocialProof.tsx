import React from "react";
import { Star, Quote } from "lucide-react";

const SocialProof: React.FC = () => {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Stats & Intro */}
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#161213] mb-6">
              Histórias de quem recuperou seus direitos
            </h2>
            <p className="text-lg text-gray-600 mb-8 font-sans">
              Mais de 1.200 clientes atendidos em todo o Brasil. Veja o que
              dizem sobre nosso atendimento humanizado e resultados.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <p className="text-3xl font-black text-vinho-500 mb-1">
                  R$ 45mi+
                </p>
                <p className="text-sm text-gray-500">
                  Recuperados para clientes
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <p className="text-3xl font-black text-vinho-500 mb-1">98%</p>
                <p className="text-sm text-gray-500">Taxa de sucesso</p>
              </div>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="md:w-1/2 w-full">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative">
              <Quote
                className="absolute top-4 right-4 text-vinho-500/10 rotate-180"
                size={64}
              />
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 italic font-sans relative z-10">
                "Eu não sabia que tinha direito à isenção por causa da minha
                cardiopatia. A equipe foi extremamente atenciosa e recuperou um
                valor que ajudou muito no meu tratamento. Recomendo de olhos
                fechados."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCTa9felLxFwEPnhd5tZEuu8x23p2nTLv4KZPifWPpI2JGAh-D3zCQZ4t9jpC33cnIWy6GXg6DAuGq2MfTdCpp3-iEmfHeZGypoAqd7kaZA6ThUqTlHWtRSDKYHF0iJxTEMU_Z2Fi4EFIzXBN4dMSWBTJ3TIigN4gs9Cfi5JpFijPd5CT2yQa2fCt8rotrKeOSA0nRYOZKese14D_0-NEeAXtyZA8evLwg01voVqfzJ4QCI5kCUTmDUjvx3kja3l1eQJng9SFV5YtI"
                    alt="Carlos Mendes"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#161213]">Carlos Mendes</p>
                  <p className="text-sm text-gray-500">
                    Recuperou R$ 42.000,00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Strip */}
      <div className="mt-20 py-16 bg-vinho-500">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-6">
            Não deixe seu dinheiro com o governo indevidamente
          </h2>
          <p className="text-vinho-50 text-lg mb-8 max-w-2xl mx-auto font-sans">
            A consulta é gratuita e você só paga se ganharmos a causa. Clique
            abaixo e fale com um especialista agora mesmo.
          </p>
          <button
            onClick={() => window.open("https://wa.me/553899576682", "_blank")}
            className="inline-flex items-center justify-center gap-2 bg-white text-vinho-500 hover:bg-gray-50 text-lg font-bold py-4 px-8 rounded-lg shadow-lg transition-colors duration-200"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="w-6 h-6"
            />
            <span>Falar com Advogado Especialista</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

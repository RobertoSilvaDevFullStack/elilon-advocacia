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
              Histórias de quem conquistou seu benefício
            </h2>
            <p className="text-lg text-gray-600 mb-8 font-sans">
              Centenas de famílias beneficiadas com o BPC/LOAS em todo o Brasil.
              Veja o impacto do nosso trabalho na vida de nossos clientes.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <p className="text-3xl font-black text-vinho-500 mb-1">
                  1.500+
                </p>
                <p className="text-sm text-gray-500">Benefícios Concedidos</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                <p className="text-3xl font-black text-vinho-500 mb-1">98%</p>
                <p className="text-sm text-gray-500">Taxa de Aprovação</p>
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
                "Minha mãe teve o BPC negado duas vezes pelo INSS. A equipe do
                Dr. Elilon assumiu o caso e conseguiu a aprovação em poucos
                meses. Hoje ela tem dignidade e segurança financeira."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCTa9felLxFwEPnhd5tZEuu8x23p2nTLv4KZPifWPpI2JGAh-D3zCQZ4t9jpC33cnIWy6GXg6DAuGq2MfTdCpp3-iEmfHeZGypoAqd7kaZA6ThUqTlHWtRSDKYHF0iJxTEMU_Z2Fi4EFIzXBN4dMSWBTJ3TIigN4gs9Cfi5JpFijPd5CT2yQa2fCt8rotrKeOSA0nRYOZKese14D_0-NEeAXtyZA8evLwg01voVqfzJ4QCI5kCUTmDUjvx3kja3l1eQJng9SFV5YtI"
                    alt="Maria Helena"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-[#161213]">Maria Helena</p>
                  <p className="text-sm text-gray-500">Benefício Concedido</p>
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
            Garanta o benefício que é seu por direito
          </h2>
          <p className="text-vinho-50 text-lg mb-8 max-w-2xl mx-auto font-sans">
            A análise é gratuita e você só paga se ganharmos. Clique abaixo e
            fale com um especialista agora mesmo.
          </p>
          <button
            onClick={() => {
              window.fbq?.("track", "Contact");
              window.open(
                "https://wa.me/5531990150870?text=Ol%C3%A1!%20Vim%20pelo%20an%C3%BAncio.%20Quero%20falar%20com%20um%20advogado%3F",
                "_blank",
              );
            }}
            className="inline-flex items-center justify-center gap-2 bg-white text-vinho-500 hover:bg-gray-50 text-lg font-bold py-4 px-8 rounded-lg shadow-lg transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#25D366"
              viewBox="0 0 16 16"
              className="w-6 h-6"
            >
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            <span>Falar com Advogado Especialista</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

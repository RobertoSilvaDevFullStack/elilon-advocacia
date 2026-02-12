import React from "react";
import { Shield, Star, Lock } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-16 lg:pb-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwwA8KoghVnjsO92RABGgstm6i98UdQH5KTJIMg11eiPc0Ne3qyiHbR_RUiTQVv9_Ou9ZQmY38QlVM6TdlTK1_9Jzklztx3chmWytWf8NTPoJW7a5UkboD2mc3LJD8l5MyF3LqFt8V1fN4_4ZihZgj_lvkT3z6T4ewzqSUuCaINSVPuGjWMzGFt7g3ajTqkRIPonHaiY8vOvOOWCfhQF-uw0UvkDvsN-yvpZFIyGtiEchvfxwHz4UeSb96zjYfw0a0dZh59DIVUOE"
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Text Content */}
        <div className="text-center max-w-4xl mx-auto mb-10 mt-8 sm:mt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Benefício Disponível
          </div>
          <h1 className="font-headline font-black text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-[#161213] mb-6">
            Receba{" "}
            <span className="text-vinho-500 underline decoration-4 underline-offset-4 decoration-vinho-500/20">
              1 Salário Mínimo
            </span>{" "}
            Mensal pelo BPC
          </h1>
          <p className="font-sans text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubra se você ou seu familiar tem direito ao benefício LOAS/BPC,
            mesmo sem nunca ter contribuído. Assista ao vídeo para entender seus
            direitos.
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl shadow-black/10 p-2 sm:p-4 mb-10">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden group cursor-pointer bg-black">
            <video
              src="/images/Mae-de-autista-cheia-de-rotinas.mp4"
              autoPlay
              loop
              playsInline
              controls
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center w-full max-w-2xl gap-8">
          <button
            onClick={() =>
              window.open(
                "https://wa.me/553899576682?text=Ol%C3%A1!%20Vim%20pelo%20an%C3%BAncio.%20Quero%20falar%20com%20um%20advogado%3F",
                "_blank",
              )
            }
            className="animate-pulse hover:animate-none hover:scale-105 w-full sm:w-auto bg-vinho-500 hover:bg-vinho-600 text-white font-sans font-bold text-lg sm:text-xl py-5 px-8 sm:px-12 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="w-8 h-8"
            >
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
            <span>Solicitar Análise Gratuita pelo WhatsApp</span>
          </button>

          {/* Trust Badges */}
          <div className="w-full flex flex-wrap justify-center gap-6 sm:gap-12 py-4 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="text-vinho-500" size={24} />
              <div className="flex flex-col text-left">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                  Verificado
                </span>
                <span className="font-bold text-sm">OAB/MG 150.653</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
              <div className="flex flex-col text-left">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                  Avaliação
                </span>
                <span className="font-bold text-sm">5.0 de 5.0</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Lock className="text-green-600" size={24} />
              <div className="flex flex-col text-left">
                <span className="text-xs uppercase font-bold tracking-wider text-gray-400">
                  Segurança
                </span>
                <span className="font-bold text-sm">Site Seguro SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React from "react";
import { Shield, Star, Lock } from "lucide-react";
import LandingCapture from "../shared/LandingCapture";

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

        {/* CTA — Sprint 3.7: captura lead antes de abrir WhatsApp */}
        <div className="flex flex-col items-center w-full max-w-2xl gap-8">
          <LandingCapture
            source="landing_bpc"
            ctaName="bpc_hero_cta"
            buttonLabel="Solicitar Análise Gratuita pelo WhatsApp"
            buttonClass="bg-vinho-500 hover:bg-vinho-600 text-white hover:scale-105"
          />

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

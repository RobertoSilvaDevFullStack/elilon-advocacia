import React from "react";
import { Star, Award } from "lucide-react";
import LandingCapture from "../shared/LandingCapture";

const Hero: React.FC = () => {
  return (
    <section className="relative pt-36 pb-16 lg:pb-32 overflow-hidden bg-gray-50">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-gray-50 z-10"></div>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfP96OknPw4L-SgfZbfIXN_iS3USf462dlG1yoeaKELM1KfLL8fIDT81cJAn7vUOtmyhxabqGFKhhmpsCA_5Qx2pzn8Z5HJEBL5z8pWIb7a4o6ZY380E-Soj8T2DZuPCxuwsLfLrjVssVcm7oOW9G9UMH7JdsqQwtLMnmpGbJoS2n7a5tX56f2QposMF2kpuaFyOx1ZxAvrfOxqgKKyYispUWo6CxFCBWCufyUzpgAPgPA-qRSJ6kR9zR-u5xpT8HSBk6Bqlmeskzj"
          alt=""
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-40 grayscale-[20%]"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <div className="mb-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-black text-[#161213] leading-[1.1] mb-6 tracking-tight">
            Quem teve{" "}
            <span className="text-vinho-500 underline decoration-4 decoration-vinho-500/20 underline-offset-4">
              Doenças Graves
            </span>{" "}
            não precisa pagar Imposto de Renda
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-sans font-medium leading-relaxed max-w-2xl mx-auto">
            A lei garante isenção total e você pode recuperar valores pagos nos
            últimos 5 anos. Descubra seus direitos em poucos minutos.
          </p>
        </div>

        {/* Video */}
        <div className="relative w-full max-w-3xl mx-auto mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-vinho-500 to-[#8a2b35] rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-black/5">
            <video
              src="/images/aposentado-que-sofre-com-doenca.mp4"
              autoPlay
              loop
              playsInline
              controls
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="material-symbols-outlined text-lg">info</span>
            <span>Assista ao vídeo explicativo de 2 minutos</span>
          </div>
        </div>

        {/* CTA — Sprint 3.7: captura lead antes de abrir WhatsApp */}
        <div className="flex flex-col items-center gap-6">
          <LandingCapture
            source="landing_ir"
            ctaName="ir_hero_cta"
            buttonLabel="Verificar Isenção pelo WhatsApp"
            buttonClass="bg-vinho-500 hover:bg-vinho-600 text-white shadow-vinho-500/30 hover:-translate-y-1"
          />

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm md:text-base">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <Award className="text-vinho-500" size={20} />
              <span className="font-semibold text-gray-700">
                OAB/MG 150.653
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <div className="flex text-amber-400">
                <Star className="fill-amber-400" size={16} />
                <Star className="fill-amber-400" size={16} />
                <Star className="fill-amber-400" size={16} />
                <Star className="fill-amber-400" size={16} />
                <Star className="fill-amber-400" size={16} />
              </div>
              <span className="font-semibold text-gray-700">
                4.9/5 em Avaliações
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

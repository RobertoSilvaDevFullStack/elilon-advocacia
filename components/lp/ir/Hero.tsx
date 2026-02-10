import React from "react";
import { Star, Award } from "lucide-react";

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
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="material-symbols-outlined text-lg">info</span>
            <span>Assista ao vídeo explicativo de 2 minutos</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => window.open("https://wa.me/553899576682", "_blank")}
            className="group relative flex items-center justify-center gap-3 bg-vinho-500 hover:bg-vinho-600 text-white text-lg md:text-xl font-bold py-5 px-10 rounded-lg shadow-xl shadow-vinho-500/30 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto animate-pulse"
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
            <span>Verificar Isenção pelo WhatsApp</span>
          </button>

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

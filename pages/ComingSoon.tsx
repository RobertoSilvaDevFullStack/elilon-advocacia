import React, { useState, useEffect } from "react";
import { Phone, Mail } from "lucide-react";
import { Linkedin, Instagram, Facebook } from "../components/icons/SocialIcons";

const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-01-02T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-black via-[#1A1A1A] to-[#200A0C] animate-gradient-shift" />

        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-repeat" />
        </div>

        {/* Red accent glow */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-linear-to-bl from-[#C41414]/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-linear-to-tr from-[#F51919]/20 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <img
            src="/images/logo-nova.png"
            alt="Elilon Lopes Advogados"
            className="h-20 md:h-24 w-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
          {/* Status Badge */}
          <div className="inline-block">
            <span className="px-6 py-2 bg-linear-to-r from-[#C41414] to-[#F51919] text-white text-sm uppercase tracking-widest font-semibold rounded-full shadow-lg shadow-red-500/30">
              Em Breve
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-white leading-tight">
            Em{" "}
            <span className="bg-linear-to-r from-[#C41414] to-[#F51919] bg-clip-text text-transparent">
              Construção
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Estamos preparando algo{" "}
            <span className="text-white font-semibold">excepcional</span> para
            você.
            <br />
            Nossa nova plataforma estará disponível em:
          </p>

          {/* Countdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto mt-12">
            {[
              { value: timeLeft.days, label: "Dias" },
              { value: timeLeft.hours, label: "Horas" },
              { value: timeLeft.minutes, label: "Minutos" },
              { value: timeLeft.seconds, label: "Segundos" },
            ].map((item, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-linear-to-br from-white to-neutral-300 bg-clip-text text-transparent tabular-nums">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm text-neutral-400 uppercase tracking-wider mt-2 font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Launch Date */}
          <div className="mt-12 p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto">
            <p className="text-sm text-neutral-400 uppercase tracking-widest mb-2">
              Data de Lançamento
            </p>
            <p className="text-2xl md:text-3xl font-headline font-bold text-white">
              02 de Janeiro de 2026
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-16 space-y-6">
            <p className="text-neutral-400">
              Enquanto isso, estamos à disposição:
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-neutral-300">
              <a
                href="tel:+553822001615"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone size={18} />
                <span>(38) 2200-1615</span>
              </a>
              <a
                href="mailto:juridico@elilonlopesadvogados.com.br"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail size={18} />
                <span>juridico@elilonlopesadvogados.com.br</span>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <a
                href="https://www.linkedin.com/in/elilon-lopes/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
              >
                <Linkedin size={20} className="text-white" />
              </a>
              <a
                href="https://www.instagram.com/elilonlopesadvogados"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
              >
                <Instagram size={20} className="text-white" />
              </a>
              <a
                href="https://www.facebook.com/elilon.lopesdeabreu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
              >
                <Facebook size={20} className="text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Elilon Lopes Advogados. Todos os
            direitos reservados.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;

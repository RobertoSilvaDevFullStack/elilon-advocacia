import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToContact = () => {
    window.open("https://wa.me/553899576682", "_blank");
  };

  return (
    <header
      className={`w-full z-50 fixed top-0 left-0 transition-all duration-300 bg-gradient-to-r from-[#1A1A1A] via-[#101010] to-[#200A0C] border-b border-vinho-900 shadow-lg ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/images/logo-nova.png"
                alt="Elilon Lopes Advogados Logo"
                className="h-10 sm:h-12 w-auto object-contain mix-blend-screen"
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-lg sm:text-xl font-headline font-bold tracking-widest text-white group-hover:text-vinho-500 transition-colors">
                  ELILON LOPES
                </span>
                <span className="text-[10px] sm:text-[10px] tracking-[0.3em] text-neutral-400 uppercase group-hover:text-vinho-400 transition-colors">
                  Advogados
                </span>
              </div>
            </Link>
          </div>

          <button
            onClick={scrollToContact}
            className="hidden sm:flex items-center justify-center h-10 px-6 rounded-lg border-2 border-vinho-500 text-vinho-500 font-sans font-bold text-sm hover:bg-vinho-500 hover:text-white transition-colors uppercase tracking-wide"
          >
            Fale Conosco
          </button>

          <button className="sm:hidden p-2 text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

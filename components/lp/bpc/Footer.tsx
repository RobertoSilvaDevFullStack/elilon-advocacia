import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-[#1A1A1A] to-vinho-900 text-white border-t border-vinho-900 py-12 relative z-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center md:items-start">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-nova.png"
                alt="Elilon Lopes Advogados Logo"
                className="h-12 w-auto object-contain mix-blend-screen"
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xl font-headline font-bold tracking-widest text-white">
                  ELILON LOPES
                </span>
                <span className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">
                  Advogados
                </span>
              </div>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm">
              Excelência jurídica com foco em resultados. Atuamos com
              integridade e inovação para proteger os interesses de nossos
              clientes.
            </p>
          </div>

          {/* Contact Section */}
          <div className="md:text-right flex flex-col items-center md:items-end gap-3 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-vinho-500" />
              <span>Rua João Pinheiro, 95, Centro - Montes Claros/MG</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-vinho-500" />
              <span>(38) 2200-1615</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-vinho-500" />
              <span>juridico@elilonlopesadvogados.com.br</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-10 pt-6 border-t border-neutral-800 text-xs text-neutral-500">
          <p>© 2026 Elilon Lopes Advogados. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link
              to="/termos"
              className="hover:text-vinho-500 transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="hover:text-vinho-500 transition-colors"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

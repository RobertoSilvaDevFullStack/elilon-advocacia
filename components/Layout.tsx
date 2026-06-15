import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Linkedin,
  Instagram,
  Facebook,
  Phone,
  MessageCircle,
} from "lucide-react";
import Navbar from "./Navbar";
import { openWhatsApp } from "../utils/whatsapp";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-preto-500 to-vinho-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 border-b border-neutral-800 pb-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/images/logo-nova.png"
              alt="Elilon Lopes Advogados Logo"
              className="h-12 w-auto object-contain"
            />
            <h2 className="text-3xl font-headline font-bold text-vermelho-400">
              Elilon Lopes Advogados
            </h2>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Excelência jurídica com foco em resultados. Atuamos com integridade
            e inovação para proteger os interesses de nossos clientes.
          </p>
          <div className="flex space-x-2">
            <a
              href="https://www.linkedin.com/in/elilon-lopes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-200 hover:text-accent-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} />
            </a>
            <a
              href="https://www.instagram.com/elilonlopesadvogados"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-gold-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://www.facebook.com/elilon.lopesdeabreu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-gold-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-serif mb-6 text-white border-b border-gold-600 inline-block pb-1">
            Institucional
          </h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li>
              <Link
                to="/sobre"
                className="hover:text-gold-400 transition-colors"
              >
                Sobre Nós
              </Link>
            </li>
            <li>
              <Link
                to="/profissionais"
                className="hover:text-gold-400 transition-colors"
              >
                Profissionais
              </Link>
            </li>
            <li>
              <Link
                to="/areas"
                className="hover:text-gold-400 transition-colors"
              >
                Áreas de Atuação
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="hover:text-gold-400 transition-colors"
              >
                Notícias e Artigos
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="hover:text-gold-400 transition-colors"
              >
                Área Restrita
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-serif mb-6 text-white border-b border-gold-600 inline-block pb-1">
            Contato
          </h3>
          <ul className="space-y-4 text-sm text-neutral-400">
            <li className="flex items-start gap-3">
              <MapPin className="text-accent-500 mt-1 min-w-[16px]" size={16} />
              <span>
                Rua João Pinheiro, 95, Centro
                <br />
                Montes Claros - MG
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-accent-500 min-w-[16px]" size={16} />
              <span>(38) 2200-1615</span>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle
                className="text-accent-500 min-w-[16px]"
                size={16}
              />
              <span>juridico@elilonlopesadvogados.com.br</span>
            </li>
          </ul>
        </div>

        {/* Newsletter / CTA */}
        <div>
          <h3 className="text-lg font-serif mb-6 text-white border-b border-gold-600 inline-block pb-1">
            Newsletter
          </h3>
          <p className="text-neutral-400 text-sm mb-4">
            Receba nossas atualizações jurídicas.
          </p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="bg-neutral-800 border-none text-white px-4 py-3 text-base focus:ring-1 focus:ring-accent-500 min-h-[44px]"
            />
            <button className="bg-accent-500 text-white text-sm uppercase font-semibold py-3 hover:bg-accent-600 transition-colors min-h-[44px]">
              Inscrever-se
            </button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 text-center">
        <p className="text-xs text-neutral-500 mb-2">
          &copy; {new Date().getFullYear()} Elilon Lopes Advogados Sociedade de
          Advogados. Todos os direitos reservados.
        </p>
        <p className="text-sm font-semibold text-neutral-300 mb-4">
          ELILON LOPES DE ABREU SOCIEDADE INDIVIDUAL DE ADVOCACIA
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-neutral-500">
          <Link
            to="/privacidade"
            className="hover:text-accent-400 py-2 px-3 min-h-[44px] flex items-center"
          >
            Política de Privacidade
          </Link>
          <Link
            to="/termos"
            className="hover:text-accent-400 py-2 px-3 min-h-[44px] flex items-center"
          >
            Termos de Uso
          </Link>
          <a
            href="https://www.robertosilvadevfullstack.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent-400 py-2 px-3 min-h-[44px] flex items-center"
          >
            Developed by: Roberto Silva
          </a>
        </div>
      </div>
    </footer>
  );
};

const FloatingWhatsApp: React.FC = () => (
  <button
    onClick={() => openWhatsApp("global_floating_whatsapp")}
    className="fixed z-40 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-transform hover:scale-110 flex items-center justify-center min-w-[56px] min-h-[56px] cursor-pointer"
    style={{ bottom: "30px", right: "24px" }}
    aria-label="Fale conosco no WhatsApp"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
    </svg>
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-neutral-900 bg-neutral-50">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

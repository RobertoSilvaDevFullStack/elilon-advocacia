import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  MapPin,
  Linkedin,
  Instagram,
  Facebook,
  Phone,
  MessageCircle,
} from "lucide-react";
import { NAV_ITEMS } from "../constants";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 bg-gradient-to-r from-neutral-900 to-neutral-800 ${
        scrolled ? "shadow-md py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start leading-tight group">
          <span className="text-xl font-serif font-bold tracking-widest text-white group-hover:text-gold-400 transition-colors">
            ELILON LOPES
          </span>
          <span className="text-[10px] tracking-[0.3em] text-neutral-300 uppercase group-hover:text-white transition-colors">
            Advogados
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:space-x-4 xl:space-x-8 items-center">
          {NAV_ITEMS.map((item) => (
            <div key={item.path} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `lg:text-xs xl:text-sm uppercase tracking-wide font-medium transition-colors hover:text-gold-400 whitespace-nowrap flex items-center ${
                    isActive ? "text-gold-500" : "text-neutral-200"
                  }`
                }
              >
                {item.label}
                {item.subItems && (
                  <ChevronDown className="inline w-3 h-3 ml-1" />
                )}
              </NavLink>

              {/* Submenu */}
              {item.subItems && (
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top pt-2">
                  <div className="flex flex-col border-t-2 border-gold-400">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className="px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-gold-600 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link
            to="/contato"
            className="bg-gold-600 text-white px-5 py-2 text-sm uppercase tracking-wider font-semibold hover:bg-gold-500 transition-colors"
          >
            Fale Conosco
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-gold-500 z-50 relative"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} className="text-white" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-neutral-900 z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col justify-center items-center lg:hidden`}
      >
        {NAV_ITEMS.map((item) => (
          <div key={item.path} className="flex flex-col items-center mb-6">
            <Link
              to={item.path}
              className="text-white text-xl font-serif mb-2"
              onClick={() => !item.subItems && setIsOpen(false)}
            >
              {item.label}
            </Link>
            {item.subItems && (
              <div className="flex flex-col items-center space-y-2 mt-2">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className="text-neutral-400 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-neutral-800 pb-12">
        {/* Brand */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-gold-400 mb-6">
            ELADV
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-6">
            Excelência jurídica com foco em resultados. Atuamos com integridade
            e inovação para proteger os interesses de nossos clientes.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-neutral-400 hover:text-gold-400 transition-colors"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="#"
              className="text-neutral-400 hover:text-gold-400 transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="text-neutral-400 hover:text-gold-400 transition-colors"
            >
              <Facebook size={20} />
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
              <MapPin className="text-gold-500 mt-1 min-w-[16px]" size={16} />
              <span>
                Av. Mestra Fininha, 1234
                <br />
                Montes Claros - MG
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-gold-500 min-w-[16px]" size={16} />
              <span>(38) 3222-0000</span>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="text-gold-500 min-w-[16px]" size={16} />
              <span>contato@eladv.com.br</span>
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
              className="bg-neutral-800 border-none text-white px-4 py-2 text-sm focus:ring-1 focus:ring-gold-500"
            />
            <button className="bg-gold-600 text-white text-sm uppercase font-semibold py-2 hover:bg-gold-500 transition-colors">
              Inscrever-se
            </button>
          </form>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
        <p>
          &copy; 2024 ELADV Sociedade de Advogados. Todos os direitos
          reservados.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link to="/privacidade" className="hover:text-gold-400">
            Política de Privacidade
          </Link>
          <Link to="/termos" className="hover:text-gold-400">
            Termos de Uso
          </Link>
        </div>
      </div>
    </footer>
  );
};

const FloatingWhatsApp: React.FC = () => (
  <a
    href="https://wa.me/5538999999999"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-500 transition-transform hover:scale-110 flex items-center justify-center"
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
  </a>
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

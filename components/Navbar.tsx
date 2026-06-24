import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
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
      className={`fixed w-full z-50 transition-all duration-300 bg-gradient-to-r from-[#1A1A1A] via-[#101010] to-[#200A0C] border-b-2 border-[#A1333E]/40 shadow-lg backdrop-blur-sm ${
        scrolled ? "shadow-xl py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo-nova.png"
            alt="Elilon Lopes Advogados Logo"
            className="h-12 w-auto object-contain mix-blend-screen"
          />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xl font-headline font-bold tracking-widest text-white group-hover:text-vermelho-400 transition-colors">
              ELILON LOPES
            </span>
            <span className="text-[10px] tracking-[0.3em] text-neutral-100 uppercase group-hover:text-white transition-colors">
              Advogados
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:space-x-4 xl:space-x-8 items-center">
          {NAV_ITEMS.filter((item) => !item.highlight).map((item) => (
            <div key={item.path} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `lg:text-xs xl:text-sm uppercase tracking-wide font-medium transition-colors hover:text-[#F74747] whitespace-nowrap flex items-center ${
                    isActive ? "text-[#F51919]" : "text-neutral-100"
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
                  <div className="flex flex-col border-t-2 border-vinho-500">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className="px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-vinho-600 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Highlighted CTA — Diagnóstico Tributário */}
          {NAV_ITEMS.filter((item) => item.highlight).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="relative inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-all duration-200 hover:shadow-lg hover:shadow-amber-400/40 hover:scale-105 whitespace-nowrap animate-pulse-subtle"
              style={{ animationDuration: "3s" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] opacity-70"></span>
              {item.label}
            </Link>
          ))}
          <Link
            to="/contato"
            className="bg-gradient-to-r from-[#C41414] to-[#F51919] text-white px-5 py-2 text-sm uppercase tracking-wider font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all transform hover:scale-105"
          >
            Fale Conosco
          </Link>
        </div>

        {/* Mobile CTA — Diagnóstico Tributário (header recolhido) */}
        <Link
          to="/diagnostico-reforma-tributaria"
          className="lg:hidden ml-auto mr-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-400 text-[#1A1A1A] text-[10px] sm:text-xs font-bold uppercase tracking-wide rounded-md shadow-md shadow-amber-400/30 hover:bg-amber-300 transition-colors whitespace-nowrap animate-pulse-subtle"
          style={{ animationDuration: "3s" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] opacity-70 shrink-0" />
          Diagnóstico
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 py-4 border-t border-neutral-700">
          <div className="container mx-auto px-4 flex flex-col gap-1">
            {NAV_ITEMS.filter((item) => !item.highlight).map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => !item.subItems && setIsOpen(false)}
                  className="text-white hover:text-vermelho-400 transition-colors py-3 font-medium min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
                {item.subItems && (
                  <div className="ml-4 flex flex-col gap-1 mt-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setIsOpen(false)}
                        className="text-neutral-300 hover:text-white transition-colors py-2 text-sm min-h-[44px] flex items-center"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Highlighted item — Diagnóstico Tributário */}
            {NAV_ITEMS.filter((item) => item.highlight).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="bg-amber-400 text-[#1A1A1A] px-5 py-3 text-sm uppercase tracking-wider font-bold transition-all text-center mt-1 min-h-[44px] flex items-center justify-center gap-2 hover:bg-amber-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] opacity-70"></span>
                {item.label}
              </Link>
            ))}
            <Link
              to="/contato"
              onClick={() => setIsOpen(false)}
              className="bg-gradient-to-r from-[#C41414] to-[#F51919] text-white px-5 py-3 text-sm uppercase tracking-wider font-semibold hover:shadow-lg transition-all text-center mt-2 min-h-[44px] flex items-center justify-center"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

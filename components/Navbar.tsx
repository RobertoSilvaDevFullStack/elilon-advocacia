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
          {NAV_ITEMS.map((item) => (
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
          <Link
            to="/contato"
            className="bg-gradient-to-r from-[#C41414] to-[#F51919] text-white px-5 py-2 text-sm uppercase tracking-wider font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all transform hover:scale-105"
          >
            Fale Conosco
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 py-4 border-t border-neutral-700">
          <div className="container mx-auto px-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => !item.subItems && setIsOpen(false)}
                  className="text-white hover:text-vermelho-400 transition-colors py-2 font-medium block"
                >
                  {item.label}
                </Link>
                {item.subItems && (
                  <div className="ml-4 flex flex-col gap-2 mt-2">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setIsOpen(false)}
                        className="text-neutral-300 hover:text-white transition-colors py-1 text-sm block"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/contato"
              onClick={() => setIsOpen(false)}
              className="bg-gradient-to-r from-[#C41414] to-[#F51919] text-white px-5 py-3 text-sm uppercase tracking-wider font-semibold hover:shadow-lg transition-all text-center block mt-2"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

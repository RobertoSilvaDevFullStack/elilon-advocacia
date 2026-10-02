import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, AlertTriangle, ArrowRight } from "lucide-react";

const STORAGE_KEY = "diagnostico_popup_last_shown";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const DELAY_MS = 5000;

const DiagnosticoPopup: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const { pathname } = useLocation();

  const isOnDiagnosticoPage = pathname.startsWith("/diagnostico-reforma-tributaria");

  useEffect(() => {
    if (isOnDiagnosticoPage) return;

    const lastShown = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastShown && now - parseInt(lastShown, 10) < SEVEN_DAYS_MS) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(STORAGE_KEY, String(now));
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [isOnDiagnosticoPage]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-vinho-500" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Icon + badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
              Reforma Tributária 2026
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-headline font-bold text-neutral-900 mb-3 leading-tight">
            ⚠️ Sua empresa está preparada para a Reforma Tributária?
          </h2>

          <p className="text-neutral-600 text-sm leading-relaxed mb-6">
            Muitas empresas do Simples Nacional poderão perder competitividade
            sem uma análise adequada.
            <br />
            <br />
            Faça <strong>gratuitamente</strong> o diagnóstico e descubra como a
            Reforma Tributária pode impactar o seu negócio.
          </p>

          {/* Benefits */}
          <ul className="flex flex-col gap-2 mb-6">
            {[
              "Resultado imediato",
              "Diagnóstico gratuito e sem compromisso",
              "Análise para empresas do Simples Nacional",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-neutral-700">
                <span className="w-4 h-4 rounded-full bg-vinho-50 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-vinho-500 block" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              to="/diagnostico-reforma-tributaria"
              onClick={handleClose}
              className="w-full py-3.5 bg-gradient-to-r from-vinho-600 to-vermelho-600 text-white font-semibold text-sm uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-vinho-500/30 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              Fazer Diagnóstico
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleClose}
              className="w-full py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticoPopup;

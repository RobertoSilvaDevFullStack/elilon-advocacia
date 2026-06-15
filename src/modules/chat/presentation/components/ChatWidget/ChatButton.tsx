/**
 * ChatButton - Botão flutuante para abrir o chat
 * Atualizado: Ícone GIF, balão CTA, animações, posicionamento ajustado
 */

import React from "react";
import { X } from "lucide-react";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
  showCta?: boolean;
  onCloseCta?: () => void;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  onClick,
  isOpen,
  unreadCount = 0,
  showCta = false,
  onCloseCta,
}) => {
  return (
    <div
      className="fixed z-50 flex flex-col items-end"
      style={{ bottom: "120px", right: "24px" }}
    >
      {/* Balão de CTA */}
      {showCta && !isOpen && (
        <div
          className="mb-3 relative animate-cta-enter"
          style={{
            animation: "ctaEnter 0.5s ease-out forwards",
          }}
        >
          {/* Setinha do balão */}
          <div
            className="absolute -bottom-2 right-6 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid linear-gradient(135deg, #A1333E 0%, #812932 100%)",
            }}
          />

          {/* Conteúdo do balão */}
          <div
            className="px-4 py-3 rounded-xl shadow-lg relative"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
              boxShadow: "0 4px 20px rgba(161, 51, 62, 0.3)",
              minWidth: "200px",
            }}
          >
            {/* Botão fechar X */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseCta?.();
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>

            <p className="text-white text-sm font-medium text-center">
              ⚖️ Avalie seu caso gratuitamente
            </p>
          </div>
        </div>
      )}

      {/* Botão principal com GIF */}
      <button
        onClick={onClick}
        className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vinho-500 overflow-hidden animate-chat-pulse"
        style={{
          background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
          boxShadow: "0 4px 20px rgba(161, 51, 62, 0.4), 0 0 0 4px rgba(161, 51, 62, 0.1)",
        }}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white" />
        ) : (
          <img
            src="/images/apoio-suporte.gif"
            alt="Suporte Jurídico"
            className="w-12 h-12 object-cover rounded-full"
            style={{
              objectPosition: "center",
            }}
          />
        )}

        {/* Badge de notificações */}
        {!isOpen && unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full animate-badge-bounce"
            style={{ background: "#F74747" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Glow/Anel pulsante */}
        {!isOpen && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #F74747 100%)",
            }}
          />
        )}
      </button>

      {/* Estilos CSS inline para animações */}
      <style>{`
        @keyframes ctaEnter {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatPulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(161, 51, 62, 0.4), 0 0 0 4px rgba(161, 51, 62, 0.1);
          }
          50% {
            box-shadow: 0 4px 25px rgba(161, 51, 62, 0.5), 0 0 0 6px rgba(161, 51, 62, 0.15);
          }
        }

        @keyframes badgeBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-chat-pulse {
          animation: chatPulse 2s ease-in-out infinite;
        }

        .animate-badge-bounce {
          animation: badgeBounce 1s ease-in-out infinite;
        }

        /* Responsividade mobile */
        @media (max-width: 640px) {
          .animate-chat-pulse {
            animation: chatPulse 2s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
};

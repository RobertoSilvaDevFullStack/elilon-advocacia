/**
 * MessageList - Lista de mensagens com scroll
 * Atualizado: Sem tela vazia, indicador de digitação, botões de área e subárea
 */

import React, { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { AreaSelector } from "./AreaSelector";
import { SubareaSelector } from "./SubareaSelector";
import { Loader2 } from "lucide-react";
import type { MessageListProps, AreaJuridica, SubareaJuridica } from "../../types/chat.types";

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  isTyping = false,
  currentState,
  currentArea,
  onSelectArea,
  onSelectSubarea,
  showAreaButtons = false,
  showSubareaButtons = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Handler para seleção de área
  const handleAreaSelect = (area: AreaJuridica) => {
    onSelectArea?.(area);
  };

  // Handler para seleção de subárea
  const handleSubareaSelect = (subarea: SubareaJuridica) => {
    onSelectSubarea?.(subarea);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-2"
      style={{
        background: "#fafafa",
        scrollbarWidth: "thin",
        scrollbarColor: "#ddd transparent",
      }}
    >
      {/* Mensagens - sempre exibe, nunca tela vazia */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isUser={message.senderType === "USER"}
        />
      ))}

      {/* Indicador de digitação do assistente */}
      {isTyping && (
        <div className="flex items-start gap-2 mb-4">
          {/* Avatar do bot */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
            }}
          >
            <span className="text-white text-xs font-bold">E</span>
          </div>

          {/* Bolha de digitação */}
          <div
            className="px-4 py-3 rounded-2xl rounded-bl-none"
            style={{ background: "#f5f5f0" }}
          >
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "#A1333E", animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "#A1333E", animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "#A1333E", animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs">Assistente está digitando...</span>
            </div>
          </div>
        </div>
      )}

      {/* Botões de seleção de área - exibidos após mensagem inicial */}
      {showAreaButtons && !isTyping && onSelectArea && (
        <div className="flex items-start gap-2 mb-4">
          {/* Avatar do bot */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center invisible"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
            }}
          >
            <span className="text-white text-xs font-bold">E</span>
          </div>

          {/* Botões */}
          <AreaSelector
            onSelect={handleAreaSelect}
            disabled={loading}
          />
        </div>
      )}

      {/* Botões de seleção de subárea - exibidos após seleção de área */}
      {showSubareaButtons && !isTyping && onSelectSubarea && currentArea && (
        <div className="flex items-start gap-2 mb-4">
          {/* Avatar do bot */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center invisible"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
            }}
          >
            <span className="text-white text-xs font-bold">E</span>
          </div>

          {/* Botões de subárea */}
          <SubareaSelector
            area={currentArea}
            onSelect={handleSubareaSelect}
            disabled={loading}
          />
        </div>
      )}

      {/* Elemento âncora para scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
};


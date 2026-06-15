/**
 * ChatInput - Área de input do chat
 * Sprint 1: Input de texto com botão enviar
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, AlertCircle } from "lucide-react";
import type { ChatInputProps } from "../../types/chat.types";

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled,
  placeholder = "Digite sua mensagem...",
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent("");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="border-t p-4"
      style={{ background: "white", borderColor: "#e5e5e5" }}
    >
      {/* Aviso LGPD */}
      <div
        className="flex items-center gap-2 text-xs mb-3 p-2 rounded"
        style={{ background: "#f9f9f9", color: "#666" }}
      >
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>
          Ao continuar, você concorda com o tratamento dos seus dados conforme
          nossa{" "}
          <a
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            Política de Privacidade
          </a>
          .
        </span>
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Aguarde..." : placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
          style={{
            minHeight: "48px",
            maxHeight: "120px",
            focusRing: "#A1333E",
          }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !content.trim()}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          style={{
            background: disabled
              ? "#ccc"
              : "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
          }}
          aria-label="Enviar mensagem"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

/**
 * MessageList - Lista de mensagens com scroll
 * Atualizado: Sem tela vazia, indicador de digitação, botões de área e subárea
 */

import React, { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { AreaSelector } from "./AreaSelector";
import { SubareaSelector } from "./SubareaSelector";
import { Loader2, FileText, X, Upload, Paperclip } from "lucide-react";
import type { MessageListProps, AreaJuridica, SubareaJuridica } from "../../types/chat.types";
import { DOCUMENT_CONFIG, formatFileSize } from "../../utils/validation";

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
  // Sprint 3.4: Props para upload de documentos
  showDocumentOption = false,
  showDocumentUploader = false,
  documentErrors = [],
  onSelectDocumentOption,
  onDocumentUpload,
  onSkipDocumentUpload,
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

  // Sprint 3.4: Handler para seleção de opção de documentos
  const handleDocumentOption = (option: "UPLOAD_NOW" | "UPLOAD_LATER") => {
    onSelectDocumentOption?.(option);
  };

  // Sprint 3.4: Handler para arquivo selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDocumentUpload?.(e.target.files);
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

      {/* Sprint 3.4: Botões de opção de upload de documentos */}
      {showDocumentOption && !isTyping && onSelectDocumentOption && (
        <div className="flex items-start gap-2 mb-4">
          {/* Avatar do bot (invisível para alinhamento) */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center invisible"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
            }}
          >
            <span className="text-white text-xs font-bold">E</span>
          </div>

          {/* Botões de opção */}
          <div className="flex flex-col gap-2 w-full max-w-[280px]">
            <button
              onClick={() => handleDocumentOption("UPLOAD_NOW")}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
                color: "white",
                boxShadow: "0 2px 8px rgba(161, 51, 62, 0.3)",
              }}
            >
              <Paperclip className="w-4 h-4" />
              <span className="text-sm font-medium">Sim, quero enviar documentos</span>
            </button>

            <button
              onClick={() => handleDocumentOption("UPLOAD_LATER")}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-white border-2 disabled:opacity-50"
              style={{
                borderColor: "#A1333E",
                color: "#A1333E",
              }}
            >
              <span className="text-sm font-medium">Não, enviar depois</span>
            </button>
          </div>
        </div>
      )}

      {/* Sprint 3.4: Interface de upload de documentos */}
      {showDocumentUploader && !isTyping && onDocumentUpload && (
        <div className="flex items-start gap-2 mb-4">
          {/* Avatar do bot (invisível para alinhamento) */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center invisible"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
            }}
          >
            <span className="text-white text-xs font-bold">E</span>
          </div>

          {/* Interface de upload */}
          <div className="flex flex-col gap-3 w-full max-w-[320px] p-4 rounded-xl bg-white border"
            style={{ borderColor: "#e5e5e5" }}
          >
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Anexar documentos:</p>
              <p className="text-xs text-gray-400">
                Formatos: PDF, JPG, PNG, DOCX | Máx: {DOCUMENT_CONFIG.maxFiles} arquivos | {DOCUMENT_CONFIG.maxFileSize / (1024 * 1024)}MB cada
              </p>
            </div>

            {/* Input de arquivo oculto */}
            <input
              type="file"
              id="document-upload"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Botão de seleção de arquivos */}
            <label
              htmlFor="document-upload"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
                color: "white",
                boxShadow: "0 2px 8px rgba(161, 51, 62, 0.3)",
              }}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Selecionar arquivos</span>
            </label>

            {/* Botão de pular */}
            <button
              onClick={onSkipDocumentUpload}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Pular esta etapa
            </button>

            {/* Exibição de erros */}
            {documentErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs font-medium text-red-600 mb-1">Erros encontrados:</p>
                <ul className="text-xs text-red-500 space-y-1">
                  {documentErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elemento âncora para scroll */}
      <div ref={messagesEndRef} />
    </div>
  );
};


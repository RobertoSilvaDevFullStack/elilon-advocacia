/**
 * ChatWindow - Janela principal do chat
 * Sprint 1: Container que agrupa MessageList e ChatInput
 */

import React from "react";
import { X, Minimize2 } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { ChatWindowProps } from "../../types/chat.types";

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  session,
  messages,
  onSendMessage,
  loading,
  isTyping,
  currentState,
  currentArea,
  onSelectArea,
  onSelectSubarea,
  showAreaButtons,
  showSubareaButtons,
  // Sprint 3.4: Props para upload de documentos
  showDocumentOption,
  showDocumentUploader,
  documentErrors,
  onSelectDocumentOption,
  onDocumentUpload,
  onSkipDocumentUpload,
}) => {
  if (!isOpen) return null;

  // Mensagem de protocolo quando sessão fechada
  const isClosed = session?.currentState === "CLOSED" || session?.closedAt;

  return (
    <div
      className="fixed z-50 flex flex-col overflow-hidden shadow-2xl"
      style={{
        bottom: "100px",
        right: "24px",
        width: "380px",
        maxWidth: "calc(100vw - 48px)",
        height: "600px",
        maxHeight: "calc(100vh - 140px)",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #200A0C 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar do escritório */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #A1333E 0%, #F74747 100%)",
            }}
          >
            <span className="text-white font-bold text-sm">EL</span>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm">
              Elilon Lopes Advogados
            </h3>
            <p className="text-gray-400 text-xs">Atendimento Jurídico</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Minimizar"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Protocolo (se sessão fechada) */}
      {isClosed && session?.protocolNumber && (
        <div
          className="px-4 py-3 border-b"
          style={{ background: "#f0fdf4", borderColor: "#86efac" }}
        >
          <p className="text-sm text-green-800">
            <strong>Protocolo:</strong> {session.protocolNumber}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Anote este número para referência futura.
          </p>
        </div>
      )}

      {/* Lista de mensagens */}
      <MessageList
        messages={messages}
        loading={loading}
        isTyping={isTyping}
        currentState={currentState}
        currentArea={currentArea}
        onSelectArea={onSelectArea}
        onSelectSubarea={onSelectSubarea}
        showAreaButtons={showAreaButtons}
        showSubareaButtons={showSubareaButtons}
        showDocumentOption={showDocumentOption}
        showDocumentUploader={showDocumentUploader}
        documentErrors={documentErrors}
        onSelectDocumentOption={onSelectDocumentOption}
        onDocumentUpload={onDocumentUpload}
        onSkipDocumentUpload={onSkipDocumentUpload}
      />

      {/* Input (desabilitado se sessão fechada) */}
      {!isClosed ? (
        <ChatInput
          onSend={onSendMessage}
          disabled={loading}
          placeholder="Digite sua mensagem..."
        />
      ) : (
        <div
          className="border-t px-4 py-4 text-center"
          style={{ background: "#f9fafb" }}
        >
          <p className="text-sm text-gray-600">
            Atendimento encerrado. Obrigado pelo contato!
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Nossa equipe entrará em contato em breve.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MessageBubble - Balão de mensagem individual
 * Sprint 1: Estilização básica para usuário e bot
 */

import React from "react";
import type { MessageBubbleProps } from "../../types/chat.types";

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar do bot */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-2"
          style={{
            background: "linear-gradient(135deg, #A1333E 0%, #812932 100%)",
          }}
        >
          <span className="text-white text-xs font-bold">E</span>
        </div>
      )}

      {/* Conteúdo da mensagem */}
      <div className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "rounded-br-none"
              : "rounded-bl-none"
          }`}
          style={{
            background: isUser
              ? "linear-gradient(135deg, #A1333E 0%, #812932 100%)"
              : "#f5f5f0",
            color: isUser ? "white" : "#1a1a1a",
          }}
        >
          {message.contentHtml ? (
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: message.contentHtml }}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`text-xs mt-1 block ${
            isUser ? "text-right" : "text-left"
          }`}
          style={{ color: "#666" }}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

/**
 * AreaSelector - Botões de seleção de área jurídica
 * Sprint 1: Qualificação inicial local
 */

import React from "react";
import { AreaJuridica, AREAS_JURIDICAS } from "../../types/chat.types";

interface AreaSelectorProps {
  onSelect: (area: AreaJuridica) => void;
  disabled?: boolean;
}

export const AreaSelector: React.FC<AreaSelectorProps> = ({
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {AREAS_JURIDICAS.map((area) => (
        <button
          key={area.id}
          onClick={() => !disabled && onSelect(area.id)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-white border-2 border-vinho-500 text-vinho-700 hover:bg-vinho-50 hover:scale-105 active:scale-95 shadow-sm"
            }
          `}
          style={{
            borderColor: disabled ? undefined : "#A1333E",
            color: disabled ? undefined : "#A1333E",
          }}
        >
          <span className="text-lg">{area.emoji}</span>
          <span>{area.label}</span>
        </button>
      ))}
    </div>
  );
};

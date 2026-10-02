/**
 * SubareaSelector - Botões de seleção de subárea jurídica
 * Sprint 2: Seleção de subárea dinâmica por área
 */

import React from "react";
import {
  SubareaJuridica,
  AreaJuridica,
  SUBAREAS_JURIDICAS,
} from "../../types/chat.types";

interface SubareaSelectorProps {
  area: AreaJuridica;
  onSelect: (subarea: SubareaJuridica) => void;
  disabled?: boolean;
}

export const SubareaSelector: React.FC<SubareaSelectorProps> = ({
  area,
  onSelect,
  disabled = false,
}) => {
  const subareas = SUBAREAS_JURIDICAS[area];

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {subareas.map((subarea) => (
        <button
          key={subarea.id}
          onClick={() => !disabled && onSelect(subarea.id)}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
            transition-all duration-200
            ${disabled
              ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-white border-2 text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 shadow-sm"
            }
          `}
          style={{
            borderColor: disabled ? undefined : "#A1333E",
            color: disabled ? undefined : "#374151",
          }}
        >
          <span>{subarea.label}</span>
        </button>
      ))}
    </div>
  );
};

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "/br-states.json";

const markers = [
  // MINAS GERAIS
  { name: "Belo Horizonte - MG", coordinates: [-43.934, -19.916] },
  { name: "Contagem - MG", coordinates: [-44.054, -19.932] },
  { name: "Montes Claros - MG", coordinates: [-43.864, -16.712] },
  { name: "Janaúba - MG", coordinates: [-43.309, -15.801] },
  { name: "Visconde do Rio Branco - MG", coordinates: [-42.839, -21.011] },
  { name: "Governador Valadares - MG", coordinates: [-41.949, -18.851] },
  { name: "São João da Ponte - MG", coordinates: [-44.007, -15.933] },

  // RIO DE JANEIRO
  { name: "Petrópolis - RJ", coordinates: [-43.179, -22.505] },
  { name: "Duque de Caxias - RJ", coordinates: [-43.306, -22.786] },
  { name: "Macaé - RJ", coordinates: [-41.787, -22.371] },
  { name: "Campos dos Goytacazes - RJ", coordinates: [-41.323, -21.764] },

  // SÃO PAULO
  { name: "Piracicaba - SP", coordinates: [-47.649, -22.725] },
  { name: "São Carlos - SP", coordinates: [-47.891, -22.009] },
  { name: "Campinas - SP", coordinates: [-47.062, -22.907] },
  { name: "Araçatuba - SP", coordinates: [-50.433, -21.209] },
  { name: "Marília - SP", coordinates: [-49.946, -22.214] },
  { name: "Paulínia - SP", coordinates: [-47.154, -22.761] },
  { name: "Avaré - SP", coordinates: [-48.926, -23.099] },
  { name: "Osasco - SP", coordinates: [-46.792, -23.532] },
  { name: "Valinhos - SP", coordinates: [-46.996, -22.97] },

  // MATO GROSSO
  { name: "Cuiabá - MT", coordinates: [-56.097, -15.601] },

  // MATO GROSSO DO SUL
  { name: "Ponta Porã - MS", coordinates: [-55.726, -22.536] },

  // ESPÍRITO SANTO
  { name: "São Mateus - ES", coordinates: [-39.859, -18.716] },

  // BAHIA
  { name: "Feira de Santana - BA", coordinates: [-38.966, -12.266] },
  { name: "Porto Seguro - BA", coordinates: [-39.066, -16.444] },

  // RIO GRANDE DO SUL
  { name: "Porto Alegre - RS", coordinates: [-51.217, -30.034] },

  // SANTA CATARINA
  { name: "Florianópolis - SC", coordinates: [-48.548, -27.595] },

  // PERNAMBUCO
  { name: "Olinda - PE", coordinates: [-34.855, -8.009] },

  // RORAIMA
  { name: "Boa Vista - RR", coordinates: [-60.673, 2.824] },

  // PARANÁ
  { name: "Curitiba - PR", coordinates: [-49.273, -25.428] },
];

export const BrazilMap: React.FC = () => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMarkerHover = (name: string, event: React.MouseEvent) => {
    setHoveredMarker(name);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="w-full h-[500px] border-2 border-accent-500/20 bg-gradient-to-br from-navy-900 via-navy-800 to-accent-900 rounded-lg overflow-hidden relative shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 750,
          center: [-50, -15],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255, 255, 255, 0.1)"
                  stroke="#A1333E"
                  strokeWidth={1}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      fill: "rgba(161, 51, 62, 0.3)",
                      outline: "none",
                      transition: "all 0.3s ease",
                    },
                    pressed: {
                      fill: "rgba(161, 51, 62, 0.5)",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ name, coordinates }, index) => (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              {/* Pulsing ring animation */}
              <circle
                r={8}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2}
                opacity={hoveredMarker === name ? 1 : 0.5}
                className="animate-ping pointer-events-none"
                style={{
                  animationDuration: "2s",
                  animationDelay: `${index * 0.1}s`,
                }}
              />
              {/* Main marker */}
              <circle
                r={5}
                fill="#F59E0B"
                stroke="#FFF"
                strokeWidth={2}
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter:
                    hoveredMarker === name
                      ? "drop-shadow(0 0 8px #F59E0B)"
                      : "none",
                  transform: hoveredMarker === name ? "scale(1.5)" : "scale(1)",
                }}
                onMouseEnter={(e) => handleMarkerHover(name, e)}
                onMouseMove={(e) =>
                  setTooltipPos({ x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setHoveredMarker(null)}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Custom Tooltip */}
      {hoveredMarker && (
        <div
          className="fixed z-50 bg-accent-600 text-white px-4 py-2 rounded-lg shadow-xl font-semibold text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          {hoveredMarker}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-accent-600"></div>
        </div>
      )}

      {/* Info badge */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border-l-4 border-accent-500">
        <p className="text-xs font-bold text-accent-600 mb-1">
          PRESENÇA NACIONAL
        </p>
        <p className="text-xs text-neutral-600">
          Arraste para mover • Scroll para zoom
        </p>
      </div>

      {/* Stats badge */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <p className="text-2xl font-bold text-accent-600">{markers.length}</p>
        <p className="text-xs text-neutral-600 font-semibold">
          Cidades Atendidas
        </p>
      </div>
    </div>
  );
};

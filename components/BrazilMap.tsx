import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { ZoomIn, ZoomOut, MapPin, RotateCcw, Maximize2 } from "lucide-react";

const geoUrl = "/br-states.json";

// Centro geográfico otimizado do Brasil
const BRAZIL_CENTER: [number, number] = [-54, -14];
const INITIAL_SCALE = 850;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const markers = [
  // MINAS GERAIS
  {
    name: "Belo Horizonte - MG",
    coordinates: [-43.934, -19.916],
    region: "Sudeste",
  },
  { name: "Contagem - MG", coordinates: [-44.054, -19.932], region: "Sudeste" },
  {
    name: "Montes Claros - MG",
    coordinates: [-43.864, -16.712],
    region: "Sudeste",
  },
  { name: "Janaúba - MG", coordinates: [-43.309, -15.801], region: "Sudeste" },
  {
    name: "Visconde do Rio Branco - MG",
    coordinates: [-42.839, -21.011],
    region: "Sudeste",
  },
  {
    name: "Governador Valadares - MG",
    coordinates: [-41.949, -18.851],
    region: "Sudeste",
  },
  {
    name: "São João da Ponte - MG",
    coordinates: [-44.007, -15.933],
    region: "Sudeste",
  },

  // RIO DE JANEIRO
  {
    name: "Petrópolis - RJ",
    coordinates: [-43.179, -22.505],
    region: "Sudeste",
  },
  {
    name: "Duque de Caxias - RJ",
    coordinates: [-43.306, -22.786],
    region: "Sudeste",
  },
  { name: "Macaé - RJ", coordinates: [-41.787, -22.371], region: "Sudeste" },
  {
    name: "Campos dos Goytacazes - RJ",
    coordinates: [-41.323, -21.764],
    region: "Sudeste",
  },

  // SÃO PAULO
  {
    name: "Piracicaba - SP",
    coordinates: [-47.649, -22.725],
    region: "Sudeste",
  },
  {
    name: "São Carlos - SP",
    coordinates: [-47.891, -22.009],
    region: "Sudeste",
  },
  { name: "Campinas - SP", coordinates: [-47.062, -22.907], region: "Sudeste" },
  {
    name: "Araçatuba - SP",
    coordinates: [-50.433, -21.209],
    region: "Sudeste",
  },
  { name: "Marília - SP", coordinates: [-49.946, -22.214], region: "Sudeste" },
  { name: "Paulínia - SP", coordinates: [-47.154, -22.761], region: "Sudeste" },
  { name: "Avaré - SP", coordinates: [-48.926, -23.099], region: "Sudeste" },
  { name: "Osasco - SP", coordinates: [-46.792, -23.532], region: "Sudeste" },
  { name: "Valinhos - SP", coordinates: [-46.996, -22.97], region: "Sudeste" },

  // MATO GROSSO
  {
    name: "Cuiabá - MT",
    coordinates: [-56.097, -15.601],
    region: "Centro-Oeste",
  },

  // MATO GROSSO DO SUL
  {
    name: "Ponta Porã - MS",
    coordinates: [-55.726, -22.536],
    region: "Centro-Oeste",
  },

  // ESPÍRITO SANTO
  {
    name: "São Mateus - ES",
    coordinates: [-39.859, -18.716],
    region: "Sudeste",
  },

  // BAHIA
  {
    name: "Feira de Santana - BA",
    coordinates: [-38.966, -12.266],
    region: "Nordeste",
  },
  {
    name: "Porto Seguro - BA",
    coordinates: [-39.066, -16.444],
    region: "Nordeste",
  },

  // RIO GRANDE DO SUL
  { name: "Porto Alegre - RS", coordinates: [-51.217, -30.034], region: "Sul" },

  // SANTA CATARINA
  {
    name: "Florianópolis - SC",
    coordinates: [-48.548, -27.595],
    region: "Sul",
  },

  // PERNAMBUCO
  { name: "Olinda - PE", coordinates: [-34.855, -8.009], region: "Nordeste" },

  // RORAIMA
  { name: "Boa Vista - RR", coordinates: [-60.673, 2.824], region: "Norte" },

  // PARANÁ
  { name: "Curitiba - PR", coordinates: [-49.273, -25.428], region: "Sul" },
];

interface TooltipState {
  name: string;
  region: string;
  x: number;
  y: number;
}

export const BrazilMap: React.FC = () => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>(BRAZIL_CENTER);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Contar cidades por região
  const regionCounts = markers.reduce(
    (acc, marker) => {
      acc[marker.region] = (acc[marker.region] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Redimensionamento responsivo
  const handleResize = useCallback(() => {
    if (mapContainerRef.current) {
      // Força re-renderização para ajustar o mapa ao container
      setCenter([...BRAZIL_CENTER]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleMarkerHover = useCallback(
    (name: string, region: string, event: React.MouseEvent) => {
      setHoveredMarker(name);
      setTooltip({
        name,
        region,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [],
  );

  const handleMarkerLeave = useCallback(() => {
    setHoveredMarker(null);
    setTooltip(null);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.4, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.4, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setCenter([...BRAZIL_CENTER]);
    setActiveRegion(null);
  }, []);

  const handleRegionFilter = useCallback((region: string) => {
    setActiveRegion((prev) => (prev === region ? null : region));
  }, []);

  // Filtrar marcadores por região ativa
  const filteredMarkers = activeRegion
    ? markers.filter((m) => m.region === activeRegion)
    : markers;

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] relative rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      {/* Background Pattern Premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-vinho-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-vinho-600/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Lines Elegantes */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Mapa SVG */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <ComposableMap
          projection="geoMercator"
          role="img"
          aria-label="Mapa de atuação nacional do escritório no Brasil"
          projectionConfig={{
            scale: INITIAL_SCALE,
            center: BRAZIL_CENTER,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            disablePanning
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    role="presentation"
                    tabIndex={-1}
                    aria-hidden="true"
                    fill="rgba(26, 26, 46, 0.6)"
                    stroke="rgba(161, 51, 62, 0.4)"
                    strokeWidth={0.8}
                    style={{
                      default: {
                        outline: "none",
                        transition: "fill 0.2s ease",
                      },
                      hover: {
                        fill: "rgba(161, 51, 62, 0.35)",
                        outline: "none",
                        cursor: "default",
                      },
                      pressed: {
                        fill: "rgba(161, 51, 62, 0.4)",
                        outline: "none",
                      },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Marcadores */}
            {filteredMarkers.map(({ name, coordinates, region }, index) => {
              const isHovered = hoveredMarker === name;
              const isDimmed = activeRegion && activeRegion !== region;

              return (
                <Marker
                  key={name}
                  coordinates={coordinates as [number, number]}
                >
                  <g
                    className="cursor-pointer"
                    onMouseEnter={(e) => handleMarkerHover(name, region, e)}
                    onMouseLeave={handleMarkerLeave}
                    style={{
                      opacity: isDimmed ? 0.3 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {/* Anel pulsante */}
                    <circle
                      r={12}
                      fill="none"
                      stroke="#A1333E"
                      strokeWidth={1.5}
                      opacity={isHovered ? 0.8 : 0.4}
                      style={{
                        animation: `pulse 2s ease-out ${index * 0.05}s infinite`,
                      }}
                    />

                    {/* Círculo externo */}
                    <circle
                      r={8}
                      fill="rgba(161, 51, 62, 0.2)"
                      stroke="#A1333E"
                      strokeWidth={1}
                      style={{
                        transform: isHovered ? "scale(1.3)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "transform 0.3s ease",
                      }}
                    />

                    {/* Marcador principal */}
                    <circle
                      r={5}
                      fill={isHovered ? "#F59E0B" : "#A1333E"}
                      stroke="#FFF"
                      strokeWidth={2}
                      style={{
                        filter: isHovered
                          ? "drop-shadow(0 0 12px rgba(245, 158, 11, 0.8))"
                          : "drop-shadow(0 0 4px rgba(161, 51, 62, 0.5))",
                        transform: isHovered ? "scale(1.5)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Tooltip Glassmorphism */}
      {tooltip && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 16,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="relative bg-white/95 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-vinho-500" />
              <span className="text-xs font-semibold text-vinho-600 uppercase tracking-wider">
                {tooltip.region}
              </span>
            </div>
            <p className="text-sm font-bold text-neutral-800 whitespace-nowrap">
              {tooltip.name}
            </p>
            <div className="absolute left-1/2 -bottom-1 w-3 h-3 bg-white/95 border-r border-b border-white/20 transform -translate-x-1/2 rotate-45" />
          </div>
        </div>
      )}

      {/* Controles de Zoom - Estilo Premium */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 flex flex-col gap-1.5 sm:gap-2 z-20">
        <div className="bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-white/20 shadow-xl">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-white/90 hover:bg-vinho-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:text-inherit transition-all duration-200 shadow-sm group"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-vinho-600 group-hover:text-white transition-colors" />
          </button>
          <div className="h-px bg-white/20 my-1.5 sm:my-2 mx-1" />
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-white/90 hover:bg-vinho-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/90 disabled:hover:text-inherit transition-all duration-200 shadow-sm group"
            title="Diminuir zoom"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5 text-vinho-600 group-hover:text-white transition-colors" />
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-vinho-500 hover:border-vinho-500 shadow-xl transition-all duration-200 group"
          title="Resetar visualização"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* Stats Card - Glassmorphism */}
      <div className="absolute top-3 left-3 sm:top-6 sm:left-6 z-20 max-w-[calc(100%-6rem)] sm:max-w-none">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-vinho-500 to-vinho-600 flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {markers.length}
              </p>
              <p className="text-[10px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                Cidades Atendidas
              </p>
            </div>
          </div>

          {/* Regiões - Scroll horizontal em mobile */}
          <div className="flex flex-wrap sm:flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
            {Object.entries(regionCounts).map(([region, count]) => (
              <button
                key={region}
                onClick={() => handleRegionFilter(region)}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeRegion === region
                    ? "bg-vinho-500 text-white shadow-lg"
                    : activeRegion
                      ? "bg-white/5 text-white/40"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {region} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Card - Bottom Right - Hidden em mobile muito pequeno */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-20 max-w-[180px] sm:max-w-xs hidden sm:block">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Maximize2 className="w-4 h-4 text-vinho-400" />
            <p className="text-sm font-bold text-white">Presença Nacional</p>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Atuamos estrategicamente em todo o território brasileiro, com
            escritório sede em Montes Claros - MG.
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
            <div className="flex -space-x-2">
              {["Sudeste", "Sul", "Nordeste", "Centro-Oeste", "Norte"].map(
                (region, i) => (
                  <div
                    key={region}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-vinho-400 to-vinho-600 border-2 border-white/20 flex items-center justify-center"
                    style={{ zIndex: 5 - i }}
                    title={region}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {region[0]}
                    </span>
                  </div>
                ),
              )}
            </div>
            <span className="text-xs text-white/60 ml-2">5 Regiões</span>
          </div>
        </div>
      </div>

      {/* Escala visual - Ajustado para mobile */}
      <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-20">
        <div className="flex items-end gap-0.5 sm:gap-1">
          <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-white/40" />
          <div className="w-0.5 sm:w-1 h-3 sm:h-5 bg-white/40" />
          <div className="w-0.5 sm:w-1 h-5 sm:h-8 bg-white/40" />
          <div className="w-0.5 sm:w-1 h-7 sm:h-12 bg-white/40" />
          <div className="w-0.5 sm:w-1 h-10 sm:h-16 bg-vinho-500/80" />
          <span className="text-[10px] sm:text-xs text-white/50 ml-1.5 sm:ml-2 mb-0.5">
            Atuação
          </span>
        </div>
      </div>

      {/* Indicador de Zoom */}
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1 sm:py-1.5">
          <span className="text-[10px] sm:text-xs text-white/80 font-medium">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Keyframes CSS para animações */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

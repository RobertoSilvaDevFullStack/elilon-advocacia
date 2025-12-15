import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip"; // Ensure react-tooltip v5 usage

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
  const [content, setContent] = useState("");

  return (
    <div className="w-full h-[500px] border border-neutral-200 bg-neutral-50 rounded-lg overflow-hidden relative">
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
                  fill="#E5E5E5"
                  stroke="#D4D4D4"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#F5F5F5", outline: "none" },
                    pressed: { fill: "#E5E5E5", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ name, coordinates }) => (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              <circle
                r={4}
                fill="#D4AF37"
                stroke="#fff"
                strokeWidth={1}
                className="cursor-pointer hover:scale-125 transition-transform duration-300"
                data-tooltip-id="my-tooltip"
                data-tooltip-content={name}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip id="my-tooltip" />
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 text-xs text-neutral-500 rounded backdrop-blur-sm">
        Use o mouse para mover e zoom
      </div>
    </div>
  );
};

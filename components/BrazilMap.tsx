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
  { name: "Montes Claros - MG", coordinates: [-43.864, -16.712] },
  { name: "Belo Horizonte - MG", coordinates: [-43.934, -19.916] },
  { name: "São Paulo - SP", coordinates: [-46.633, -23.55] },
  { name: "Rio de Janeiro - RJ", coordinates: [-43.172, -22.906] },
  { name: "Brasília - DF", coordinates: [-47.921, -15.826] },
  { name: "Salvador - BA", coordinates: [-38.501, -12.977] },
  { name: "Curitiba - PR", coordinates: [-49.273, -25.428] },
  { name: "Porto Alegre - RS", coordinates: [-51.217, -30.034] },
  { name: "Recife - PE", coordinates: [-34.877, -8.047] },
  { name: "Goiânia - GO", coordinates: [-49.264, -16.686] },
  { name: "Fortaleza - CE", coordinates: [-38.543, -3.717] },
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

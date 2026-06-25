import React, { Suspense } from "react";

/** Code-split do mapa — react-simple-maps só carrega abaixo da dobra. */
const BrazilMap = React.lazy(() =>
  import("./BrazilMap").then((m) => ({ default: m.BrazilMap })),
);

const MapSkeleton: React.FC = () => (
  <div
    className="w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] animate-pulse"
    role="img"
    aria-label="Carregando mapa de atuação nacional"
  />
);

export const LazyBrazilMap: React.FC = () => (
  <Suspense fallback={<MapSkeleton />}>
    <BrazilMap />
  </Suspense>
);

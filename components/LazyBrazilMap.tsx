import React, { Suspense } from "react";
import { useInView } from "../hooks/useInView";

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

/** Mapa só carrega quando a seção entra no viewport — evita maps-vendor na carga inicial. */
export const LazyBrazilMap: React.FC = () => {
  const { ref, inView } = useInView("200px");

  return (
    <div ref={ref} className="w-full min-h-[400px]">
      {inView ? (
        <Suspense fallback={<MapSkeleton />}>
          <BrazilMap />
        </Suspense>
      ) : (
        <MapSkeleton />
      )}
    </div>
  );
};

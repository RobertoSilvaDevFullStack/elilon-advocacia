import React from "react";

interface MobilePortraitImageProps {
  src: string;
  alt: string;
  objectPosition?: string;
  className?: string;
  /** center = acima do texto; float = ao lado, texto desce ao redor */
  layout?: "center" | "float";
}

/** Circular portrait for mobile — hidden on md+. */
export const MobilePortraitImage: React.FC<MobilePortraitImageProps> = ({
  src,
  alt,
  objectPosition = "center 20%",
  className = "",
  layout = "center",
}) => {
  const portrait = (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-accent-500/25 shadow-lg shadow-accent-500/10">
      <img
        src={src}
        alt={alt}
        width={128}
        height={128}
        className="w-full h-full object-cover scale-110"
        style={{ objectPosition }}
      />
    </div>
  );

  if (layout === "float") {
    return (
      <div className={`md:hidden float-left mr-4 mb-2 ${className}`}>
        {portrait}
      </div>
    );
  }

  return (
    <div className={`md:hidden flex justify-center my-6 ${className}`}>
      {portrait}
    </div>
  );
};

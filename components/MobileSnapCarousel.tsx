import React from "react";

interface MobileSnapCarouselProps {
  children: React.ReactNode;
  className?: string;
  slideClassName?: string;
}

/** Horizontal snap carousel — mobile only; desktop uses sibling grid. */
export const MobileSnapCarousel: React.FC<MobileSnapCarouselProps> = ({
  children,
  className = "",
  slideClassName = "w-[85vw] max-w-sm",
}) => {
  const slides = React.Children.toArray(children);

  return (
    <div
      className={`md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}
    >
      {slides.map((slide, index) => (
        <div key={index} className={`snap-center shrink-0 ${slideClassName}`}>
          {slide}
        </div>
      ))}
    </div>
  );
};
